<template>
  <nav
    aria-label="Staff"
    class="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-primary-100 text-sm"
  >
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      :aria-current="isCurrent(link) ? 'page' : undefined"
      class="-mb-px border-b-2 py-3 transition-colors"
      :class="
        isCurrent(link)
          ? 'border-primary-900 font-medium text-primary-900'
          : 'border-transparent text-gray-600 hover:text-primary-900'
      "
    >
      {{ link.title }}
    </NuxtLink>
    <button
      type="button"
      class="ml-auto py-3 text-gray-600 hover:underline"
      @click="signOut"
    >
      Sign out
    </button>
  </nav>
</template>

<script lang="ts" setup>
const route = useRoute();

const links = [
  { title: "Prescription submissions", to: "/admin/" },
  { title: "Blog posts", to: "/admin/posts/" },
];

const isCurrent = (link: (typeof links)[number]) =>
  link.to === "/admin/"
    ? route.path === "/admin/" || route.path === "/admin"
    : route.path.startsWith(link.to);

// A full reload, so nothing from the session lingers in memory
async function signOut() {
  await $fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin/";
}
</script>
