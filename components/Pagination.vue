<template>
  <!-- Real links, so each page has its own address that search engines
       can follow and visitors can bookmark or go back to -->
  <nav
    v-if="pageCount > 1"
    aria-label="Pages"
    class="flex items-center justify-center gap-1 text-sm sm:gap-2"
  >
    <NuxtLink
      v-if="page > 1"
      :to="to(page - 1)"
      rel="prev"
      class="flex h-10 items-center gap-2 rounded-full px-3 text-primary-900 transition-colors hover:bg-primary-50 sm:px-4"
    >
      <Icon name="fa6-solid:arrow-left" class="text-xs" />
      <span class="hidden sm:inline">Previous</span>
      <span class="sr-only sm:hidden">Previous page</span>
    </NuxtLink>
    <span v-else aria-hidden="true" class="w-10 sm:w-28" />

    <ul class="flex items-center gap-1">
      <li v-for="(item, index) in items" :key="index">
        <span
          v-if="item === 'gap'"
          aria-hidden="true"
          class="flex h-10 w-6 items-center justify-center text-slate-400"
          >…</span
        >
        <NuxtLink
          v-else
          :to="to(item)"
          :aria-current="item === page ? 'page' : undefined"
          :aria-label="`Page ${item}`"
          :class="[
            'flex h-10 min-w-10 items-center justify-center rounded-full px-2 transition-colors',
            item === page
              ? 'bg-primary-900 font-medium text-white'
              : 'text-primary-900 hover:bg-primary-50',
          ]"
          >{{ item }}</NuxtLink
        >
      </li>
    </ul>

    <NuxtLink
      v-if="page < pageCount"
      :to="to(page + 1)"
      rel="next"
      class="flex h-10 items-center gap-2 rounded-full px-3 text-primary-900 transition-colors hover:bg-primary-50 sm:px-4"
    >
      <span class="hidden sm:inline">Next</span>
      <span class="sr-only sm:hidden">Next page</span>
      <Icon name="fa6-solid:arrow-right" class="text-xs" />
    </NuxtLink>
    <span v-else aria-hidden="true" class="w-10 sm:w-28" />
  </nav>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";
import { pageItems } from "~~/shared/pagination";

const props = defineProps<{
  page: number;
  pageCount: number;
  /** The address of a page */
  to: (page: number) => RouteLocationRaw;
}>();

const items = computed(() => pageItems(props.page, props.pageCount));
</script>
