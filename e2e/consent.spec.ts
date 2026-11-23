import { test, expect, type Page } from "@playwright/test";

// The vaccine consent form. All fixture data is obviously fake: Playwright
// traces and screenshots capture whatever gets typed.

const PATIENT = {
  firstName: "Testy",
  lastName: "McFixture",
  dateOfBirth: "19800502",
  phn: "9123456787",
  phone: "6045550100",
  email: "not-a-real-patient@example.invalid",
};

const WIDTHS = [
  { name: "phone", viewport: { width: 390, height: 844 } },
  { name: "desktop", viewport: { width: 1280, height: 900 } },
];

/** The yes/no group for a question, by a few words of it. */
const question = (page: Page, words: RegExp) => page.getByRole("radiogroup", { name: words });

async function answer(page: Page, words: RegExp, choice: "Yes" | "No") {
  await question(page, words).getByRole("radio", { name: choice }).click();
}

async function fillAboutYou(page: Page, sex: "Male" | "Female") {
  await page.fill("#first_name", PATIENT.firstName);
  await page.fill("#last_name", PATIENT.lastName);
  await page.locator("#date_of_birth").pressSequentially(PATIENT.dateOfBirth);
  await page.fill("#phn", PATIENT.phn);
  await page.getByRole("radiogroup", { name: /sex at birth/i }).getByRole("radio", { name: sex, exact: true }).click();
  await page.fill("#cell_phone_number", PATIENT.phone);
  await page.fill("#email", PATIENT.email);
  await page.fill("#ec_name", "Fixture Contact");
  await page.fill("#ec_phone", "6045550199");
}

async function answerHealthQuestions(page: Page, { pregnant = true } = {}) {
  await answer(page, /sick today/i, "No");
  await answer(page, /allergic/i, "Yes");
  await page.fill("#allergy_detail", "Fixture allergy (hives)");
  if (pregnant) await answer(page, /pregnant/i, "No");
  await answer(page, /fainted/i, "No");
  await answer(page, /neurological/i, "No");
  await answer(page, /bleeding/i, "No");
}

/** Draws a squiggle across the pad with the mouse. */
async function sign(page: Page) {
  const pad = page.locator("canvas#signature");
  await pad.scrollIntoViewIfNeeded();
  const box = (await pad.boundingBox())!;
  const y = box.y + box.height * 0.6;
  await page.mouse.move(box.x + 20, y);
  await page.mouse.down();
  for (let x = 0; x <= 200; x += 10) {
    await page.mouse.move(box.x + 20 + x, y - 20 * Math.sin(x / 15), { steps: 2 });
  }
  await page.mouse.up();
}

async function consentAndSign(page: Page) {
  await page.locator("#agreed").check();
  await page.fill("#signer_name", `${PATIENT.firstName} ${PATIENT.lastName}`);
  await sign(page);
}

const send = (page: Page) => page.getByRole("button", { name: /send consent form/i }).click();

/**
 * Keeps what the form posts, read in the page: Playwright doesn't expose a
 * multipart body that carries a file. Call before page.goto.
 */
async function capturePosts(page: Page) {
  await page.addInitScript(() => {
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
      if (body instanceof FormData) {
        const sig = body.get("signature");
        (window as unknown as { __posted: unknown }).__posted = {
          payload: JSON.parse(String(body.get("payload"))),
          signature: sig instanceof File ? { name: sig.name, type: sig.type, size: sig.size } : null,
        };
      }
      return send.call(this, body);
    };
  });
}

async function posted(page: Page) {
  return page.evaluate(() => (window as unknown as { __posted: { payload: Record<string, any>; signature: { name: string; type: string; size: number } | null } }).__posted);
}

