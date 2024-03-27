<template>
  <!-- Hero Section -->
  <section class="mx-auto">
    <div class="relative">
      <img
        class="w-full"
        src="@/assets/images/squamish-drug-administration.jpg"
        alt="Woman taking pills from a jar on hand"
      />
      <div
        class="hero-over-text px-5 my-10 text-primary-900 bg-white sm:shadow-lg rounded-xl"
      >
        <h1 class="text-4xl font-bold">
          <span>Drug Administration</span>
        </h1>
        <p class="font-light mt-5 opacity-75 sm:opacity-100">
          Do you have a medication that you need help administered? Pharmacists
          can administer them for you and the fee is sometimes covered by the
          government. Give us a call at
          <NuxtLink
            :href="`tel:${phoneMain}`"
            class="underline hover:no-underline hover:opacity-75 transition-opacity"
            >{{ phoneMain }}</NuxtLink
          >
          or email
          <NuxtLink
            :href="`mailto:${email}`"
            class="underline hover:no-underline hover:opacity-75 transition-opacity"
            >{{ email }}</NuxtLink
          >
          if you would like to know more.
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const phoneMain = businessInfo.contact.phone.main;
const email = businessInfo.contact.email;

useSeoMeta({
  title: "Garibaldi Pharmacy | Drug Administration",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy | Drug Administration",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | Drug Administration",
  twitterDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  twitterImage: "/favicon/android-chrome-512x512.png",
  twitterCard: "summary",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/services/drug-administration",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>

<style scoped>
@media screen and (min-width: 640px) {
  .hero-over-text {
    position: absolute;
    top: 50%;
    left: 4rem;
    transform: translateY(-50%);
    width: 500px;
    max-width: calc(100% - 40px);
    padding: 2rem;
    margin-top: 0;
  }
}
</style>
