// The email a patient gets after sending one of the prescription forms: the
// website's "Thank you" screen, as an email. It shares the dashboard's "ready"
// email design (grey card, green check, reference box, sprout), so the emails a
// patient gets from us look like they come from the same pharmacy.
//
// Nothing the visitor typed goes into it, not even their name. The address is
// unverified, so a typo, or a script entering someone else's address, puts this
// email in a stranger's inbox. It holds only our own wording, the reference the
// server issued, and facts such as "Pick up at the pharmacy" or "2
// prescriptions".
//
// Email-safe HTML (tables and inline styles) with a plain-text version alongside,
// so it reads the same in Outlook, Gmail and Apple Mail.

import { businessInfo } from "~~/constants/business";
import type { RequestBody } from "~~/shared/forms";
import { PHARMACY_TIME_ZONE } from "~~/shared/pharmacyTime";
import { LOGO_PNG_BASE64, SPROUT_PNG_BASE64 } from "./receiptImages";

export interface InlineImage {
  filename: string;
  contentType: string;
  /** The HTML shows it with src="cid:<contentId>" */
  contentId: string;
  /** Base64 file contents */
  content: string;
}

export interface ReceiptInput {
  /** The submission's kind: refill, transfer or send */
  kind: string;
  reference: string;
  receivedAt: Date;
  /**
   * The stored request, read only for choices and counts that we put into our
   * own words. Null when it cannot be read; the email still goes out.
   */
  payload: RequestBody | null;
}

export interface ReceiptEmail {
  subject: string;
  /** The preview line most inboxes show after the subject */
  preheader: string;
  text: string;
  html: string;
  images: InlineImage[];
}

export type SummaryRow = [label: string, value: string];

interface Wording {
  subject: string;
  heading: string;
  message: string;
  /** Completes "...to confirm your ___", as on the success page */
  confirming: string;
  /** The "Request" line of the summary */
  request: string;
}

// The same words as pages/success/*.vue, so the email says what the screen said.
const WORDING: Record<string, Wording> = {
  refill: {
    subject: "Refill request received",
    heading: "Thank you for your refill request!",
    message:
      "We have received your prescription refill request and will be in touch shortly.",
    confirming: "refill request",
    request: "Prescription refill",
  },
  transfer: {
    subject: "Transfer request received",
    heading: "Thank you for your prescription transfer request!",
    message:
      "We have received your prescription transfer request and will be in touch shortly.",
    confirming: "prescription transfer",
    request: "Prescription transfer",
  },
  send: {
    subject: "Prescription received",
    heading: "Your prescription has been sent!",
    message:
      "We have received your prescription request and will be in touch shortly. Please keep your prescription as it must be provided to the pharmacist at the time of pickup.",
    confirming: "prescription",
    request: "New prescription",
  },
};

const GENERIC: Wording = {
  subject: "Request received",
  heading: "Thank you for your request!",
  message: "We have received your request and will be in touch shortly.",
  confirming: "request",
  request: "Prescription request",
};

const LOGO_CID = "logo@garibaldipharmacy.com";
const SPROUT_CID = "sprout@garibaldipharmacy.com";

