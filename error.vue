<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div
      class="bg-primary-100 text-primary-900 container mx-auto rounded my-10 p-10"
    >
      <h1 class="text-3xl font-bold">{{ heading }}</h1>
      <button
        @click="handleError"
        class="text-2xl mt-5 hover:text-secondary-900 transition-colors"
      >
        Return to home
      </button>
    </div>
    <Footer class="mt-auto" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const isNotFound = computed(() => props.error?.statusCode === 404);

const heading = computed(() =>
  isNotFound.value
    ? "Oops! That page doesn't exist."
    : "Sorry, something went wrong on our end."
);

// Without an explicit title here, nuxt-seo-utils' fallbackTitle plugin fills
// one in from the raw error - that is how "500 - Failed to fetch dynamically
// imported module: https://..." ended up as our title in Google's index.
// tagPriority beats both that fallback (101) and app.head (100).
useHead(
  {
    title: () =>
      isNotFound.value
        ? "Page Not Found | Garibaldi Pharmacy"
        : "Something Went Wrong | Garibaldi Pharmacy",
  },
  { tagPriority: 99 }
);

useSeoMeta({
  description:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
});

const handleError = () => clearError({ redirect: "/" });
</script>
