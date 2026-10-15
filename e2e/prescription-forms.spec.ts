import { test, expect, type Page } from "@playwright/test";

// All fixture data is obviously fake. Playwright traces and screenshots capture
// whatever gets typed, so nothing resembling a real patient goes in here.
const PATIENT = {
  firstName: "Testy",
  lastName: "McFixture",
  dateOfBirth: "1980-05-02",
  phone: "6045550100",
  email: "not-a-real-patient@example.invalid",
};

async function fillCommonFields(page: Page) {
  await page.fill("#first_name", PATIENT.firstName);
  await page.fill("#last_name", PATIENT.lastName);
  await page.fill("#date_of_birth", PATIENT.dateOfBirth);
  await page.fill("#cell_phone_number", PATIENT.phone);
  await page.fill("#email", PATIENT.email);
}

/** A real PNG, so the server's content sniffing accepts it. */
function pngFixture(name = "prescription.png") {
  return {
    name,
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  };
}

/**
 * Attaches a photo. Photos open a review step straight away, as in a scanner
 * app; accept it as it is, the way most patients will
 */
async function attachPhoto(page: Page, selector: string, file = pngFixture()) {
  await page.locator(selector).setInputFiles(file);
  const editor = page.getByRole("dialog");
  await editor.getByRole("button", { name: "Use photo" }).click();
  await expect(editor).toBeHidden();
}

test.describe("refill", () => {
  test("submits and lands on the success page", async ({ page }) => {
    await page.goto("/prescriptions/refill/");
    await fillCommonFields(page);
    await page.fill("#medications", "Ramipril 10mg capsules");

    await page.getByRole("button", { name: /send refill request/i }).click();

    await expect(page).toHaveURL(/\/success\/refill/);
    await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
      /thank you/i,
    );
  });

  test("blocks an empty medication list and keeps what was typed", async ({ page }) => {
    await page.goto("/prescriptions/refill/");
    await fillCommonFields(page);
    // Medications deliberately left blank. The old form accepted this.
    await page.getByRole("button", { name: /send refill request/i }).click();

    await expect(page).not.toHaveURL(/\/success/);
    await expect(page.getByRole("status")).toBeVisible();
    // Nothing the patient typed may be lost on a failed submit.
    await expect(page.locator("#first_name")).toHaveValue(PATIENT.firstName);
    await expect(page.locator("#email")).toHaveValue(PATIENT.email);
  });

  test("announces the error accessibly and moves focus to it", async ({ page }) => {
    await page.goto("/prescriptions/refill/");
    await page.getByRole("button", { name: /send refill request/i }).click();

    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status).toBeFocused();
  });

  test("a filled honeypot looks like success but stores nothing", async ({ page }) => {
    await page.goto("/prescriptions/refill/");
    await fillCommonFields(page);
    await page.fill("#medications", "Ramipril 10mg capsules");
    // Playwright refuses to fill it, because it is genuinely invisible, which is
    // the point. Set it the way a scripted bot would instead.
    await page.evaluate(() => {
      const el = document.querySelector("#bot-field") as HTMLInputElement;
      el.value = "http://spam.example";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await page.getByRole("button", { name: /send refill request/i }).click();
    await expect(page).toHaveURL(/\/success\/refill/);
  });
});

test.describe("transfer", () => {
  test("does not ask for a medication list when transferring everything", async ({
    page,
  }) => {
    await page.goto("/prescriptions/transfer/");
    await expect(page.locator("#medications")).toHaveCount(0);
  });

  test("asks for a medication list when transferring some", async ({ page }) => {
    await page.goto("/prescriptions/transfer/");
    await page.getByText("No", { exact: true }).click();
    await expect(page.locator("#medications")).toBeVisible();
  });

  test("submits a partial transfer", async ({ page }) => {
    await page.goto("/prescriptions/transfer/");
    await fillCommonFields(page);
    await page.fill("#pharmacy_name", "Fixture Pharmacy");
    await page.fill("#pharmacy_phone_number", "6045550199");
    await page.getByText("No", { exact: true }).click();
    await page.fill("#medications", "Ramipril 10mg capsules");

    await page.getByRole("button", { name: /send transfer request/i }).click();
    await expect(page).toHaveURL(/\/success\/transfer/);
  });
});

