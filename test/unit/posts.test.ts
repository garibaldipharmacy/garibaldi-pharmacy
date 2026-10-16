import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { closeDb, getDb } from "~~/server/utils/db";
import {
  currentAnnouncement,
  deletePost,
  getPost,
  getPublicPost,
  listAdminPosts,
  listBlogPage,
  publishedCategories,
  savePost,
  toMatchQuery,
} from "~~/server/utils/posts";
import {
  announcementState,
  slugify,
  validatePostInput,
  type PostInput,
} from "~~/shared/posts";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "gp-posts-"));
  process.env.DATABASE_PATH = join(dir, "test.db");
  closeDb();
});

afterEach(() => {
  closeDb();
  rmSync(dir, { recursive: true, force: true });
});

const body = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

function post(overrides: Partial<PostInput> = {}): PostInput {
  return {
    title: "Flu shots are here",
    slug: "flu-shots-are-here",
    excerpt: "",
    coverImage: null,
    coverAlt: "",
    category: "vaccines",
    body: body("Book yours today at the pharmacy."),
    status: "published",
    announcement: null,
    ...overrides,
  };
}

const window = (startsAt: string, endsAt: string, snippet = "Flu shots now available") => ({
  snippet,
  startsAt,
  endsAt,
});

function saved(result: ReturnType<typeof savePost>): string {
  if (!result.ok) throw new Error(`save failed: ${result.reason}`);
  return result.id;
}

describe("slugify", () => {
  it("makes a readable address from a title", () => {
    expect(slugify("Why is Ozempic useful for you?")).toBe("why-is-ozempic-useful-for-you");
    expect(slugify("Flu & COVID shots: what’s new")).toBe("flu-and-covid-shots-whats-new");
    expect(slugify("Café hours")).toBe("cafe-hours");
  });
});

describe("validatePostInput", () => {
  it("accepts a minimal draft and fills in the slug", () => {
    const result = validatePostInput({ title: "Hello there", body: { type: "doc" } });
    expect(result.ok && result.value.slug).toBe("hello-there");
    expect(result.ok && result.value.status).toBe("draft");
  });

  it("won't publish an empty post", () => {
    const result = validatePostInput({ title: "Hi", status: "published", body: { type: "doc" } });
    expect(!result.ok && result.errors.body).toBeTruthy();
  });

  it("caps the announcement line so it fits the pill", () => {
    const result = validatePostInput({
      ...post(),
      announcement: window("2026-01-01T00:00:00Z", "2026-01-02T00:00:00Z", "x".repeat(71)),
    });
    expect(!result.ok && result.errors.snippet).toBeTruthy();
  });

  it("needs the announcement to end after it starts", () => {
    const result = validatePostInput({
      ...post(),
      announcement: window("2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z"),
    });
    expect(!result.ok && result.errors.endsAt).toBeTruthy();
  });

  it("only takes cover pictures uploaded through the editor", () => {
    const result = validatePostInput({
      ...post(),
      coverImage: "https://example.com/a.jpg",
      coverAlt: "A",
    });
    expect(!result.ok && result.errors.coverImage).toBeTruthy();
  });

  it("asks for a description of the cover picture", () => {
    const result = validatePostInput({
      ...post(),
      coverImage: "/media/0b0f8a5e-5d0c-4c47-9d0e-3f6b1f2a7c11.jpg",
    });
    expect(!result.ok && result.errors.coverAlt).toBeTruthy();
  });
});

describe("announcementState", () => {
  const w = { startsAt: "2026-02-14T17:00:00Z", endsAt: "2026-02-17T17:00:00Z" };
  it("is scheduled, active, then ended", () => {
    expect(announcementState(w, Date.parse("2026-02-14T16:59:00Z"))).toBe("scheduled");
    expect(announcementState(w, Date.parse("2026-02-14T17:00:00Z"))).toBe("active");
    expect(announcementState(w, Date.parse("2026-02-17T17:00:00Z"))).toBe("ended");
  });
});

