// Shared submit logic for the three prescription forms.
//
// Replaces the native form POST that Netlify used to intercept. Key behaviours:
//
//   - Never clears the form on failure. Someone who just typed four medications
//     and attached two photos must not lose them to a dropped connection.
//   - Uses XMLHttpRequest rather than fetch, purely for upload progress. A 25 MB
//     submission over a phone connection with no feedback feels broken.
//   - Carries an idempotency key so a double-tapped submit button cannot create
//     two prescription requests.
//   - Gets a fresh Turnstile token after every failed attempt. Each token is
//     good for one check, and the server has spent it even when it then
//     rejects the form, so a retry with the old one would always fail.

import type { SubmitResponse } from "~~/shared/forms";

export interface SubmitFile {
  key: string;
  file: File;
}

export function useRequestForm(successPath: string) {
  const pending = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);
  const errors = ref<Record<string, string>>({});
  const errorRegion = ref<HTMLElement | null>(null);

  // Regenerated only after a successful submission, so every retry of the same
  // attempt carries the same key.
  const idempotencyKey = ref(newKey());
  const renderedAt = new Date().toISOString();

  // Honeypot. Hidden from humans, irresistible to bots.
  const botField = ref("");

  function newKey(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    // Only reached on very old browsers; the server validates the shape anyway.
    return "00000000-0000-4000-8000-" + Date.now().toString(16).padStart(12, "0");
  }

  function fieldError(path: string): string | undefined {
    return errors.value[path];
  }

  async function focusError() {
    await nextTick();
    errorRegion.value?.focus();
  }

  function post(formData: FormData): Promise<{ status: number; body: SubmitResponse }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/requests");
      xhr.responseType = "json";

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) progress.value = Math.round((e.loaded / e.total) * 100);
      });

      xhr.addEventListener("load", () => {
        const body = (xhr.response ?? { ok: false }) as SubmitResponse;
        resolve({ status: xhr.status, body });
      });
      xhr.addEventListener("error", () => reject(new Error("network")));
      xhr.addEventListener("timeout", () => reject(new Error("timeout")));

      xhr.timeout = 120_000;
      xhr.send(formData);
    });
  }

  async function submit(payload: Record<string, unknown>, files: SubmitFile[] = []) {
    if (pending.value) return;

    pending.value = true;
    progress.value = 0;
    error.value = null;
    errors.value = {};

    const turnstileToken = await waitForTurnstileToken();

    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify({
        ...payload,
        idempotencyKey: idempotencyKey.value,
        renderedAt,
        botField: botField.value,
        turnstileToken,
      }),
    );
    for (const f of files) formData.append(f.key, f.file, f.file.name);

    try {
      const { body } = await post(formData);

      if (body.ok) {
        idempotencyKey.value = newKey();
        await navigateTo(`${successPath}?ref=${encodeURIComponent(body.reference)}`);
        return;
      }

      resetTurnstile();
      errors.value = body.errors ?? {};
      error.value =
        body.error ??
        (Object.keys(errors.value).length
          ? "Please check the highlighted fields and try again."
          : "Something went wrong. Please try again, or call us at 604-848-7059.");
      await focusError();
    } catch {
      // The request may have reached the server and spent the token
      resetTurnstile();
      error.value =
        "We could not send that. Please check your connection and try again, or call us at 604-848-7059.";
      await focusError();
    } finally {
      pending.value = false;
    }
  }

  /**
   * Turnstile renders a hidden input into the form when configured. Absent in
   * development, where the server skips verification.
   */
  function readTurnstileToken(): string {
    if (typeof document === "undefined") return "";
    const input = document.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]',
    );
    return input?.value ?? "";
  }

  /**
   * The token, waiting a few seconds for one if the check is still running,
   * e.g. just after a reset. Empty when Turnstile isn't on the page, and the
   * server reports it if a token never arrives
   */
  async function waitForTurnstileToken(): Promise<string> {
    if (typeof window === "undefined" || !window.turnstile) return readTurnstileToken();
    for (let waited = 0; waited < 10_000; waited += 200) {
      const token = readTurnstileToken();
      if (token) return token;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return "";
  }

  function resetTurnstile() {
    if (typeof window !== "undefined") window.turnstile?.reset();
  }

  return {
    pending,
    progress,
    error,
    errors,
    errorRegion,
    botField,
    fieldError,
    submit,
  };
}