for (const { name, viewport } of WIDTHS) {
  test.describe(`consent form, ${name} width`, () => {
    test.use({ viewport });

    test("a female patient with three vaccines sends it and lands on the thank-you page", async ({ page }) => {
      await capturePosts(page);
      await page.goto("/consent/");
      await fillAboutYou(page, "Female");
      await answerHealthQuestions(page);

      // Flu: no dose question
      await page.selectOption("#vaccine_0", "flu");
      await expect(page.locator("#reason_0")).toHaveValue("Seasonal influenza prevention");
      await expect(page.locator("#dose_0")).toHaveCount(0);

      // COVID booster, no last dose date given
      await page.getByRole("button", { name: /add another vaccine/i }).click();
      await page.selectOption("#vaccine_1", "covid");
      await page.selectOption("#dose_1", "booster");
      await expect(page.locator("#last_dose_1")).toBeVisible();

      // Shingles, 2nd dose, with the last dose's date
      await page.getByRole("button", { name: /add another vaccine/i }).click();
      await page.selectOption("#vaccine_2", "shingles");
      await expect(page.locator("#last_dose_2")).toHaveCount(0);
      await page.selectOption("#dose_2", "2");
      await page.locator("#last_dose_2").pressSequentially("20260514");
      await expect(page.locator("#last_dose_2")).toHaveValue("2026-05-14");

      await consentAndSign(page);
      await send(page);

      await expect(page).toHaveURL(/\/success\/consent\/?\?ref=[A-F0-9]{8}/, { timeout: 30_000 });
      await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(/we have your consent form/i);

      // What went over the wire: the contract's payload, and a PNG signature
      const { payload, signature } = await posted(page);
      expect(payload).toMatchObject({
        kind: "consent",
        forWhom: "me",
        patient: { dateOfBirth: "1980-05-02", phn: "9123456787", sex: "female", phone: "6045550100" },
        emergencyContact: { phone: "6045550199" },
        screening: { pregnant: "no", allergy: "yes", allergyDetail: "Fixture allergy (hives)" },
        items: [
          { vaccine: "flu", reason: "Seasonal influenza prevention" },
          { vaccine: "covid", reason: "COVID-19 prevention", dose: "booster" },
          { vaccine: "shingles", reason: "Shingles prevention", dose: "2", lastDoseDate: "2026-05-14" },
        ],
        acknowledgement: { agreed: true, relationship: "self", signerName: "Testy McFixture" },
      });
      expect(payload.items[0]).not.toHaveProperty("dose");
      expect(payload.items[1]).not.toHaveProperty("lastDoseDate");
      expect(payload.patient).not.toHaveProperty("weight");
      expect(payload.acknowledgement.signedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(signature).toMatchObject({ name: "signature.png", type: "image/png" });
      expect(signature!.size).toBeGreaterThan(100);
      expect(signature!.size).toBeLessThanOrEqual(300 * 1024);
    });

    test("a male patient never sees the pregnancy question", async ({ page }) => {
      await capturePosts(page);
      await page.goto("/consent/");
      await expect(question(page, /pregnant/i)).toBeVisible();

      await page.getByRole("radiogroup", { name: /sex at birth/i }).getByRole("radio", { name: "Male", exact: true }).click();
      await expect(question(page, /pregnant/i)).toHaveCount(0);
      await expect(page.getByText(/pregnant/i)).toHaveCount(0);

      await fillAboutYou(page, "Male");
      await answerHealthQuestions(page, { pregnant: false });
      await page.selectOption("#vaccine_0", "b12");
      await consentAndSign(page);

      await send(page);
      await expect(page).toHaveURL(/\/success\/consent/, { timeout: 30_000 });
      const { payload } = await posted(page);
      expect(payload.screening.pregnant).toBe("na");
      expect(payload.items).toEqual([{ vaccine: "b12", reason: "Vitamin B12 replacement" }]);

      // "Fill another" starts a fresh form
      await page.getByRole("link", { name: "Fill another" }).click();
      await expect(page).toHaveURL(/\/consent\/$/);
      await expect(page.locator("#first_name")).toHaveValue("");
      await expect(page.locator("#signer_name")).toHaveValue("");
    });

    test("a 9-digit PHN shows the error when leaving the field", async ({ page }) => {
      await page.goto("/consent/");
      const phn = page.locator("#phn");
      await phn.fill("912345678");
      await phn.blur();
      await expect(page.getByText("Enter all 10 digits of your Personal Health Number")).toBeVisible();
      await expect(phn).toHaveAttribute("aria-invalid", "true");

      await phn.fill("9123456787");
      await expect(page.getByText("Enter all 10 digits of your Personal Health Number")).toHaveCount(0);
    });
  });
}

test.describe("consent form details", () => {
  test("a pasted PHN with spaces keeps all 10 digits", async ({ page }) => {
    await page.goto("/consent/");
    await page.locator("#phn").focus();
    await page.evaluate(() => {
      const el = document.querySelector("#phn") as HTMLInputElement;
      el.value = "9123 456 787";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("#phn")).toHaveValue("9123456787");
  });

  test("relationship appears only for someone in care", async ({ page }) => {
    await page.goto("/consent/");
    await expect(page.getByRole("radiogroup", { name: /how are you related/i })).toHaveCount(0);
    await page.getByRole("radio", { name: "Someone in my care" }).click();
    await expect(page.getByRole("radiogroup", { name: /how are you related/i })).toBeVisible();
  });

  test("weight appears, and is required, only once the date of birth is under 18", async ({ page }) => {
    await page.goto("/consent/");
    const dob = page.locator("#date_of_birth");
    const weight = page.locator("#weight");

    // For me, never, whatever the age
    await dob.pressSequentially("20180309");
    await expect(weight).toHaveCount(0);

    // For someone in care: hidden for an adult, shown for a child
    await page.getByRole("radio", { name: "Someone in my care" }).click();
    await expect(weight).toBeVisible();
    await expect(page.locator('label[for="weight"]')).not.toContainText("(optional)");
    await dob.fill("");
    await expect(weight).toHaveCount(0);
    await dob.pressSequentially("19900101");
    await expect(weight).toHaveCount(0);

    await dob.fill("");
    await dob.pressSequentially("20180309");
    await expect(weight).toBeVisible();
    await send(page);
    await expect(page.locator("#weight-error")).toContainText("Enter their weight");
  });

  test("the HealthLinkBC link is for reference only and opens in a new tab", async ({ page }) => {
    await page.goto("/consent/");
    await page.selectOption("#vaccine_0", "hepa");
    const link = page.getByRole("link", { name: /about this vaccine on healthlinkbc/i });
    await expect(link).toHaveAttribute("href", "https://www.healthlinkbc.ca/healthlinkbc-files/hepatitis-vaccine");
    await expect(link).toHaveAttribute("target", "_blank");
    // The only checkbox on the form is the consent itself
    await expect(page.getByRole("checkbox")).toHaveCount(1);

    await page.selectOption("#vaccine_0", "b12");
    await expect(link).toHaveCount(0);
  });

  test("something else asks which one, and up to 4 vaccines can be listed", async ({ page }) => {
    await page.goto("/consent/");
    await page.selectOption("#vaccine_0", "other");
    await expect(page.locator("#other_0")).toBeVisible();
    await expect(page.locator("#reason_0")).toHaveValue("");

    const add = page.getByRole("button", { name: /add another vaccine/i });
    for (let i = 0; i < 3; i++) await add.click();
    await expect(page.locator('select[id^="vaccine_"]')).toHaveCount(4);
    await expect(add).toBeDisabled();
  });

  test("an empty form says what's missing, keeps focus on the summary, and sends nothing", async ({ page }) => {
    let sent = false;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/requests")) sent = true;
    });
    await page.goto("/consent/");
    await send(page);

    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status).toBeFocused();
    await expect(status).toContainText("Emergency contact name is required");
    await expect(status).toContainText("Sign in the box");
    expect(sent).toBe(false);
  });

  test("a tap on the signature pad isn't a signature", async ({ page }) => {
    await page.goto("/consent/");
    const box = (await page.locator("canvas#signature").boundingBox())!;
    await page.mouse.click(box.x + 30, box.y + 30);
    await send(page);
    await expect(page.locator("#signature-error")).toContainText("Sign in the box");

    await sign(page);
    await page.getByRole("button", { name: /clear signature/i }).click();
    await send(page);
    await expect(page.locator("#signature-error")).toContainText("Sign in the box");
  });
});

