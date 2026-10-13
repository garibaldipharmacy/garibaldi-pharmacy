// Shared-password sign-in for the submissions view.
//
// Rate limited by IP, because a password that guards prescription data should
// not be brute-forceable at network speed. Per-staff accounts with a real audit
// trail come later, in the shift-dashboard, where staff logins already exist.

export default defineEventHandler(async (event) => {
  if (!adminConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "The submissions area is not configured. Set ADMIN_PASSWORD_HASH on the server.",
    });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  const limited = rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!limited.allowed) {
    setResponseHeader(event, "Retry-After", String(limited.retryAfterSeconds));
    throw createError({
      statusCode: 429,
      statusMessage: "Too many attempts. Try again shortly.",
    });
  }

  const body = await readBody<{ password?: unknown }>(event).catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)) {
    // Never say whether it was close. Never log the attempt's contents.
    console.warn("[admin] failed sign-in attempt");
    throw createError({ statusCode: 401, statusMessage: "Incorrect password." });
  }

  setSessionCookie(event, issueToken());
  return { ok: true };
});
