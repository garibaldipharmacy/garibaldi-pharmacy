<template>
  <article v-if="post" class="mx-auto max-w-3xl px-4 pt-12 pb-16 sm:px-6 lg:pt-20">
    <!-- Only the signed-in editor can reach a draft -->
    <p
      v-if="post.isDraft"
      class="mb-8 rounded-xl bg-amber-50 px-4 py-3 text-sm font-light text-amber-900 ring-1 ring-amber-200"
    >
      <strong class="font-medium">Draft preview.</strong> Only signed-in staff
      can see this until it’s published.
    </p>

    <NuxtLink
      to="/blog/"
      class="inline-flex items-center gap-2 text-sm font-light text-slate-600 transition-colors hover:text-primary-900"
    >
      <Icon name="fa6-solid:arrow-left" class="text-xs" />
      All posts
    </NuxtLink>

    <p
      class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-light text-slate-600"
    >
      <NuxtLink
        :to="`/blog/?category=${post.category}`"
        class="font-normal text-secondary-900 underline-offset-4 hover:underline"
        >{{ categoryLabel(post.category) }}</NuxtLink
      >
      <span aria-hidden="true" class="text-slate-300">·</span>
      <time :datetime="post.publishedAt">{{
        formatPharmacyDate(post.publishedAt)
      }}</time>
      <span
        v-if="post.isAnnouncement"
        class="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-900"
        >Announcement</span
      >
    </p>
    <h1
      class="motion-rise mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-primary-900 sm:text-5xl"
    >
      {{ post.title }}
    </h1>

    <img
      v-if="post.coverImage"
      :src="post.coverImage"
      :alt="post.coverAlt"
      fetchpriority="high"
      class="motion-rise mt-10 aspect-[16/9] w-full rounded-3xl object-cover [animation-delay:150ms]"
    />

    <!-- Built on the server from the editor's document, keeping only what
         the toolbar can make. See shared/postDoc.ts -->
    <div class="post-body mt-10" v-html="post.html" />
  </article>

  <CallToAction />
</template>

<script lang="ts" setup>
import { categoryLabel, type PublicPostDTO } from "~~/shared/posts";
import { formatPharmacyDate } from "~~/shared/pharmacyTime";

const route = useRoute();
const slug = String(route.params.slug);
const preview = route.query.preview === "1";

const { data: post, error } = await useFetch<PublicPostDTO>(
  `/api/posts/${encodeURIComponent(slug)}`,
  { query: preview ? { preview: "1" } : {} },
);

if (error.value || !post.value) {
  throw createError({
    statusCode: error.value?.statusCode === 404 || !post.value ? 404 : 500,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const site = useSiteConfig();
const canonical = new URL(`/blog/${post.value.slug}/`, site.url).href;
const title = `${post.value.title} | Garibaldi Pharmacy`;
const description = post.value.summary;
const image = post.value.coverImage
  ? {
      ogImage: post.value.coverImage,
      ogImageAlt: post.value.coverAlt,
      twitterImage: post.value.coverImage,
      twitterImageAlt: post.value.coverAlt,
      twitterCard: "summary_large_image" as const,
    }
  : shareImages.dog;

useSeoMeta({
  title,
  description,
  ogType: "article",
  ogTitle: title,
  ogDescription: description,
  ...image,
  ogUrl: canonical,
  twitterTitle: title,
  twitterDescription: description,
  articlePublishedTime: post.value.publishedAt,
  articleModifiedTime: post.value.updatedAt,
  // A draft preview must never be indexed, even if its address leaks
  robots: post.value.isDraft ? "noindex, nofollow" : undefined,
});

useHead({
  htmlAttrs: { lang: "en" },
  link: [
    { rel: "canonical", href: canonical },
    { rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" },
  ],
});

useSchemaOrg([
  defineArticle({
    "@type": "BlogPosting",
    headline: post.value.title,
    description,
    image: post.value.coverImage
      ? new URL(post.value.coverImage, site.url).href
      : undefined,
    articleSection: categoryLabel(post.value.category),
    datePublished: post.value.publishedAt,
    dateModified: post.value.updatedAt,
  }),
]);
</script>