// ---------------------------------------------------------------------------
// The server, directly
// ---------------------------------------------------------------------------

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function consentPayload(overrides: Record<string, unknown> = {}) {
  return {
    kind: "consent",
    forWhom: "me",
    patient: {
      firstName: "Testy",
      lastName: "McFixture",
      dateOfBirth: "1980-05-02",
      phn: "9123456787",
      sex: "female",
      phone: "6045550100",
      email: "",
    },
    emergencyContact: { name: "Fixture Contact", phone: "6045550199" },
    screening: { sick: "no", allergy: "no", pregnant: "no", reaction: "no", neuro: "no", bleeding: "no" },
    items: [{ vaccine: "flu", reason: "Seasonal influenza prevention" }],
    acknowledgement: { agreed: true, signerName: "Testy McFixture", relationship: "self", signedAt: new Date().toISOString() },
    idempotencyKey: crypto.randomUUID(),
    renderedAt: new Date(Date.now() - 60_000).toISOString(),
    ...overrides,
  };
}

function multipart(payload: unknown, signature?: { name: string; mimeType: string; buffer: Buffer }) {
  return {
    payload: JSON.stringify(payload),
    ...(signature ? { signature } : {}),
  };
}

test.describe("consent API", () => {
  test("a missing signature is refused", async ({ request }) => {
    const res = await request.post("/api/requests", { multipart: multipart(consentPayload()) });
    expect(res.status()).toBe(400);
    expect((await res.json()).errors).toHaveProperty("signature");
  });

  test("a signature that isn't a PNG is refused, whatever it's called", async ({ request }) => {
    const res = await request.post("/api/requests", {
      multipart: multipart(consentPayload(), {
        name: "signature.png",
        mimeType: "image/png",
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Buffer.from("not really a png")]),
      }),
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).errors).toHaveProperty("signature");
  });

  test("an invalid consent gets its field errors back", async ({ request }) => {
    const bad = consentPayload();
    (bad.patient as Record<string, string>).sex = "male";
    (bad.patient as Record<string, string>).phn = "912345678";
    const res = await request.post("/api/requests", {
      multipart: multipart(bad, { name: "signature.png", mimeType: "image/png", buffer: PNG }),
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).errors).toEqual({
      "patient.phn": "Enter all 10 digits of your Personal Health Number",
      "screening.pregnant": "Answer yes or no",
    });
  });

  test("a valid consent is accepted with its signature", async ({ request }) => {
    const res = await request.post("/api/requests", {
      multipart: multipart(consentPayload(), { name: "signature.png", mimeType: "image/png", buffer: PNG }),
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, reference: expect.stringMatching(/^[A-F0-9]{8}$/) });
  });
});

