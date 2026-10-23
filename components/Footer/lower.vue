<template>
  <div
    class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm"
  >
    <p class="flex flex-wrap items-baseline font-light text-primary-200">
      <span>&copy; {{ year }} Goodfella's Pharmacy Ltd.</span>
      <span aria-hidden="true" class="mx-3 text-primary-300/60">·</span>
      <NuxtLink
        to="/sitemap/"
        class="text-xs text-primary-300 underline hover:no-underline"
        >Sitemap</NuxtLink
      >
    </p>
    <ul class="flex gap-2">
      <li v-for="social in socials" :key="social.name">
        <NuxtLink
          :href="social.link"
          :title="social.name"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-primary-200 transition-colors hover:bg-white/20 hover:text-white"
        >
          <Icon :name="social.icon" />
        </NuxtLink>
      </li>
    </ul>

    <ul class="hidden">
      <!-- <li>
        <NuxtLink to="/terms/" class="hover:opacity-50 transition-opacity"
          >Terms</NuxtLink
        >
      </li>
      <li>
        <NuxtLink to="/privacy/" class="hover:opacity-50 transition-opacity"
          >Privacy</NuxtLink
        >
      </li>
      <li>
        <NuxtLink to="/cookies/" class="hover:opacity-50 transition-opacity"
          >Cookies</NuxtLink
        >
      </li> -->
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const year = new Date().getFullYear();
const { links } = businessInfo;

const socials = [
  {
    name: "Instagram",
    icon: "fa6-brands:instagram",
    link: links.instagram,
  },
  {
    name: "Facebook",
    icon: "fa6-brands:facebook",
    link: links.facebook,
  },
  {
    name: "Linkedin",
    icon: "fa6-brands:linkedin-in",
    link: links.linkedin,
  },
  {
    name: "Google Maps",
    icon: "fa6-brands:google",
    link: links.google_maps,
  },
];
</script>
