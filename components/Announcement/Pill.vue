<template>
  <!-- The running announcement, above a page's main heading: frosted over
       the homepage photo, light green on the white inner pages. Hidden on
       the announcement's own post, where it would only link to itself -->
  <NuxtLink
    v-if="announcement && route.path !== link"
    :to="link"
    :class="[
      'motion-rise group mb-6 inline-flex max-w-xl items-center gap-3 rounded-2xl py-1.5 pl-1.5 pr-4 text-sm font-light ring-1 transition-colors sm:rounded-full',
      variant === 'light'
        ? 'bg-secondary-50 text-primary-900 ring-secondary-200 hover:bg-secondary-100'
        : 'bg-white/15 text-white ring-white/25 backdrop-blur-md hover:bg-white/25',
    ]"
  >
    <span
      class="shrink-0 rounded-full bg-secondary-900 px-2.5 py-1 text-xs font-medium text-white"
      >New</span
    >
    <span>{{ announcement.snippet }}</span>
    <Icon
      name="fa6-solid:arrow-right"
      class="shrink-0 text-xs transition-transform group-hover:translate-x-0.5"
    />
  </NuxtLink>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ variant?: "frosted" | "light" }>(), {
  variant: "frosted",
});

const route = useRoute();
const announcement = useAnnouncement();
const link = computed(() =>
  announcement.value ? `/blog/${announcement.value.slug}/` : "",
);
</script>
