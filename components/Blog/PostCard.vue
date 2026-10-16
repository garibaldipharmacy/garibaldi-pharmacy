<template>
  <!-- One post in the blog's list. The whole card is the link, with the
       title as its name -->
  <NuxtLink
    :to="`/blog/${post.slug}/`"
    class="group flex h-full flex-col text-primary-900"
  >
    <div
      class="aspect-[16/10] overflow-hidden rounded-2xl bg-secondary-100 ring-1 ring-primary-900/5"
    >
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.coverAlt"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <!-- Without a cover picture, the logo's mountain on the brand green -->
      <div
        v-else
        aria-hidden="true"
        class="flex h-full items-center justify-center text-secondary-900/30"
      >
        <Icon name="fa6-solid:mountain-sun" class="text-6xl" />
      </div>
    </div>

    <p
      class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-light text-slate-600"
    >
      <span class="font-normal text-secondary-900">{{
        categoryLabel(post.category)
      }}</span>
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
    <h2
      class="mt-2 text-xl font-medium leading-snug underline-offset-4 group-hover:underline"
    >
      {{ post.title }}
    </h2>
    <p class="mt-2 font-light leading-relaxed text-slate-600">
      {{ post.summary }}
    </p>
  </NuxtLink>
</template>

<script lang="ts" setup>
import { categoryLabel, type PublicPostSummaryDTO } from "~~/shared/posts";
import { formatPharmacyDate } from "~~/shared/pharmacyTime";

defineProps<{ post: PublicPostSummaryDTO }>();
</script>