test.describe("consent in /admin", () => {
  test("staff see the consent in its sections, with the signature", async ({ page, request }) => {
    const res = await request.post("/api/requests", {
      multipart: multipart(
        consentPayload({ patient: { ...consentPayload().patient, firstName: "Signy", lastName: "McConsent" } }),
        { name: "signature.png", mimeType: "image/png", buffer: PNG },
      ),
    });
    expect(res.status()).toBe(200);

    await page.goto("/admin");
    await page.fill("#password", "e2e-not-a-real-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.getByText("Signy McConsent").first().click();

    await expect(page.getByText(/Consent form/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "3 · Health questions" })).toBeVisible();
    await expect(page.getByText("Influenza (flu) vaccine", { exact: false })).toBeVisible();
    const signature = page.getByRole("img", { name: /signature of testy mcfixture/i });
    await expect(signature).toBeVisible();
    // The image really loads, behind the staff session
    expect(await signature.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
  });
});

test.describe("links to the consent form", () => {
  for (const [path, words] of [
    ["/services/immunizations/", /getting vaccinated\?/i],
    ["/services/drug-administration/", /coming in for an injection\?/i],
  ] as const) {
    test(`${path} sends people to it`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(words)).toBeVisible();
      await page.getByRole("link", { name: /fill in the consent form/i }).click();
      await expect(page).toHaveURL(/\/consent\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/vaccine consent/i);
    });
  }

  test("the call to action at the foot of Immunizations sends people to it", async ({ page }) => {
    await page.goto("/services/immunizations/");
    await expect(
      page.getByRole("heading", { name: "Ready to get your immunizations? Fill out your consent form." }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Consent Form", exact: true }).click();
    await expect(page).toHaveURL(/\/consent\/$/);
  });

  test("the footer links to it from every page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Vaccine consent form" }).click();
    await expect(page).toHaveURL(/\/consent\/$/);
  });

  test("the HTML sitemap lists it", async ({ page }) => {
    await page.goto("/sitemap/");
    await page.getByRole("main").getByRole("link", { name: /vaccine consent form/i }).click();
    await expect(page).toHaveURL(/\/consent\/$/);
  });

  test("the generated sitemap lists it, and not its thank-you page", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/consent/</loc>");
    expect(xml).not.toContain("/success/consent");
  });
});
