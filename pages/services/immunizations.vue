<template>
  <!-- The intro is the description the homepage already uses for this
       service -->
  <PageIntro title="Immunizations">
    <p>
      Whether you need your seasonal flu shot, travel vaccinations, or most
      other vaccines to prevent certain diseases, we can make sure you get what
      you need to stay protected.
    </p>
  </PageIntro>

  <!-- Vaccines at a B.C. pharmacy. Province-wide facts only, each from the
       B.C. government. Recheck them each fall, when the respiratory season's
       details are announced:
         Ages and routes, PHN: https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/pharmacare/pharmacies/vaccine-resources-for-pharmacists/pharmacists-and-publicly-funded-vaccines-in-bc-guide
         Free flu and COVID-19 vaccines, Get Vaccinated: https://www2.gov.bc.ca/getvaccinated.html
       (both checked October 2026) -->
  <section class="mx-auto max-w-6xl px-4 sm:px-6">
    <h2
      class="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl"
    >
      Getting vaccinated at a B.C. pharmacy
    </h2>
    <div class="mt-10 grid gap-x-16 text-primary-900 md:grid-cols-2">
      <div
        v-for="(fact, index) in facts"
        :key="fact.title"
        v-reveal="(index % 2) * 120"
        class="relative pt-6 pb-10"
      >
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3 class="flex items-center gap-3 text-xl font-medium">
          <Icon :name="fact.icon" class="shrink-0 text-lg" />
          {{ fact.title }}
        </h3>
        <p class="mt-3 font-light leading-relaxed text-slate-600">
          {{ fact.text }}
          <NuxtLink
            v-if="fact.link"
            :to="fact.link.to"
            target="_blank"
            rel="noopener noreferrer"
            class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
            >{{ fact.link.text
            }}<span class="sr-only"> (opens in a new tab)</span></NuxtLink
          >
        </p>
      </div>
    </div>
  </section>

  <!-- To add once confirmed by the pharmacy, then remove this note:
       - The vaccines we stock and give (e.g. flu, COVID-19, shingles, HPV,
         hepatitis, travel vaccines)
       - Walk-ins, appointments, or both, and whether we take Get Vaccinated
         bookings
       - Fees for vaccines that aren't publicly funded, and for travel
         consultations -->

  <CallToAction
    title="Have questions about immunizations?"
    :primaryButton="{
      text: 'Contact Us',
      icon: 'fa6-solid:phone',
      link: '/contact/',
    }"
    :secondaryButton="null"
    :showFooter="false"
  />
</template>

<script lang="ts" setup>
const facts = [
  {
    icon: "fa6-solid:children",
    title: "Who pharmacists can vaccinate",
    text: "In B.C., pharmacists can give vaccines by injection to anyone 4 years and older, and nasal spray vaccines to anyone 2 years and older.",
  },
  {
    icon: "fa6-solid:shield-virus",
    title: "Free flu and COVID-19 vaccines",
    text: "Everyone in B.C. can receive a dose of influenza and COVID-19 vaccine free of charge this fall and winter. Other vaccines are free for B.C. residents who meet the province's eligibility criteria.",
  },
  {
    icon: "fa6-solid:calendar-check",
    title: "Booking with Get Vaccinated",
    text: "Register with the province's Get Vaccinated system to be notified when it's time to book your flu and COVID-19 vaccines, or call 1-833-838-2323.",
    link: {
      text: "Register with Get Vaccinated",
      to: "https://www2.gov.bc.ca/getvaccinated.html",
    },
  },
  {
    icon: "fa6-solid:id-card",
    title: "Bring your Personal Health Number",
    text: "Community pharmacists can only immunize B.C. residents with a Personal Health Number (PHN). You'll find yours on the back of your BC Services Card, driver's licence or CareCard.",
  },
];

useSeoMeta({
  title: "Immunizations & Flu Shots in Squamish | Garibaldi Pharmacy",
  description:
    "Get your flu shot, COVID-19, travel and other vaccines at Garibaldi Pharmacy in Squamish. B.C. pharmacists can vaccinate anyone 4 years and older.",
  ogTitle: "Immunizations & Flu Shots in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Get your flu shot, COVID-19, travel and other vaccines at Garibaldi Pharmacy in Squamish. B.C. pharmacists can vaccinate anyone 4 years and older.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/services/immunizations/",
  twitterTitle: "Immunizations & Flu Shots in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Get your flu shot, COVID-19, travel and other vaccines at Garibaldi Pharmacy in Squamish. B.C. pharmacists can vaccinate anyone 4 years and older.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/services/immunizations/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
