<template>
  <nav>
    <!-- Mobile: segmented control so all three forms fit on one row -->
    <ul class="grid grid-cols-3 gap-1 bg-primary-100 p-2 md:hidden">
      <li v-for="action in prescriptionActions" :key="action.link">
        <NuxtLink
          :to="action.link"
          :class="[
            'flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-sm transition-colors',
            isActive(action.link)
              ? 'bg-white text-primary-900 shadow-sm'
              : 'text-primary-700 hover:bg-primary-200',
          ]"
        >
          <Icon :name="action.icon" class="text-lg" />
          <span>{{ action.shortTitle }}</span>
        </NuxtLink>
      </li>
    </ul>

    <ul
      class="hidden md:flex bg-primary-100 px-5 text-primary-900 border-b-2 flex-wrap"
    >
      <li v-for="action in prescriptionActions" :key="action.link">
        <NuxtLink
          :class="[
            'flex',
            'items-center',
            'p-5',
            'hover:border-primary-400',
            'hover:border-b-4',
            'hover-bg-primary-200',
            { 'border-primary-900 bg-primary-200 border-b-4': isActive(action.link) },
          ]"
          :to="action.link"
        >
          <Icon class="mr-3" :name="action.icon" />
          <span>{{ action.title }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router"; // required since we are using outside of <NuxtPage />
import { prescriptionActions } from "~/constants/prescriptionActions";

const route = useRoute();

const withoutTrailingSlash = (path: string) => path.replace(/\/$/, "");

const isActive = (link: string) =>
  withoutTrailingSlash(route.path) === withoutTrailingSlash(link);
</script>