describe("posts", () => {
  it("saves, renders and lists a post", () => {
    const id = saved(savePost(null, post()));
    const stored = getPost(id)!;
    expect(stored.title).toBe("Flu shots are here");
    expect(stored.publishedAt).toBeTruthy();

    const visible = getPublicPost("flu-shots-are-here")!;
    expect(visible.html).toBe("<p>Book yours today at the pharmacy.</p>");
    // No excerpt given, so the start of the post stands in
    expect(visible.summary).toBe("Book yours today at the pharmacy.");
  });

  it("keeps drafts out of public view except in a preview", () => {
    saved(savePost(null, post({ status: "draft" })));
    expect(listBlogPage({}, 12).posts).toHaveLength(0);
    expect(getPublicPost("flu-shots-are-here")).toBeUndefined();
    expect(getPublicPost("flu-shots-are-here", { includeDrafts: true })?.isDraft).toBe(true);
  });

  it("refuses a web address another post already has", () => {
    saved(savePost(null, post()));
    expect(savePost(null, post({ title: "Other" }))).toEqual({
      ok: false,
      reason: "slug_taken",
    });
  });

  it("keeps the first publish date through unpublishing and republishing", () => {
    const id = saved(savePost(null, post(), new Date("2026-01-01T00:00:00Z")));
    savePost(id, post({ status: "draft" }), new Date("2026-02-01T00:00:00Z"));
    savePost(id, post(), new Date("2026-03-01T00:00:00Z"));
    expect(getPost(id)!.publishedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("deletes", () => {
    const id = saved(savePost(null, post()));
    expect(deletePost(id)).toBe(true);
    expect(listAdminPosts({}, 25).total).toBe(0);
  });
});

describe("announcements", () => {
  const starts = "2026-02-14T17:00:00.000Z";
  const ends = "2026-02-17T17:00:00.000Z";

  it("is featured only inside its window", () => {
    saved(savePost(null, post({ announcement: window(starts, ends) })));
    expect(currentAnnouncement(new Date("2026-02-14T16:00:00Z"))).toBeNull();
    expect(currentAnnouncement(new Date("2026-02-15T00:00:00Z"))).toEqual({
      snippet: "Flu shots now available",
      slug: "flu-shots-are-here",
    });
    expect(currentAnnouncement(new Date("2026-02-17T17:00:00Z"))).toBeNull();
  });

  it("stays on the blog after it ends", () => {
    saved(savePost(null, post({ announcement: window(starts, ends) })));
    const after = Date.parse("2026-03-01T00:00:00Z");
    expect(listBlogPage({ now: after }, 12).posts).toMatchObject([{ isAnnouncement: false }]);
    expect(listBlogPage({ now: Date.parse("2026-02-15T00:00:00Z") }, 12).posts).toMatchObject([
      { isAnnouncement: true },
    ]);
  });

  it("isn't featured while its post is a draft", () => {
    saved(savePost(null, post({ status: "draft", announcement: window(starts, ends) })));
    expect(currentAnnouncement(new Date("2026-02-15T00:00:00Z"))).toBeNull();
  });

  it("moves to the newest post given it, so there's only ever one", () => {
    const first = saved(savePost(null, post({ announcement: window(starts, ends) })));
    const second = saved(
      savePost(
        null,
        post({
          title: "Closed for Family Day",
          slug: "closed-for-family-day",
          announcement: window(starts, ends, "Closed Monday for Family Day"),
        }),
      ),
    );

    expect(getPost(first)!.announcement).toBeNull();
    expect(getPost(second)!.announcement?.snippet).toBe("Closed Monday for Family Day");
    expect(currentAnnouncement(new Date("2026-02-15T00:00:00Z"))?.slug).toBe(
      "closed-for-family-day",
    );
  });

  it("is guarded by the database too, not only the code", () => {
    saved(savePost(null, post({ announcement: window(starts, ends) })));
    const second = saved(savePost(null, post({ title: "Other", slug: "other" })));
    expect(() =>
      getDb()
        .prepare("UPDATE posts SET announcement_snippet = 'x' WHERE id = ?")
        .run(second),
    ).toThrow(/UNIQUE/);
  });

  it("can be resaved on the same post", () => {
    const id = saved(savePost(null, post({ announcement: window(starts, ends) })));
    saved(savePost(id, post({ announcement: window(starts, ends, "Updated line") })));
    expect(getPost(id)!.announcement?.snippet).toBe("Updated line");
  });
});

describe("category", () => {
  it("must be one from the list", () => {
    const result = validatePostInput({ ...post(), category: "gossip" });
    expect(!result.ok && result.errors.category).toBeTruthy();
  });

  it("only lists categories that have published posts", () => {
    saved(savePost(null, post({ category: "vaccines" })));
    saved(savePost(null, post({ slug: "draft-one", category: "compounding", status: "draft" })));
    expect(publishedCategories()).toEqual(["vaccines"]);
  });
});

describe("blog pages", () => {
  // 30 published posts a day apart, newest first: post-29 … post-0
  function seed(count = 30) {
    for (let n = 0; n < count; n++) {
      savePost(
        null,
        post({
          title: `Post ${n}`,
          slug: `post-${n}`,
          category: n % 3 === 0 ? "news" : "health-tips",
        }),
        new Date(Date.UTC(2026, 0, 1 + n)),
      );
    }
  }

  it("splits posts into pages, newest first", () => {
    seed();
    const first = listBlogPage({ page: 1 }, 12);
    expect(first.total).toBe(30);
    expect(first.pageCount).toBe(3);
    expect(first.posts.map((p) => p.slug).slice(0, 2)).toEqual(["post-29", "post-28"]);

    const last = listBlogPage({ page: 3 }, 12);
    expect(last.posts).toHaveLength(6);
    expect(last.posts.at(-1)?.slug).toBe("post-0");
  });

  it("never repeats or skips a post across pages", () => {
    seed();
    const slugs = [1, 2, 3].flatMap((page) =>
      listBlogPage({ page }, 12).posts.map((p) => p.slug),
    );
    expect(new Set(slugs).size).toBe(30);
  });

  it("filters by category, with page counts to match", () => {
    seed();
    const news = listBlogPage({ category: "news" }, 12);
    expect(news.total).toBe(10);
    expect(news.pageCount).toBe(1);
    expect(news.posts.every((p) => p.category === "news")).toBe(true);
  });

  it("leaves drafts out", () => {
    seed(3);
    savePost(null, post({ title: "Secret", slug: "secret", status: "draft" }));
    expect(listBlogPage({}, 12).total).toBe(3);
    expect(listBlogPage({ search: "secret" }, 12).total).toBe(0);
  });

  it("has an empty first page when there are no posts", () => {
    expect(listBlogPage({}, 12)).toMatchObject({ posts: [], total: 0, page: 1, pageCount: 1 });
  });
});

describe("search", () => {
  beforeEach(() => {
    savePost(null, post({ title: "Flu shots are here", slug: "flu", body: body("Book your vaccine.") }));
    savePost(
      null,
      post({
        title: "What is Ozempic?",
        slug: "ozempic",
        category: "medications",
        body: body("A weekly injection for type 2 diabetes. Not a vaccine."),
      }),
    );
    savePost(null, post({ title: "Café hours", slug: "cafe", category: "news", body: body("Open late.") }));
  });

  const slugs = (search: string, category?: "medications" | null) =>
    listBlogPage({ search, category }, 12).posts.map((p) => p.slug);

  it("matches words by how they start, in any order", () => {
    expect(slugs("ozem")).toEqual(["ozempic"]);
    expect(slugs("diabetes weekly")).toEqual(["ozempic"]);
  });

  it("ranks title matches above body matches", () => {
    // "flu" in a title; "vaccine" in both bodies, but only one title has neither
    expect(slugs("vaccine")).toHaveLength(2);
    expect(slugs("flu")).toEqual(["flu"]);
  });

  it("ignores case and accents", () => {
    expect(slugs("CAFE")).toEqual(["cafe"]);
  });

  it("combines with a category", () => {
    expect(slugs("vaccine", "medications")).toEqual(["ozempic"]);
  });

  it("finds a post by its new words after an edit, and not its old ones", () => {
    const { posts } = listAdminPosts({ search: "flu" }, 25);
    savePost(posts[0].id, post({ title: "Travel clinic", slug: "flu", body: body("Plan ahead.") }));
    expect(slugs("flu")).toEqual([]);
    expect(slugs("travel")).toEqual(["flu"]);
  });

  it("forgets deleted posts", () => {
    const { posts } = listAdminPosts({ search: "ozempic" }, 25);
    deletePost(posts[0].id);
    expect(slugs("ozempic")).toEqual([]);
  });

  it("reindexes a database whose search table fell out of step", () => {
    getDb().exec("DELETE FROM posts_search");
    closeDb();
    expect(slugs("ozempic")).toEqual(["ozempic"]);
  });

  it("treats query syntax as plain words", () => {
    for (const typed of ['"', "*", "flu OR", "NEAR(", "-", "title:flu", "flu AND ozempic"]) {
      expect(() => slugs(typed)).not.toThrow();
    }
    expect(toMatchQuery('title:flu" OR *')).toBe('"title"* "flu"* "or"*');
    expect(toMatchQuery("   ")).toBeNull();
  });
});

describe("admin list", () => {
  it("puts drafts first and filters by status", () => {
    savePost(null, post({ slug: "live" }), new Date("2026-03-01T00:00:00Z"));
    savePost(null, post({ slug: "draft", status: "draft" }), new Date("2026-01-01T00:00:00Z"));
    savePost(
      null,
      post({
        slug: "announced",
        announcement: window("2026-01-01T00:00:00Z", "2026-01-02T00:00:00Z"),
      }),
      new Date("2026-02-01T00:00:00Z"),
    );

    expect(listAdminPosts({}, 25).posts.map((p) => p.slug)).toEqual(["draft", "live", "announced"]);
    expect(listAdminPosts({ status: "draft" }, 25).posts.map((p) => p.slug)).toEqual(["draft"]);
    expect(listAdminPosts({ status: "announcement" }, 25).posts.map((p) => p.slug)).toEqual([
      "announced",
    ]);
  });
});

describe("query plans", () => {
  // The blog list must be read straight off an index in order, not by
  // scanning and sorting every post. "USE TEMP B-TREE" would mean a sort
  const plan = (sql: string, ...params: (string | number)[]) =>
    (getDb().prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...params) as { detail: string }[])
      .map((row) => row.detail)
      .join("\n");

  it("pages the blog using an index, with no sort step", () => {
    const sql = `SELECT p.id FROM posts p WHERE p.status = ? ORDER BY p.published_at DESC LIMIT 12 OFFSET 12`;
    const detail = plan(sql, "published");
    expect(detail).toMatch(/USING INDEX posts_published_idx/);
    expect(detail).not.toMatch(/TEMP B-TREE/);
  });

  it("pages a category using an index, with no sort step", () => {
    const sql = `SELECT p.id FROM posts p WHERE p.status = ? AND p.category = ? ORDER BY p.published_at DESC LIMIT 12`;
    const detail = plan(sql, "published", "news");
    expect(detail).toMatch(/USING INDEX posts_category_idx/);
    expect(detail).not.toMatch(/TEMP B-TREE/);
  });

  it("counts from an index alone", () => {
    const detail = plan(
      "SELECT COUNT(*) FROM posts p WHERE p.status = ? AND p.category = ?",
      "published",
      "news",
    );
    expect(detail).toMatch(/USING COVERING INDEX posts_category_idx/);
  });
});