test.describe("send, with the dynamic repeaters", () => {
  test("starts with one prescription row and no insurance rows", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await expect(page.locator('input[id^="prescriptions-"][type="file"]')).toHaveCount(1);
    // Having insurance at all is optional, so the group opens empty and the add
    // button is the only thing on screen.
    await expect(page.locator('input[id^="insurance-"][type="file"]')).toHaveCount(0);
  });

  test("submits with no insurance card at all", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await fillCommonFields(page);
    await attachPhoto(page, "#prescriptions-0-file");

    await page.getByRole("button", { name: /send prescription/i }).click();
    await expect(page).toHaveURL(/\/success\/send/, { timeout: 30_000 });
  });

  test("an added insurance card can be removed again", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await page.getByRole("button", { name: /add an insurance card/i }).click();
    await expect(page.locator('input[id^="insurance-"][type="file"]')).toHaveCount(2);

    await page.locator("#insurance-0-front").locator("xpath=ancestor::li").getByRole("button", { name: /remove/i }).click();
    await expect(page.locator('input[id^="insurance-"][type="file"]')).toHaveCount(0);
  });

  test("adds prescriptions up to the maximum, then explains why it stops", async ({
    page,
  }) => {
    await page.goto("/prescriptions/send/");
    const add = page.getByRole("button", { name: /add another prescription/i });

    for (let i = 0; i < 4; i++) await add.click();
    await expect(page.locator('input[id^="prescriptions-"][type="file"]')).toHaveCount(5);

    // Disabled with a reason, rather than silently doing nothing.
    await expect(add).toBeDisabled();
    await expect(page.getByText(/up to 5 prescriptions/i)).toBeVisible();
  });

  test("removes a row", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await page.getByRole("button", { name: /add another prescription/i }).click();
    await expect(page.locator('input[id^="prescriptions-"][type="file"]')).toHaveCount(2);

    await page.getByRole("button", { name: /remove/i }).first().click();
    await expect(page.locator('input[id^="prescriptions-"][type="file"]')).toHaveCount(1);
  });

  test("submits three prescriptions and two insurance cards", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await fillCommonFields(page);

    const addRx = page.getByRole("button", { name: /add another prescription/i });
    await addRx.click();
    await addRx.click();
    for (let i = 0; i < 3; i++) {
      await attachPhoto(page, `#prescriptions-${i}-file`, pngFixture(`rx${i}.png`));
    }

    const addCard = page.getByRole("button", { name: /add an insurance card/i });
    await addCard.click();
    await addCard.click();
    await attachPhoto(page, "#insurance-0-front", pngFixture("front0.png"));
    await attachPhoto(page, "#insurance-0-back", pngFixture("back0.png"));
    // Second card deliberately has no back: some cards have nothing on them.
    await attachPhoto(page, "#insurance-1-front", pngFixture("front1.png"));

    await page.getByRole("button", { name: /send prescription/i }).click();
    await expect(page).toHaveURL(/\/success\/send/, { timeout: 30_000 });
  });

  test("rejects a renamed executable server side", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await fillCommonFields(page);
    await page.locator("#prescriptions-0-file").setInputFiles({
      name: "prescription.png",
      mimeType: "image/png",
      buffer: Buffer.from("MZ this is not an image at all"),
    });

    await page.getByRole("button", { name: /send prescription/i }).click();
    await expect(page).not.toHaveURL(/\/success/);
    await expect(page.getByRole("status")).toBeVisible();
  });

  test("requires at least one prescription", async ({ page }) => {
    await page.goto("/prescriptions/send/");
    await fillCommonFields(page);
    await page.getByRole("button", { name: /send prescription/i }).click();

    await expect(page).not.toHaveURL(/\/success/);
    await expect(page.getByRole("status")).toBeVisible();
  });
});

test.describe("infrastructure", () => {
  test("health check reports the database is reachable", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({
      status: "ok",
      checks: { database: "ok" },
    });
  });

  test("a missing page returns a real 404, not a soft one", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/can’t find that page/i);
    await expect(page).toHaveTitle("Page Not Found | Garibaldi Pharmacy");
  });

  test("a missing page suggests the page whose name matches the address", async ({ page }) => {
    await page.goto("/flu-shots/");
    const suggestions = page.getByRole("heading", { name: /were you looking for/i }).locator("..");
    await expect(suggestions.getByRole("link", { name: /immunizations/i })).toHaveAttribute(
      "href",
      "/services/immunizations/",
    );
  });

  test("the API is not cacheable", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});
