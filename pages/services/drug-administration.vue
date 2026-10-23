<template>
  <PageIntro title="Drug Administration">
    <p>
      Do you have a medication that you need help administered? Pharmacists can
      administer them for you and the fee is sometimes covered by the
      government. Give us a call at
      <NuxtLink
        :href="`tel:${phoneMain}`"
        class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
        >{{ phoneMain }}</NuxtLink
      >
      or email
      <NuxtLink
        :href="`mailto:${email}`"
        class="break-words font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
        >{{ email }}</NuxtLink
      >
      if you would like to know more.
    </p>
  </PageIntro>

  <PagePhoto class="pb-20 lg:pb-24">
    <img
      src="@/assets/images/squamish-drug-administration-1440.webp"
      srcset="
        @/assets/images/squamish-drug-administration-800.webp 800w,
        @/assets/images/squamish-drug-administration-1440.webp 1440w,
        @/assets/images/squamish-drug-administration-2400.webp 2400w
      "
      sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
      width="1440"
      height="960"
      fetchpriority="high"
      alt="A person pouring tablets from a prescription bottle into their hand"
    />
  </PagePhoto>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const phoneMain = businessInfo.contact.phone.main;
const email = businessInfo.contact.email;

useSeoMeta({
  title: "Drug Administration in Squamish | Garibaldi Pharmacy",
  description:
    "Garibaldi Pharmacy in Squamish offers professional drug administration services. Our pharmacists can safely administer your medications with personalized care.",
  ogTitle: "Drug Administration in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Garibaldi Pharmacy in Squamish offers professional drug administration services. Our pharmacists can safely administer your medications with personalized care.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/services/drug-administration/",
  twitterTitle: "Drug Administration in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Garibaldi Pharmacy in Squamish offers professional drug administration services. Our pharmacists can safely administer your medications with personalized care.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/services/drug-administration/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
