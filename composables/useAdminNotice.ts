// A one-off confirmation carried from one admin page to the next, such as
// "Published …" shown on the post list after publishing from the editor.
// The page that shows it clears it, so it appears once.
export function useAdminNotice() {
  return useState<string | null>("admin-notice", () => null);
}
