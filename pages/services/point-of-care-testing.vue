<template>
  <!-- The description the navigation menu already uses for this service -->
  <PageIntro title="Point of Care Testing">
    <p>
      Quick health checks done right at the pharmacy. Point-of-care tests are
      done on the spot, so results are ready during your visit.
    </p>
  </PageIntro>

  <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-24">
    <div
      v-reveal
      class="group relative isolate grid items-center gap-8 overflow-hidden rounded-3xl bg-primary-50 px-6 py-12 text-primary-900 sm:px-12 lg:grid-cols-[3fr_2fr] lg:gap-16 lg:py-16"
    >
      <!-- Still growing: a sprig for a page that's on its way -->
      <LeafSprig
        class="absolute -bottom-2 right-6 -z-10 hidden h-40 w-32 lg:block"
      />
      <div>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          More information coming soon!
        </h2>
        <p class="mt-4 text-lg font-light text-slate-600">
          In the meantime, our pharmacists are happy to answer your questions.
        </p>
      </div>
      <ul class="grid gap-2 lg:mr-28">
        <li class="rounded-2xl bg-white">
          <ActionTile
            icon="fa6-solid:phone"
            :title="`Call ${businessInfo.contact.phone.main}`"
            :to="`tel:${businessInfo.contact.phone.main}`"
            class="px-4 py-5"
          />
        </li>
        <li class="rounded-2xl bg-white">
          <ActionTile
            icon="fa6-solid:envelope"
            title="Email us"
            :to="`mailto:${businessInfo.contact.email}`"
            class="px-4 py-5"
          />
        </li>
      </ul>
    </div>
  </section>

  <!-- To add once confirmed by the pharmacy, then remove the "coming soon"
       panel:
       - The tests we offer (e.g. blood pressure, blood glucose, A1C,
         cholesterol, INR, strep throat)
       - The price and turnaround for each
       - Whether an appointment is needed -->
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

useSeoMeta({
  title: "Point-of-Care Testing in Squamish | Garibaldi Pharmacy",
  description:
    "Quick health checks done right at Garibaldi Pharmacy in Squamish, with results ready during your visit. Call or email our pharmacists with any questions.",
  ogTitle: "Point-of-Care Testing in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Quick health checks done right at Garibaldi Pharmacy in Squamish, with results ready during your visit. Call or email our pharmacists with any questions.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/services/point-of-care-testing/",
  twitterTitle: "Point-of-Care Testing in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Quick health checks done right at Garibaldi Pharmacy in Squamish, with results ready during your visit. Call or email our pharmacists with any questions.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/services/point-of-care-testing/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
