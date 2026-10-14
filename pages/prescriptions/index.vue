<template>
  <PageIntro title="Prescriptions">
    <p>
      <NuxtLink
        to="/prescriptions/transfer/"
        class="font-normal text-primary-700 underline-offset-4 hover:underline"
        >Transfer</NuxtLink
      >,
      <NuxtLink
        to="/prescriptions/refill/"
        class="font-normal text-primary-700 underline-offset-4 hover:underline"
        >refill</NuxtLink
      >, or
      <NuxtLink
        to="/prescriptions/send/"
        class="font-normal text-primary-700 underline-offset-4 hover:underline"
        >send</NuxtLink
      >
      your prescription easily using our online prescription form! Select an
      option below to begin the process.
    </p>
  </PageIntro>

  <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-24">
    <ul class="grid gap-4 md:grid-cols-3">
      <li
        v-for="(card, index) in formLinks"
        :key="card.link"
        v-reveal="index * 100"
        class="group flex flex-col rounded-3xl bg-primary-50 p-7 text-primary-900"
      >
        <CircleIcon
          :icon="card.icon"
          bgColor="bg-white"
          :iconColor="
            card.theme === 'secondary' ? 'text-secondary-900' : 'text-primary-900'
          "
          :class="[
            '!h-12 !w-12 overflow-hidden text-lg shadow-sm ring-1 ring-primary-900/5',
            iconMotion(card.icon),
          ]"
        />
        <h2 class="mt-6 text-xl font-semibold">{{ card.title }}</h2>
        <p class="mt-3 flex-1 font-light leading-relaxed text-slate-600">
          {{ card.description }}
        </p>
        <NuxtLink
          :to="card.link"
          class="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary-900 px-5 py-3 font-medium text-white transition-colors hover:bg-primary-700"
          >Complete Form
          <Icon
            name="fa6-solid:arrow-right"
            class="text-sm transition-transform group-hover:translate-x-1"
        /></NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { iconMotion } from "~/constants/iconMotions";

useSeoMeta({
  title: "Prescriptions in Squamish | Garibaldi Pharmacy & Compounding Lab",
  description:
    "Easily transfer, refill, or send prescriptions at Garibaldi Pharmacy in Squamish. Our expert pharmacists provide fast, convenient, and personalized prescription services.",
  ogTitle: "Prescriptions in Squamish | Garibaldi Pharmacy & Compounding Lab",
  ogDescription:
    "Easily transfer, refill, or send prescriptions at Garibaldi Pharmacy in Squamish. Our expert pharmacists provide fast, convenient, and personalized prescription services.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/prescriptions/",
  twitterTitle:
    "Prescriptions in Squamish | Garibaldi Pharmacy & Compounding Lab",
  twitterDescription:
    "Easily transfer, refill, or send prescriptions at Garibaldi Pharmacy in Squamish. Our expert pharmacists provide fast, convenient, and personalized prescription services.",
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
      href: "https://garibaldipharmacy.com/prescriptions/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

const formLinks = [
  {
    icon: "fa6-solid:paper-plane",
    title: "Transfer Prescription",
    theme: "secondary",
    description:
      "Is your prescription currently at another pharmacy? Just submit a quick form with your details and we will handle the rest!",
    link: "/prescriptions/transfer/",
  },
  {
    icon: "fa6-solid:prescription-bottle",
    title: "Refill Prescription",
    theme: "primary",
    description:
      "Do you have an existing prescription that needs to be refilled? Simply fill out the form and we'll have it ready for you!",
    link: "/prescriptions/refill/",
  },
  {
    icon: "fa6-solid:prescription",
    title: "Send Prescription",
    theme: "secondary",
    description:
      "Did your doctor give you a paper prescription? Snap a photo using your smartphone and send it to us. We'll have it ready before you get here!",
    link: "/prescriptions/send/",
  },
];
</script>
