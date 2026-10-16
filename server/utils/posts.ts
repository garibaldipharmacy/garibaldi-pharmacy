// Blog posts and the homepage announcement.
//
// Explicit imports rather than Nitro auto-imports, so this module is testable
// in plain vitest without the Nuxt runtime.

import { randomUUID } from "node:crypto";
import { generateHTML } from "@tiptap/html/server";
import { getDb } from "./db";
import type { SqliteDatabase } from "./sqlite";
import { postExtensions } from "~~/shared/postExtensions";
import { docText, type DocNode } from "~~/shared/postDoc";
import {
  announcementState,
  SEARCH_MAX,
  type AdminStatusFilter,
  type CurrentAnnouncementDTO,
  type PostCategory,
  type PostPage,
  type PostDTO,
  type PostInput,
  type PostSummaryDTO,
  type PublicPostDTO,
  type PublicPostSummaryDTO,
} from "~~/shared/posts";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  summary: string;
  cover_image: string | null;
  cover_alt: string;
  category: PostCategory;
  body_json: string;
  body_html: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  announcement_snippet: string | null;
  announcement_starts_at: string | null;
  announcement_ends_at: string | null;
}

const SUMMARY_LENGTH = 160;

/** The start of the text, cut at a word, for when there's no excerpt */
function summarize(input: PostInput): string {
  if (input.excerpt) return input.excerpt;
  // Headings read oddly run into the sentences around them
  const text = docText({
    ...input.body,
    content: input.body.content?.filter((node) => node.type !== "heading"),
  });
  if (text.length <= SUMMARY_LENGTH) return text;
  const cut = text.slice(0, SUMMARY_LENGTH);
  return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}…`;
}

export function renderBody(body: DocNode): string {
  return body.content?.length ? generateHTML(body, postExtensions) : "";
}

function announcementOf(row: ListRow, now: number) {
  if (
    !row.announcement_snippet ||
    !row.announcement_starts_at ||
    !row.announcement_ends_at
  ) {
    return null;
  }
  const window = {
    startsAt: row.announcement_starts_at,
    endsAt: row.announcement_ends_at,
  };
  return {
    snippet: row.announcement_snippet,
    ...window,
    state: announcementState(window, now),
  };
}

// A list never needs a post's body, which is most of its size
type ListRow = Omit<PostRow, "body_json" | "body_html" | "created_at">;

function toSummary(row: ListRow, now: number): PostSummaryDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    coverAlt: row.cover_alt,
    category: row.category,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    announcement: announcementOf(row, now),
  };
}

function toPublicSummary(row: ListRow, now: number): PublicPostSummaryDTO {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    coverImage: row.cover_image,
    coverAlt: row.cover_alt,
    category: row.category,
    // Drafts only reach here in a signed-in preview, which has no date yet
    publishedAt: row.published_at ?? row.updated_at,
    isAnnouncement:
      row.status === "published" && announcementOf(row, now)?.state === "active",
  };
}

// ---------------------------------------------------------------------------
// Editing
// ---------------------------------------------------------------------------

export function getPost(id: string, now = Date.now()): PostDTO | undefined {
  const row = getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id) as
    | PostRow
    | undefined;
  if (!row) return undefined;
  return { ...toSummary(row, now), body: JSON.parse(row.body_json) as DocNode };
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not_found" | "slug_taken" };

/**
 * Creates the post when `id` is null, otherwise updates it. Giving a post the
 * announcement takes it off whichever post had it, in the same transaction
 */
export function savePost(
  id: string | null,
  input: PostInput,
  now = new Date(),
): SaveResult {
  const d = getDb();
  const iso = now.toISOString();

  const existing = id
    ? (d.prepare("SELECT id, published_at FROM posts WHERE id = ?").get(id) as
        | Pick<PostRow, "id" | "published_at">
        | undefined)
    : undefined;
  if (id && !existing) return { ok: false, reason: "not_found" };

  const clash = d
    .prepare("SELECT id FROM posts WHERE slug = ? AND id IS NOT ?")
    .get(input.slug, id) as { id: string } | undefined;
  if (clash) return { ok: false, reason: "slug_taken" };

  const postId = id ?? randomUUID();
  // The date a post first went out. Unpublishing and republishing keeps it
  const publishedAt =
    existing?.published_at ?? (input.status === "published" ? iso : null);

  const values = [
    input.slug,
    input.title,
    input.excerpt,
    summarize(input),
    input.coverImage,
    input.coverAlt,
    input.category,
    JSON.stringify(input.body),
    renderBody(input.body),
    input.status,
    publishedAt,
    iso,
    input.announcement?.snippet ?? null,
    input.announcement?.startsAt ?? null,
    input.announcement?.endsAt ?? null,
  ];

  d.exec("BEGIN IMMEDIATE");
  try {
    if (input.announcement) {
      d.prepare(
        `UPDATE posts
           SET announcement_snippet = NULL,
               announcement_starts_at = NULL,
               announcement_ends_at = NULL
         WHERE id != ? AND announcement_snippet IS NOT NULL`,
      ).run(postId);
    }

    if (existing) {
      d.prepare(
        `UPDATE posts SET
           slug = ?, title = ?, excerpt = ?, summary = ?, cover_image = ?,
           cover_alt = ?, category = ?, body_json = ?, body_html = ?, status = ?,
           published_at = ?, updated_at = ?, announcement_snippet = ?,
           announcement_starts_at = ?, announcement_ends_at = ?
         WHERE id = ?`,
      ).run(...values, postId);
    } else {
      d.prepare(
        `INSERT INTO posts
           (slug, title, excerpt, summary, cover_image, cover_alt, category,
            body_json, body_html, status, published_at, updated_at,
            announcement_snippet, announcement_starts_at, announcement_ends_at,
            id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(...values, postId, iso);
    }

    indexForSearch(d, postId, input.title, summarize(input), docText(input.body));

    d.exec("COMMIT");
    return { ok: true, id: postId };
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

