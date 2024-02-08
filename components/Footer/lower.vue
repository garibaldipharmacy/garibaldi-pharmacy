<template>
  <div
    class="flex flex-wrap items-center justify-center gap-5 py-4 pb-1 border-t border-primary-800 mt-5 text-sm"
  >
    <span class="font-light">&copy; {{ year }} Goodfella's Pharmacy Ltd.</span>
    <ul class="flex gap-3">
      <li
        v-for="social in socials"
        :key="social.name"
        class="hover:opacity-50 transition-opacity"
      >
        <NuxtLink :href="links.instagram" :title="social.name">
          <Icon :name="social.icon" />
        </NuxtLink>
      </li>
    </ul>

    <ul class="ml-auto font-extralight opacity-75 flex gap-5">
      <!-- <li>
        <NuxtLink to="/sitemap" class="hover:opacity-50 transition-opacity"
          >Sitemap</NuxtLink
        >
      </li>
      <li>
        <NuxtLink to="/terms" class="hover:opacity-50 transition-opacity"
          >Terms</NuxtLink
        >
      </li>
      <li>
        <NuxtLink to="/privacy" class="hover:opacity-50 transition-opacity"
          >Privacy</NuxtLink
        >
      </li>
      <li>
        <NuxtLink to="/cookies" class="hover:opacity-50 transition-opacity"
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
