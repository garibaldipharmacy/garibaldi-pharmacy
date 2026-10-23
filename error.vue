<template>
  <div class="flex min-h-screen flex-col">
    <Header />
    <main>
      <!-- Says plainly what happened, without blame, and what to do next.
           A missing page gets ways forward: the page we think they wanted,
           the most-used tasks, every main page, and a person to call. A
           server error offers a retry instead -->
      <PageIntro :title="heading">
        <p v-if="isNotFound">
          We couldn’t find
          <code
            class="rounded-md bg-primary-50 px-1.5 py-0.5 text-base text-primary-900 [overflow-wrap:anywhere]"
            >{{ path }}</code
          >. The page may have moved, or the address may have a typo.
        </p>
        <p v-else>
          It’s not something you did. Please try again in a moment, or call us
          if it keeps happening.
        </p>
      </PageIntro>

      <section class="mx-auto max-w-6xl px-4 sm:px-6">
        <!-- Pages whose name matches part of the address that was asked for,
             e.g. /flu-shots finds Immunizations -->
        <div
          v-if="isNotFound && suggestions.length"
          class="motion-rise-in rounded-3xl bg-secondary-100 p-3 [animation-delay:200ms] sm:p-4"
        >
          <h2 class="px-3 pt-3 text-lg font-semibold text-secondary-900">
            Were you looking for…
          </h2>
          <ul class="mt-2 grid gap-2 sm:grid-cols-2">
            <li
              v-for="page in suggestions"
              :key="page.link"
              class="rounded-2xl bg-white"
            >
              <ActionTile
                :icon="page.icon"
                :title="page.title"
                :to="page.link"
                theme="secondary"
                class="px-4 py-5"
              />
            </li>
          </ul>
        </div>

        <div v-if="!isNotFound" class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary-900 py-3 pl-5 pr-6 sm:w-auto font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            @click="retry"
          >
            <Icon name="fa6-solid:rotate-right" /> Try again
          </button>
          <NuxtLink
            to="/"
            class="inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary-50 py-3 pl-5 pr-6 sm:w-auto font-medium text-primary-900 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Icon name="fa6-solid:house" /> Go to the home page
          </NuxtLink>
        </div>

        <div
          v-if="isNotFound"
          class="mt-4 grid items-start gap-4 lg:grid-cols-[2fr_3fr]"
        >
          <!-- The tasks most visits are for -->
          <nav
            aria-labelledby="error-prescriptions"
            class="rounded-3xl bg-primary-50 p-3 sm:p-4"
          >
            <h2
              id="error-prescriptions"
              class="px-3 pt-3 text-lg font-semibold text-primary-900"
            >
              Prescriptions
            </h2>
            <ul class="mt-2 grid gap-2">
              <li
                v-for="action in prescriptionActions"
                :key="action.link"
                class="rounded-2xl bg-white"
              >
                <ActionTile
                  :icon="action.icon"
                  :title="action.title"
                  :to="action.link"
                  :theme="action.theme"
                  class="px-4 py-5"
                />
              </li>
            </ul>
          </nav>

          <!-- Every main page, for anyone who'd rather pick for themselves -->
          <nav
            aria-labelledby="error-pages"
            class="rounded-3xl bg-primary-50 p-6 text-primary-900 sm:p-8"
          >
            <h2 id="error-pages" class="text-lg font-semibold">Other pages</h2>
            <ul class="mt-4 grid gap-x-8 sm:grid-cols-2">
              <li v-for="page in otherPages" :key="page.link">
                <NuxtLink
                  :to="page.link"
                  class="group flex items-center gap-3 border-b border-primary-900/10 py-3 font-light transition-colors hover:text-primary-700"
                >
                  <Icon
                    :name="page.icon"
                    class="w-4 shrink-0 text-sm text-primary-400 transition-colors group-hover:text-primary-700"
                  />
                  {{ page.title }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <!-- A person to talk to, for anything the links don't cover -->
      <CallToAction
        title="Need help? Call or text us"
        :primaryButton="{
          text: contact.phone.main,
          icon: 'fa6-solid:phone',
          link: `tel:${contact.phone.main}`,
        }"
        :secondaryButton="
          isNotFound
            ? {
                text: 'Go to the home page',
                icon: 'fa6-solid:house',
                link: '/',
              }
            : null
        "
        :showFooter="false"
      >
        Monday to Friday, {{ weekdayHours }}
      </CallToAction>
    </main>
    <Footer class="mt-auto" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import { businessInfo } from "~/constants/business";
import { prescriptionActions } from "~/constants/prescriptionActions";
import { sitePages } from "~/constants/sitePages";

const props = defineProps({
  error: Object as () => NuxtError,
});

const { contact, business_hours } = businessInfo;
const weekdayHours = business_hours.full_week.monday.replace(" - ", " to ");

const isNotFound = computed(() => props.error?.statusCode === 404);

const heading = computed(() =>
  isNotFound.value
    ? "We can’t find that page"
    : "Sorry, something went wrong on our end",
);

const path = computed(() => {
  const url = props.error?.url || useRoute().fullPath;
  try {
    return decodeURI(new URL(url, "http://x").pathname);
  } catch {
    return url;
  }
});

const suggestions = computed(() => {
  const asked = path.value.toLowerCase();
  return sitePages
    .filter(
      (page) =>
        page.link !== "/" && page.words.some((word) => asked.includes(word)),
    )
    .slice(0, 4);
});

// The prescriptions already have their own panel
const otherPages = [
  ...sitePages.filter((page) => !page.link.startsWith("/prescriptions/")),
  { title: "Sitemap", link: "/sitemap/", icon: "fa6-solid:sitemap" },
];

// Reloads the page that failed, in case the problem has passed
const retry = () => {
  window.location.reload();
};

// Without an explicit title here, nuxt-seo-utils' fallbackTitle plugin fills
// one in from the raw error - that is how "500 - Failed to fetch dynamically
// imported module: https://..." ended up as our title in Google's index.
// It has to be "critical": at 99 the site name from app.head still won, so
// every error page was titled just "Garibaldi Pharmacy".
useHead(
  {
    title: () =>
      isNotFound.value
        ? "Page Not Found | Garibaldi Pharmacy"
        : "Something Went Wrong | Garibaldi Pharmacy",
  },
  { tagPriority: "critical" },
);

useSeoMeta({
  description:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
});
</script>
