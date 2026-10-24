import { describe, expect, it } from "vitest";

import {
  buildReceiptEmail,
  escapeHtml,
  openingHoursText,
  receiptSummary,
  type ReceiptInput,
} from "~~/server/utils/receiptEmail";
import type { RequestBody } from "~~/shared/forms";

// 10:15 a.m. on a Saturday in Squamish
const receivedAt = new Date("2026-10-24T17:15:00Z");

const patient = {
  firstName: "Zelda",
  lastName: "Quixote",
  dateOfBirth: "1961-02-03",
  phone: "6045550142",
  email: "zelda.quixote@example.com",
};

const refill = {
  kind: "refill",
  patient,
  medications: "Ramipril 10mg",
  retrievalMethod: "delivery",
  specialInstructions: "Leave it with Zorro next door",
} as RequestBody;

const transfer = {
  kind: "transfer",
  patient: { ...patient, sex: "female", phn: "9876543210" },
  fromPharmacyName: "Quokka Drugs",
  fromPharmacyPhone: "6045550199",
  transferAll: false,
  medications: "Metformin 500mg",
  notes: "Call me before noon",
} as RequestBody;

const send = {
  kind: "send",
  patient: { ...patient, sex: "female", phn: "9876543210" },
  prescriptions: [{ key: "rx_0" }, { key: "rx_1" }],
  insurance: [{ front: { key: "ins_0_front" } }],
} as RequestBody;

function input(payload: RequestBody, reference = "1A2B3C4D"): ReceiptInput {
  return { kind: payload.kind, reference, receivedAt, payload };
}

/** Everything a reader could see: subject, preview line, text and HTML */
function everything(receipt: ReturnType<typeof buildReceiptEmail>): string {
  return [receipt.subject, receipt.preheader, receipt.text, receipt.html].join("\n");
}

describe("receipt email", () => {
  it("says what the success page says, with the reference, for each kind", () => {
    const cases: [RequestBody, string, string][] = [
      [refill, "Refill request received · 1A2B3C4D", "Thank you for your refill request!"],
      [
        transfer,
        "Transfer request received · 1A2B3C4D",
        "Thank you for your prescription transfer request!",
      ],
      [send, "Prescription received · 1A2B3C4D", "Your prescription has been sent!"],
    ];

    for (const [payload, subject, heading] of cases) {
      const receipt = buildReceiptEmail(input(payload));
      expect(receipt.subject).toBe(subject);
      expect(receipt.html).toContain(escapeHtml(heading));
      expect(receipt.text).toContain(heading);
      expect(receipt.text).toContain("Your reference number: 1A2B3C4D");
      expect(receipt.html).toContain("1A2B3C4D");
      expect(receipt.preheader).toContain("1A2B3C4D");
    }
  });

  it("summarises the request from choices and counts", () => {
    expect(receiptSummary(input(refill))).toContainEqual([
      "How you'll get it",
      "Delivery (a delivery charge may apply)",
    ]);
    expect(
      receiptSummary(input({ ...refill, retrievalMethod: "pickup" } as RequestBody)),
    ).toContainEqual(["How you'll get it", "Pick up at the pharmacy"]);
    expect(receiptSummary(input(transfer))).toContainEqual([
      "Transferring",
      "The prescriptions you listed",
    ]);
    expect(
      receiptSummary(input({ ...transfer, transferAll: true } as RequestBody)),
    ).toContainEqual(["Transferring", "All of your prescriptions"]);
    expect(receiptSummary(input(send))).toContainEqual([
      "Attached",
      "2\u00A0prescriptions, 1\u00A0insurance\u00A0card",
    ]);
    expect(
      receiptSummary(input({ ...send, prescriptions: [{ key: "rx_0" }], insurance: [] } as RequestBody)),
    ).toContainEqual(["Attached", "1\u00A0prescription"]);
  });

  it("gives the time in the pharmacy's time zone", () => {
    const received = receiptSummary(input(refill)).find(([label]) => label === "Received");
    expect(received?.[1]).toMatch(/^Saturday, October 24, 2026 at 10:15/);
  });

  it("never includes anything the patient typed", () => {
    const typed = [
      "Zelda",
      "Quixote",
      "1961-02-03",
      "6045550142",
      "zelda.quixote",
      "9876543210",
      "Ramipril",
      "Zorro",
      "Quokka",
      "6045550199",
      "Metformin",
      "before noon",
    ];
    for (const payload of [refill, transfer, send]) {
      const seen = everything(buildReceiptEmail(input(payload))).toLowerCase();
      for (const value of typed) {
        expect(seen, `${payload.kind} email contains "${value}"`).not.toContain(value.toLowerCase());
      }
    }
  });

  it("still goes out when the stored request cannot be read", () => {
    const receipt = buildReceiptEmail({ kind: "refill", reference: "1A2B3C4D", receivedAt, payload: null });
    expect(receipt.subject).toBe("Refill request received · 1A2B3C4D");
    expect(receiptSummary({ kind: "refill", reference: "1A2B3C4D", receivedAt, payload: null })).toHaveLength(2);
  });

  it("falls back to general wording for an unknown kind", () => {
    const receipt = buildReceiptEmail({ kind: "mystery", reference: "1A2B3C4D", receivedAt, payload: null });
    expect(receipt.subject).toBe("Request received · 1A2B3C4D");
    expect(receipt.text).toContain("Thank you for your request!");
  });

  it("escapes what it puts into the HTML", () => {
    const receipt = buildReceiptEmail(input(refill, "<b>1A2B</b>"));
    expect(receipt.html).not.toContain("<b>1A2B</b>");
    expect(receipt.html).toContain("&lt;b&gt;1A2B&lt;/b&gt;");
  });

  it("embeds the logo and sprout inline, as PNGs the HTML refers to", () => {
    const receipt = buildReceiptEmail(input(refill));
    expect(receipt.images).toHaveLength(2);
    for (const image of receipt.images) {
      expect(receipt.html).toContain(`src="cid:${image.contentId}"`);
      expect(image.contentType).toBe("image/png");
      const bytes = Buffer.from(image.content, "base64");
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    }
  });

  it("asks patients not to reply, and to phone instead", () => {
    const receipt = buildReceiptEmail(input(refill));
    expect(receipt.text).toContain("Please don't reply to this email.");
    expect(receipt.text).toContain("replies aren't received");
    expect(receipt.html).toContain(escapeHtml("Please don't reply to this email."));
    expect(receipt.html).toContain('href="tel:+16048487059"');
  });

  it("lists the opening hours while they are a simple weekday schedule", () => {
    expect(openingHoursText()).toBe("Monday to Friday, 9:00 AM to 6:00 PM");
  });
});
