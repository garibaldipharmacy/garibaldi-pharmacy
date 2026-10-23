<template>
  <!-- Every page, grouped, for people who'd rather see the whole site at
       once. Search engines read /sitemap.xml instead; this page's value to
       them is the links themselves, which reach pages the menus leave out -->
  <PageIntro title="Sitemap" />

  <div class="mx-auto max-w-6xl space-y-14 px-4 pb-20 sm:px-6 lg:pb-24">
    <section
      v-for="group in sitePageGroups"
      :key="group.title"
      :aria-labelledby="slug(group.title)"
    >
      <h2
        :id="slug(group.title)"
        class="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl"
      >
        {{ group.title }}
      </h2>
      <ul class="mt-6 grid gap-x-16 md:grid-cols-2">
        <li
          v-for="page in group.pages"
          :key="page.link"
          class="border-t border-primary-900/10"
        >
          <NuxtLink
            :to="page.link"
            class="group flex items-start gap-4 py-5 text-primary-900"
          >
            <Icon
              :name="page.icon"
              class="mt-1 w-5 shrink-0 text-primary-400 transition-colors group-hover:text-primary-700"
            />
            <span class="min-w-0">
              <span
                class="block text-lg font-medium underline-offset-4 group-hover:underline"
                >{{ page.title }}</span
              >
              <span class="mt-1 block font-light text-slate-600">{{
                page.description
              }}</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { sitePageGroups } from "~/constants/sitePages";

const slug = (text: string) =>
  `sitemap-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const title = "Sitemap | Garibaldi Pharmacy";
const description =
  "Every page on the Garibaldi Pharmacy website: prescriptions, compounding, immunizations, minor ailments and our in-house medical clinic in Squamish.";
const url = "https://garibaldipharmacy.com/sitemap/";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ...shareImages.dog,
  ogUrl: url,
  twitterTitle: title,
  twitterDescription: description,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: url,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
