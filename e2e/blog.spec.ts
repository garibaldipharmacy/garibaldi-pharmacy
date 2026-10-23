import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

// Matches ADMIN_PASSWORD_HASH in playwright.config.ts. Guards nothing real.
const PASSWORD = "e2e-not-a-real-password";

// Signs in once for the whole file. Sign-in is rate limited per IP, and the
// admin tests already use most of the allowance
let session: Awaited<ReturnType<import("@playwright/test").APIRequestContext["storageState"]>>;

test.beforeAll(async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL });
  const res = await request.post("/api/admin/login", { data: { password: PASSWORD } });
  expect(res.ok()).toBe(true);
  session = await request.storageState();
  await request.dispose();
});

async function signIn(page: Page) {
  await page.context().addCookies(session.cookies);
}

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

/** Saves a post through the admin API, returning its address */
async function createPost(
  page: Page,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  // Unique per run, as the e2e data folder outlives a run
  const slug = `e2e-post-${randomUUID().slice(0, 8)}`;
  const res = await page.request.post("/api/admin/posts", {
    data: {
      title: "Flu shots are here",
      slug,
      body: { type: "doc", content: [paragraph("Book yours today.")] },
      status: "published",
      ...overrides,
    },
  });
  expect(res.status()).toBe(200);
  return slug;
}

const runningNow = (snippet: string) => ({
  snippet,
  startsAt: new Date(Date.now() - 3600_000).toISOString(),
  endsAt: new Date(Date.now() + 3600_000).toISOString(),
});

test.describe("blog access control", () => {
  test("the post APIs refuse an unauthenticated request", async ({ request }) => {
    expect((await request.get("/api/admin/posts")).status()).toBe(401);
    expect((await request.post("/api/admin/posts", { data: {} })).status()).toBe(401);
    expect((await request.post("/api/admin/media")).status()).toBe(401);
  });

  test("a draft is hidden from visitors but previewable when signed in", async ({
    page,
    browser,
  }) => {
    await signIn(page);
    const slug = await createPost(page, { status: "draft" });

    const visitor = await browser.newPage();
    const res = await visitor.goto(`/blog/${slug}/?preview=1`);
    expect(res?.status()).toBe(404);
    await visitor.close();

    await page.goto(`/blog/${slug}/?preview=1`);
    await expect(page.getByText("Draft preview.")).toBeVisible();
  });

  test("posts can't carry script", async ({ page }) => {
    await signIn(page);
    const slug = await createPost(page, {
      body: {
        type: "doc",
        content: [
          paragraph("<script>window.pwned = true</script>"),
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "click me",
                marks: [{ type: "link", attrs: { href: "javascript:window.pwned=true" } }],
              },
            ],
          },
        ],
      },
    });
    await page.goto(`/blog/${slug}/`);
    await expect(page.getByText("<script>window.pwned = true</script>")).toBeVisible();
    await expect(page.locator(".post-body a")).toHaveCount(0);
  });
});

test.describe("announcements", () => {
  test("a running announcement links from the homepage and inner pages", async ({ page }) => {
    await signIn(page);
    const snippet = `E2E announcement ${randomUUID().slice(0, 8)}`;
    const slug = await createPost(page, { announcement: runningNow(snippet) });

    await page.goto("/");
    const pill = page.getByRole("link", { name: new RegExp(snippet) });
    await expect(pill).toHaveAttribute("href", `/blog/${slug}/`);

    await page.goto("/about/");
    await expect(page.getByRole("link", { name: new RegExp(snippet) })).toBeVisible();

    // Not on the post it points to
    await page.goto(`/blog/${slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Flu shots are here");
    await expect(page.getByRole("link", { name: new RegExp(snippet) })).toHaveCount(0);
  });

  test("one that has ended stays on the blog but leaves the homepage", async ({ page }) => {
    await signIn(page);
    const snippet = `E2E ended ${randomUUID().slice(0, 8)}`;
    const slug = await createPost(page, {
      title: "Last week's news",
      announcement: {
        snippet,
        startsAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
        endsAt: new Date(Date.now() - 3600_000).toISOString(),
      },
    });

    await page.goto("/");
    await expect(page.getByRole("link", { name: new RegExp(snippet) })).toHaveCount(0);
    await page.goto("/blog/");
    await expect(page.locator(`a[href="/blog/${slug}/"]`)).toBeVisible();
  });
});

test.describe("finding posts", () => {
  test("search finds a post by a word in it, and filters by category", async ({ page }) => {
    await signIn(page);
    const word = `zyx${randomUUID().slice(0, 6)}`;
    await createPost(page, {
      title: "A post about something rare",
      category: "compounding",
      body: { type: "doc", content: [paragraph(`The word is ${word}.`)] },
    });

    await page.goto(`/blog/?q=${word}`);
    await expect(page.getByText(/1 post matching/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "A post about something rare" })).toBeVisible();
    // Search results aren't for search engines
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    await page.goto(`/blog/?q=${word}&category=vaccines`);
    await expect(page.getByText("No posts match that search.")).toBeVisible();
  });

  test("addresses that don't exist are 404s, not empty pages", async ({ page }) => {
    expect((await page.goto("/blog/?page=9999"))?.status()).toBe(404);
    expect((await page.goto("/blog/?page=0"))?.status()).toBe(404);
    expect((await page.goto("/blog/?category=not-a-category"))?.status()).toBe(404);
  });

  test("pages through posts with real links", async ({ page }) => {
    await signIn(page);
    // Enough for a second page whatever else the e2e store holds
    for (let n = 0; n < 13; n++) await createPost(page, { title: `Paging post ${n}` });

    await page.goto("/blog/");
    await expect(page.getByRole("list", { name: "Posts" }).getByRole("listitem")).toHaveCount(12);
    const next = page.getByRole("link", { name: /next/i });
    await expect(next).toHaveAttribute("href", "/blog/?page=2");
    await next.click();
    await expect(page).toHaveURL(/\/blog\/\?page=2$/);
    await expect(page.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });
});
