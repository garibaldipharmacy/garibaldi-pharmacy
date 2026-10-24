import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { closeDb, getDb, persistSubmission } from "~~/server/utils/db";
import { drainOutbox, sendMail } from "~~/server/utils/mailer";

let dir: string;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "gp-mail-"));
  process.env.DATABASE_PATH = join(dir, "test.db");
  closeDb();
  process.env.RESEND_API_KEY = "re_test_key";
  delete process.env.MAIL_FROM;
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.RESEND_API_KEY;
  closeDb();
  rmSync(dir, { recursive: true, force: true });
});

function queueRefill(notifications: { kind: string; recipient: string }[]) {
  const id = randomUUID();
  persistSubmission({
    id,
    reference: "1A2B3C4D",
    kind: "refill",
    receivedAt: new Date().toISOString(),
    flags: [],
    idempotencyKey: randomUUID(),
    payload: {
      kind: "refill",
      patient: { firstName: "Zelda", lastName: "Quixote", email: "patient@example.com" },
      medications: "Ramipril 10mg",
      retrievalMethod: "pickup",
      specialInstructions: "",
    },
    files: [],
    notifications,
  });
  return id;
}

function outbox() {
  return getDb()
    .prepare("SELECT kind, recipient, attempts, sent_at, last_error FROM outbox ORDER BY id")
    .all() as unknown as {
    kind: string;
    recipient: string;
    attempts: number;
    sent_at: string | null;
    last_error: string | null;
  }[];
}

describe("sendMail", () => {
  it("sends HTML, text and inline pictures through Resend, from the no-reply address", async () => {
    const result = await sendMail({
      to: "patient@example.com",
      subject: "Hello",
      text: "Hi",
      html: "<p>Hi <img src=\"cid:logo\"></p>",
      images: [{ filename: "logo.png", contentType: "image/png", contentId: "logo", content: "aGk=" }],
    });

    expect(result).toEqual({ ok: true, skipped: false });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers).toMatchObject({ Authorization: "Bearer re_test_key" });
    // toEqual also proves there is no reply_to: nobody should reply to it
    expect(JSON.parse(init.body as string)).toEqual({
      from: "Garibaldi Pharmacy - No Reply <noreply@send.garibaldipharmacy.com>",
      to: ["patient@example.com"],
      subject: "Hello",
      text: "Hi",
      html: "<p>Hi <img src=\"cid:logo\"></p>",
      attachments: [
        { filename: "logo.png", content: "aGk=", content_type: "image/png", content_id: "logo" },
      ],
    });
  });

  it("sends a Reply-To only when a message asks for one", async () => {
    await sendMail({ to: "a@example.com", subject: "Hello", text: "Hi", replyTo: "b@example.com" });
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.reply_to).toBe("b@example.com");
  });

  it("only logs when no API key is configured", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await sendMail({ to: "patient@example.com", subject: "Hello", text: "Hi" });
    expect(result).toEqual({ ok: true, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a refusal from Resend", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 403 }));
    const result = await sendMail({ to: "patient@example.com", subject: "Hello", text: "Hi" });
    expect(result).toEqual({ ok: false, skipped: false, error: "Resend returned 403" });
  });
});

describe("drainOutbox", () => {
  it("sends the patient's receipt and nothing to the pharmacy", async () => {
    queueRefill([{ kind: "patient_confirmation", recipient: "patient@example.com" }]);

    expect(await drainOutbox()).toEqual({ sent: 1, failed: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.to).toEqual(["patient@example.com"]);
    expect(body).not.toHaveProperty("reply_to");
    expect(body.subject).toBe("Refill request received · 1A2B3C4D");
    expect(body.html).toContain("Pick up at the pharmacy");
    expect(body.html).not.toContain("Ramipril");
    expect(body.html).not.toContain("Zelda");
    expect(body.attachments.map((a: { content_id: string }) => a.content_id)).toEqual([
      "logo@garibaldipharmacy.com",
      "sprout@garibaldipharmacy.com",
    ]);
    expect(outbox()[0].sent_at).not.toBeNull();
  });

  it("closes off a staff notification queued by an older release, unsent", async () => {
    queueRefill([
      { kind: "staff_notification", recipient: "pharmacist@garibaldipharmacy.com" },
      { kind: "patient_confirmation", recipient: "patient@example.com" },
    ]);

    await drainOutbox();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [staff, patient] = outbox();
    expect(staff.sent_at).not.toBeNull();
    expect(staff.last_error).toMatch(/retired/);
    expect(patient.sent_at).not.toBeNull();
  });

  it("keeps a failed receipt queued for a later attempt", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    queueRefill([{ kind: "patient_confirmation", recipient: "patient@example.com" }]);

    expect(await drainOutbox()).toEqual({ sent: 0, failed: 1 });
    const [row] = outbox();
    expect(row.sent_at).toBeNull();
    expect(row.attempts).toBe(1);
    expect(row.last_error).toBe("Resend returned 500");
  });
});
