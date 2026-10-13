import { test, expect, type Page } from "@playwright/test";

// Matches ADMIN_PASSWORD_HASH in playwright.config.ts. Guards nothing real.
const PASSWORD = "e2e-not-a-real-password";

async function signIn(page: Page) {
  await page.goto("/admin");
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
}

/** Creates a submission so the list has something in it. */
async function submitRefill(page: Page, medications = "Ramipril 10mg capsules") {
  await page.goto("/prescriptions/refill/");
  await page.fill("#first_name", "Testy");
  await page.fill("#last_name", "McFixture");
  await page.fill("#date_of_birth", "1980-05-02");
  await page.fill("#cell_phone_number", "6045550100");
  await page.fill("#email", "not-a-real-patient@example.invalid");
  await page.fill("#medications", medications);
  await page.getByRole("button", { name: /send refill request/i }).click();
  await expect(page).toHaveURL(/\/success\/refill/);
}

test.describe("admin access control", () => {
  // The security properties that matter. Guarding the page but not the data
  // behind it would be theatre, so these hit the API directly.

  test("the listing API refuses an unauthenticated request", async ({ request }) => {
    const res = await request.get("/api/admin/submissions");
    expect(res.status()).toBe(401);
  });

  test("the detail API refuses an unauthenticated request", async ({ request }) => {
    const res = await request.get("/api/admin/submissions/any-id");
    expect(res.status()).toBe(401);
  });

  test("the file download refuses an unauthenticated request", async ({ request }) => {
    const res = await request.get("/api/admin/submissions/any-id/files/any-file");
    expect(res.status()).toBe(401);
  });

  test("shows a sign-in form rather than data when signed out", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign out/i })).toHaveCount(0);
  });

  test("rejects the wrong password without revealing anything", async ({ page }) => {
    await page.goto("/admin");
    await page.fill("#password", "definitely-the-wrong-password");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign out/i })).toHaveCount(0);
  });

  test("is not indexable", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("signing out ends the session for the API too", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page.locator("#password")).toBeVisible();

    const res = await page.request.get("/api/admin/submissions");
    expect(res.status()).toBe(401);
  });
});

test.describe("viewing submissions", () => {
  test("signs in and lists a submission", async ({ page }) => {
    await submitRefill(page, "Atorvastatin 20mg tablets");
    await signIn(page);

    await expect(page.getByText("Testy McFixture").first()).toBeVisible();
    await expect(page.getByText(/Refill/).first()).toBeVisible();
  });

  test("expands a submission to show what the patient sent", async ({ page }) => {
    await submitRefill(page, "Metformin 500mg tablets");
    await signIn(page);

    await page.getByText("Testy McFixture").first().click();

    await expect(page.getByText("Metformin 500mg tablets")).toBeVisible();
    await expect(page.getByText("not-a-real-patient@example.invalid")).toBeVisible();
    // Stored as a machine value; rendered as the sentence a pharmacist reads.
    await expect(page.getByText(/I will pickup my prescription/)).toBeVisible();
  });

  test("serves an attachment decrypted, to a signed-in session only", async ({ page }) => {
    // Send a prescription with a real PNG so there is something to download.
    await page.goto("/prescriptions/send/");
    await page.fill("#first_name", "Filey");
    await page.fill("#last_name", "McUpload");
    await page.fill("#date_of_birth", "1975-03-11");
    await page.fill("#cell_phone_number", "6045550123");
    await page.fill("#email", "not-a-real-patient@example.invalid");
    await page.locator("#prescriptions-0-file").setInputFiles({
      name: "script.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    await page.getByRole("button", { name: /send prescription/i }).click();
    await expect(page).toHaveURL(/\/success\/send/, { timeout: 30_000 });

    await signIn(page);
    await page.getByText("Filey McUpload").first().click();

    const link = page.getByRole("link", { name: /prescription 1/i });
    await expect(link).toBeVisible();

    const href = await link.getAttribute("href");
    const res = await page.request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    expect(res.headers()["cache-control"]).toContain("no-store");
    // Decrypted on the way out: the bytes on disk are ciphertext.
    expect((await res.body()).subarray(0, 8).toString("latin1")).toContain("PNG");
  });

  test("a flagged submission is marked, not hidden", async ({ page }) => {
    // Three links in the notes trips the heuristic. It must still be visible.
    await submitRefill(
      page,
      "see http://a.example and http://b.example and www.c.example",
    );
    await signIn(page);

    await expect(page.getByText(/contains several links/i).first()).toBeVisible();
  });
});