const PHONE: string = businessInfo.contact.phone.main;
const PHONE_HREF = `tel:+1${PHONE.replace(/\D/g, "")}`;
const ADDRESS: string = businessInfo.address.full;
const MAPS: string = businessInfo.links.google_maps;
const WEBSITE: string = businessInfo.links.website;
const WEBSITE_LABEL = WEBSITE.replace(/^https?:\/\//, "").replace(/\/$/, "");

const PRIVACY_NOTE =
  "For your privacy, we never include medication names or other health details in email.";

// The receipt comes from a no-reply address, with no Reply-To (see mailer.ts)
const NO_REPLY_HEADLINE = "Please don't reply to this email.";
const NO_REPLY_DETAIL = `It was sent automatically and replies aren't received. For questions, or if you didn't send this request, call us at ${PHONE}.`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// A no-break space keeps "1 insurance card" and "10:15 a.m." on one line
const NBSP = "\u00A0";

const plural = (n: number, one: string) =>
  `${n} ${one}${n === 1 ? "" : "s"}`.replace(/ /g, NBSP);

/** "Saturday, October 24, 2026 at 10:15 a.m." in the pharmacy's time zone */
export function receivedAtText(at: Date): string {
  return at
    .toLocaleString("en-CA", {
      timeZone: PHARMACY_TIME_ZONE,
      dateStyle: "full",
      timeStyle: "short",
    })
    .replace(/\s([ap]\.m\.)$/, `${NBSP}$1`);
}

/**
 * "Monday to Friday, 9:00 AM to 6:00 PM" while the week has that shape. Null
 * otherwise, so changed hours drop out of the email instead of being misstated.
 */
export function openingHoursText(): string | null {
  const week = businessInfo.business_hours.full_week;
  const weekdays = [week.monday, week.tuesday, week.wednesday, week.thursday, week.friday];
  if (week.monday === "Closed" || !weekdays.every((hours) => hours === week.monday)) {
    return null;
  }
  if (week.saturday !== "Closed" || week.sunday !== "Closed") return null;
  return `Monday to Friday, ${week.monday.replace(/\s*-\s*/, " to ")}`;
}

/** The "Your request" lines. Built from choices and counts, never from typed text. */
export function receiptSummary(input: ReceiptInput): SummaryRow[] {
  const wording = WORDING[input.kind] ?? GENERIC;
  const rows: SummaryRow[] = [
    ["Request", wording.request],
    ["Received", receivedAtText(input.receivedAt)],
  ];

  const payload = input.payload;
  if (!payload || payload.kind !== input.kind) return rows;

  if (payload.kind === "refill") {
    if (payload.retrievalMethod === "pickup") {
      rows.push(["How you'll get it", "Pick up at the pharmacy"]);
    } else if (payload.retrievalMethod === "delivery") {
      rows.push(["How you'll get it", "Delivery (a delivery charge may apply)"]);
    }
  } else if (payload.kind === "transfer") {
    rows.push([
      "Transferring",
      payload.transferAll ? "All of your prescriptions" : "The prescriptions you listed",
    ]);
  } else if (payload.kind === "send") {
    const prescriptions = Array.isArray(payload.prescriptions) ? payload.prescriptions.length : 0;
    const cards = Array.isArray(payload.insurance) ? payload.insurance.length : 0;
    const attached = [plural(prescriptions, "prescription")];
    if (cards > 0) attached.push(plural(cards, "insurance card"));
    rows.push(["Attached", attached.join(", ")]);
  }

  return rows;
}

export function buildReceiptEmail(input: ReceiptInput): ReceiptEmail {
  const wording = WORDING[input.kind] ?? GENERIC;
  const rows = receiptSummary(input);
  const subject = `${wording.subject} · ${input.reference}`;
  const preheader = `Your reference number is ${input.reference}. We'll be in touch within one business day.`;

  return {
    subject,
    preheader,
    text: textVersion(wording, input.reference, rows),
    html: htmlVersion(wording, input.reference, rows, subject, preheader),
    images: [
      {
        filename: "garibaldi-pharmacy.png",
        contentType: "image/png",
        contentId: LOGO_CID,
        content: LOGO_PNG_BASE64,
      },
      {
        filename: "garibaldi-sprout.png",
        contentType: "image/png",
        contentId: SPROUT_CID,
        content: SPROUT_PNG_BASE64,
      },
    ],
  };
}

function contactLine(wording: Wording): string {
  return `We'll contact you by e-mail or phone within one business day to confirm your ${wording.confirming}. If you haven't heard from us by then, please call ${PHONE}.`;
}

function textVersion(wording: Wording, reference: string, rows: SummaryRow[]): string {
  const hours = openingHoursText();
  return [
    wording.heading,
    "",
    wording.message,
    "",
    `Your reference number: ${reference}`,
    "",
    "Your request",
    ...rows.map(([label, value]) => `  ${label}: ${value}`),
    "",
    contactLine(wording),
    "",
    PRIVACY_NOTE,
    "",
    "Garibaldi Pharmacy",
    ADDRESS,
    PHONE,
    ...(hours ? [`Open ${hours}`] : []),
    WEBSITE,
    "",
    `${NO_REPLY_HEADLINE} ${NO_REPLY_DETAIL}`,
  ].join("\n");
}

// Colours from tailwind.config.js, so the email matches the site
const C = {
  ink: "#141E39", // primary-900: headings and values
  link: "#33467A", // primary-700
  body: "#475569", // slate-600: body text
  muted: "#64748B", // slate-500: labels and footer
  card: "#F1F2F4", // primary-50: the success card
  line: "#D9DCE3", // border of the white boxes
  rule: "#EBEDF1", // between summary lines
  check: "#56B33D", // secondary-700: the check badge
  info: "#8190BB", // primary-400: the "i" badge
};

const FONT =
  "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

function htmlVersion(
  wording: Wording,
  reference: string,
  rows: SummaryRow[],
  subject: string,
  preheader: string,
): string {
  const e = escapeHtml;
  const hours = openingHoursText();

  const summaryRows = rows
    .map(([label, value], i) => {
      const rule = i === 0 ? "" : ` border-top: 1px solid ${C.rule};`;
      return `<tr>
                      <td valign="top" width="34%" style="padding: 9px 8px 9px 20px; font-size: 14px; line-height: 1.45; color: ${C.muted};${rule}">${e(label)}</td>
                      <td valign="top" style="padding: 9px 20px 9px 8px; font-size: 14px; line-height: 1.45; font-weight: 600; color: ${C.ink};${rule}">${e(value)}</td>
                    </tr>`;
    })
    .join("\n                    ");

  const contact = e(contactLine(wording)).replace(
    e(PHONE),
    `<a href="${PHONE_HREF}" style="color: ${C.link}; font-weight: 600; text-decoration: underline; white-space: nowrap;">${e(PHONE)}</a>`,
  );

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${e(subject)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>body, table, td, h1, p, a, span { font-family: 'Segoe UI', Arial, sans-serif !important; } .gp-mono { font-family: Consolas, 'Courier New', monospace !important; }</style>
  <![endif]-->
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 520px) {
      .gp-page { padding: 20px 10px !important; }
      .gp-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .gp-h1 { font-size: 24px !important; }
      .gp-ref { font-size: 22px !important; letter-spacing: 0.1em !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: #FFFFFF;">
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">${e(preheader)}${"&#847;&zwnj;&nbsp;".repeat(40)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF;">
    <tr>
      <td align="center" class="gp-page" style="padding: 32px 16px;">
        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; font-family: ${FONT}; color: ${C.ink};">
          <tr>
            <td align="center" style="padding: 0 0 24px;">
              <a href="${e(WEBSITE)}" style="text-decoration: none;"><img src="cid:${LOGO_CID}" width="172" height="50" alt="Garibaldi Pharmacy" style="display: block; border: 0; outline: none; color: ${C.ink}; font-size: 18px; font-weight: 700;"></a>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${C.card}; border-radius: 24px;">
                <tr>
                  <td align="center" style="padding: 40px 24px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" width="64" height="64" style="width: 64px; height: 64px; border-radius: 32px; background: ${C.check}; color: #FFFFFF; font-size: 30px; font-weight: 700; line-height: 64px; text-align: center; mso-line-height-rule: exactly;">&#10003;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="gp-pad" style="padding: 22px 32px 0;">
                    <h1 class="gp-h1" style="margin: 0; font-family: ${FONT}; font-size: 28px; line-height: 1.2; font-weight: 800; color: ${C.ink};">${e(wording.heading)}</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="gp-pad" style="padding: 12px 40px 0; font-size: 16px; line-height: 1.55; color: ${C.body};">${e(wording.message)}</td>
                </tr>
                <tr>
                  <td align="center" style="padding: 28px 24px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF; border: 1px solid ${C.line}; border-radius: 16px;">
                      <tr>
                        <td align="center" style="padding: 14px 36px 2px; font-size: 14px; line-height: 1.4; color: ${C.body};">Your reference number</td>
                      </tr>
                      <tr>
                        <td align="center" class="gp-ref gp-mono" style="padding: 2px 36px 16px; font-family: ${MONO}; font-size: 26px; line-height: 1.3; font-weight: 700; letter-spacing: 0.14em; color: ${C.ink};">${e(reference)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="gp-pad" style="padding: 28px 28px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF; border: 1px solid ${C.line}; border-radius: 16px;">
                    <tr>
                      <td colspan="2" style="padding: 16px 20px 6px; font-size: 12px; line-height: 1.4; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${C.muted};">Your request</td>
                    </tr>
                    ${summaryRows}
                    <tr>
                      <td colspan="2" style="padding: 6px 20px 16px; font-size: 12px; line-height: 1.5; color: ${C.muted};">${e(PRIVACY_NOTE)}</td>
                    </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="gp-pad" style="padding: 24px 32px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding: 2px 10px 0 0;"><span style="display: inline-block; width: 18px; height: 18px; border-radius: 9px; background: ${C.info}; color: #FFFFFF; font-size: 12px; font-weight: 700; line-height: 18px; text-align: center; font-family: Georgia, serif;">i</span></td>
                        <td style="font-size: 14px; line-height: 1.55; color: ${C.body};">${contact}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding: 10px 28px 0; font-size: 0; line-height: 0;"><img src="cid:${SPROUT_CID}" width="56" height="64" alt="" style="display: block; border: 0; outline: none;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 28px 24px 0; font-size: 13px; line-height: 1.65; color: ${C.muted};">
              <strong style="color: ${C.ink};">Garibaldi Pharmacy</strong><br>
              <a href="${e(MAPS)}" style="color: ${C.muted}; text-decoration: none;">${e(ADDRESS)}</a><br>
              <a href="${PHONE_HREF}" style="color: ${C.muted}; text-decoration: none; white-space: nowrap;">${e(PHONE)}</a><br>
              ${hours ? `<span style="white-space: nowrap;">Open ${e(hours)}</span><br>` : ""}
              <a href="${e(WEBSITE)}" style="color: ${C.link}; text-decoration: underline;">${e(WEBSITE_LABEL)}</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 16px 24px 8px; font-size: 12px; line-height: 1.6; color: ${C.muted};"><strong style="color: ${C.ink};">${e(NO_REPLY_HEADLINE)}</strong> ${e(NO_REPLY_DETAIL).replace(
              e(PHONE),
              `<a href="${PHONE_HREF}" style="color: ${C.link}; white-space: nowrap;">${e(PHONE)}</a>`,
            )}</td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}