export function deletePost(id: string): boolean {
  const d = getDb();
  d.exec("BEGIN IMMEDIATE");
  try {
    d.prepare("DELETE FROM posts_search WHERE post_id = ?").run(id);
    const deleted = d.prepare("DELETE FROM posts WHERE id = ?").run(id).changes > 0;
    d.exec("COMMIT");
    return deleted;
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/** A published post, or a draft too when `includeDrafts` (signed-in preview) */
export function getPublicPost(
  slug: string,
  { includeDrafts = false, now = Date.now() } = {},
): PublicPostDTO | undefined {
  const row = getDb()
    .prepare(
      `SELECT * FROM posts WHERE slug = ? AND (status = 'published' OR ?)`,
    )
    .get(slug, includeDrafts ? 1 : 0) as PostRow | undefined;
  if (!row) return undefined;
  return {
    ...toPublicSummary(row, now),
    html: row.body_html,
    updatedAt: row.updated_at,
    isDraft: row.status !== "published",
  };
}

/** The announcement to feature right now, if there is one */
export function currentAnnouncement(now = new Date()): CurrentAnnouncementDTO | null {
  const iso = now.toISOString();
  const row = getDb()
    .prepare(
      `SELECT slug, announcement_snippet AS snippet FROM posts
       WHERE status = 'published'
         AND announcement_snippet IS NOT NULL
         AND announcement_starts_at <= ?
         AND announcement_ends_at > ?`,
    )
    .get(iso, iso) as CurrentAnnouncementDTO | undefined;
  return row ? { snippet: row.snippet, slug: row.slug } : null;
}

export function publishedPostDates(): { slug: string; updatedAt: string }[] {
  return getDb()
    .prepare(
      `SELECT slug, updated_at AS updatedAt FROM posts
       WHERE status = 'published' ORDER BY published_at DESC`,
    )
    .all() as unknown as { slug: string; updatedAt: string }[];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
//
// posts_search is an FTS5 table holding each post's words. It's written in
// the same transaction as the post, so the two can't drift. A database that
// predates it, or was restored without it, is reindexed on first search.

function indexForSearch(
  d: SqliteDatabase,
  postId: string,
  title: string,
  summary: string,
  body: string,
): void {
  d.prepare("DELETE FROM posts_search WHERE post_id = ?").run(postId);
  d.prepare(
    "INSERT INTO posts_search (post_id, title, summary, body) VALUES (?, ?, ?, ?)",
  ).run(postId, title, summary, body);
}

const indexChecked = new WeakSet<SqliteDatabase>();

function ensureSearchIndex(d: SqliteDatabase): void {
  if (indexChecked.has(d)) return;
  const count = (sql: string) => (d.prepare(sql).get() as { n: number }).n;
  if (
    count("SELECT COUNT(*) AS n FROM posts") !==
    count("SELECT COUNT(*) AS n FROM posts_search")
  ) {
    const rows = d
      .prepare("SELECT id, title, summary, body_json FROM posts")
      .all() as unknown as Pick<PostRow, "id" | "title" | "summary" | "body_json">[];
    d.exec("BEGIN IMMEDIATE");
    try {
      d.exec("DELETE FROM posts_search");
      for (const row of rows) {
        indexForSearch(
          d,
          row.id,
          row.title,
          row.summary,
          docText(JSON.parse(row.body_json) as DocNode),
        );
      }
      d.exec("COMMIT");
    } catch (err) {
      d.exec("ROLLBACK");
      throw err;
    }
  }
  indexChecked.add(d);
}

/**
 * What someone typed, as an FTS5 query: every word must appear, matched by
 * how it starts, so "flu vacc" finds "flu vaccines". Only letters and digits
 * get through, each quoted, so nothing typed can be read as query syntax.
 * Null when there's nothing to search for
 */
export function toMatchQuery(typed: string): string | null {
  const words =
    typed
      .slice(0, SEARCH_MAX)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? [];
  const terms = words.slice(0, 8).map((word) => `"${word}"*`);
  return terms.length ? terms.join(" ") : null;
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

const LIST_COLUMNS = `p.id, p.slug, p.title, p.excerpt, p.summary, p.cover_image,
  p.cover_alt, p.category, p.status, p.published_at, p.updated_at,
  p.announcement_snippet, p.announcement_starts_at, p.announcement_ends_at`;

interface ListQuery {
  status: AdminStatusFilter;
  category?: PostCategory | null;
  search?: string;
  page: number;
  pageSize: number;
}

/**
 * One page of posts and how many there are in all. Two indexed queries: a
 * count, then just the rows for the page, with only the columns a list
 * shows. Searches are ranked by relevance, with title matches counting most;
 * otherwise newest first
 */
function queryPosts({
  status,
  category,
  search,
  page,
  pageSize,
}: ListQuery): { rows: ListRow[]; total: number } {
  const d = getDb();
  const where: string[] = [];
  const params: (string | number)[] = [];

  const match = search ? toMatchQuery(search) : null;
  if (match) {
    ensureSearchIndex(d);
    where.push("posts_search MATCH ?");
    params.push(match);
  }
  if (status === "published" || status === "draft") {
    where.push("p.status = ?");
    params.push(status);
  } else if (status === "announcement") {
    where.push("p.announcement_snippet IS NOT NULL");
  }
  if (category) {
    where.push("p.category = ?");
    params.push(category);
  }

  const from = match
    ? "posts_search JOIN posts p ON p.id = posts_search.post_id"
    : "posts p";
  const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";
  // Columns: post_id, title, summary, body
  const order = match
    ? "bm25(posts_search, 0, 10, 4, 1)"
    : status === "published"
      ? "p.published_at DESC"
      : // The admin list: drafts first, then newest
        "p.status = 'published', COALESCE(p.published_at, p.updated_at) DESC";

  const { total } = d
    .prepare(`SELECT COUNT(*) AS total FROM ${from} ${filter}`)
    .get(...params) as { total: number };
  const rows = d
    .prepare(
      `SELECT ${LIST_COLUMNS} FROM ${from} ${filter}
       ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, (page - 1) * pageSize) as unknown as ListRow[];

  return { rows, total };
}

const pageCount = (total: number, pageSize: number) =>
  Math.max(1, Math.ceil(total / pageSize));

export interface ListOptions {
  page?: number;
  category?: PostCategory | null;
  search?: string;
  now?: number;
}

/** A page of the public blog: published posts only */
export function listBlogPage(
  { page = 1, category, search, now = Date.now() }: ListOptions,
  pageSize: number,
): PostPage<PublicPostSummaryDTO> {
  const { rows, total } = queryPosts({
    status: "published",
    category,
    search,
    page,
    pageSize,
  });
  return {
    posts: rows.map((row) => toPublicSummary(row, now)),
    total,
    page,
    pageCount: pageCount(total, pageSize),
  };
}

/** A page of the admin list, drafts included */
export function listAdminPosts(
  {
    page = 1,
    category,
    search,
    status = "all",
    now = Date.now(),
  }: ListOptions & { status?: AdminStatusFilter },
  pageSize: number,
): PostPage<PostSummaryDTO> {
  const { rows, total } = queryPosts({ status, category, search, page, pageSize });
  return {
    posts: rows.map((row) => toSummary(row, now)),
    total,
    page,
    pageCount: pageCount(total, pageSize),
  };
}

/** Categories with at least one published post, so no filter leads nowhere */
export function publishedCategories(): PostCategory[] {
  return (
    getDb()
      .prepare(
        "SELECT DISTINCT category FROM posts WHERE status = 'published'",
      )
      .all() as { category: PostCategory }[]
  ).map((row) => row.category);
}

/** The post holding the announcement, if any, for the editor's warning */
export function announcementHolder(now = Date.now()): PostSummaryDTO | null {
  const { rows } = queryPosts({ status: "announcement", page: 1, pageSize: 1 });
  return rows[0] ? toSummary(rows[0], now) : null;
}
