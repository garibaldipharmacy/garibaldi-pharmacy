// Lets the page decide whether to show the sign-in form without guessing from a
// failed data request. Deliberately leaks nothing beyond "configured" and
// "signed in".
export default defineEventHandler((event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  return {
    configured: adminConfigured(),
    authenticated: adminConfigured() && tokenValid(getCookie(event, SESSION_COOKIE)),
  };
});
