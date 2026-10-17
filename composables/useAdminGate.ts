// For admin pages other than /admin/ itself, which holds the sign-in form.
// Sends anyone without a session there, to come back once signed in. The
// API routes are what actually guard the data; this only saves showing an
// empty page that can't load anything.
export function useAdminGate() {
  const route = useRoute();
  const ready = ref(false);

  onMounted(async () => {
    const session = await $fetch<{ authenticated: boolean }>("/api/admin/session");
    if (!session.authenticated) {
      await navigateTo({ path: "/admin/", query: { next: route.fullPath } });
      return;
    }
    ready.value = true;
  });

  return ready;
}
