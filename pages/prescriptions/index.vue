<template>
  <!-- Hero Section -->
  <section
    class="flex flex-wrap bg-primary-100 mx-auto items-center justify-center"
  >
    <div class="p-10 sm:w-1/2 mx-auto text-primary-900 title-section">
      <h2 class="text-3xl font-bold text-center">Prescriptions</h2>
      <p class="text-center font-light opacity-80 mt-3">
        <NuxtLink to="/prescriptions/transfer" class="hover:underline"
          >Transfer</NuxtLink
        >,
        <NuxtLink to="/prescriptions/refill" class="hover:underline"
          >refill</NuxtLink
        >, or
        <NuxtLink to="/prescriptions/send" class="hover:underline"
          >send</NuxtLink
        >
        your prescription easily using our online prescription form! Select an
        option below to begin the process.
      </p>
    </div>
  </section>
  <section class="container mx-auto">
    <div class="px-4 my-10 flex gap-5 py-5 flex-wrap">
      <BorderedCard
        v-for="card in formLinks"
        :icon="card.icon"
        :title="card.title"
        :description="card.description"
        class="w-full sm:w-auto sm:flex-1"
      >
        <NuxtLink
          v-if="card.link"
          :to="card.link"
          class="mt-10 block p-1 rounded-md border font-light text-primary-900 text-center cursor-pointer hover:bg-primary-900 hover:text-white transition-colors"
          >Complete Form</NuxtLink
        >
      </BorderedCard>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

useSeoMeta({
  title: "Garibaldi Pharmacy | Transfer Prescription",
  description:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  ogTitle: "Garibaldi Pharmacy | Transfer Prescription",
  ogDescription:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/prescriptions/transfer",
  twitterTitle: "Garibaldi Pharmacy | Transfer Prescription",
  twitterDescription:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
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
      href: "https://garibaldipharmacy.com/prescriptions/transfer",
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
    description:
      "Is your prescription currently at another pharmacy? Just submit a quick form with your details and we will handle the rest!",
    link: "/prescriptions/transfer",
  },
  {
    icon: "fa6-solid:prescription-bottle",
    title: "Refill Prescription",
    description:
      "Do you have an existing prescription that needs to be refilled? Simply fill out the form and we'll have it ready for you!",
    link: "/prescriptions/refill",
  },
  {
    icon: "fa6-solid:prescription",
    title: "Send Prescription",
    description:
      "Did your doctor give you a paper prescription? Snap a photo using your smartphone and send it to us. We'll have it ready before you get here!",
    link: "/prescriptions/send",
  },
];
</script>

<!-- 

  Is your prescription currently at another pharmacy? Just submit the quick "Transfer Prescription" form and we'll handle the rest?!

  Did your doctor give you a paper prescription? Snap a photo using your smartphone and send it to us using the Send feature


 -->
