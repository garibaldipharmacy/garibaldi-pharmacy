<template>
  <!-- Switches between the three forms: a pill toggle with the current form
       raised, short labels on phones and full ones from tablet up -->
  <nav aria-label="Prescription forms">
    <ul class="grid grid-cols-3 gap-1 rounded-2xl bg-primary-50 p-1.5">
      <li v-for="action in prescriptionActions" :key="action.link">
        <NuxtLink
          :to="action.link"
          :aria-current="isActive(action.link) ? 'page' : undefined"
          :class="[
            'group flex h-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-sm font-medium transition sm:flex-row sm:gap-2.5 sm:text-base',
            isActive(action.link)
              ? 'bg-white text-primary-900 shadow'
              : 'text-slate-600 hover:bg-white/60 hover:text-primary-900',
          ]"
        >
          <span
            :class="[
              'inline-flex overflow-hidden text-lg sm:text-base',
              action.theme === 'secondary' ? 'text-secondary-800' : '',
              iconMotion(action.icon),
            ]"
          >
            <Icon :name="action.icon" aria-hidden="true" />
          </span>
          <span class="md:hidden">{{ action.shortTitle }}</span>
          <span class="hidden md:inline">{{ action.title }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router"; // required since we are using outside of <NuxtPage />
import { prescriptionActions } from "~/constants/prescriptionActions";
import { iconMotion } from "~/constants/iconMotions";

const route = useRoute();

const withoutTrailingSlash = (path: string) => path.replace(/\/$/, "");

const isActive = (link: string) =>
  withoutTrailingSlash(route.path) === withoutTrailingSlash(link);
</script>
