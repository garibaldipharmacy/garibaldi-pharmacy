<template>
  <PageIntro title="Owned and operated by locals">
    <p>
      Our goal is to meet your healthcare needs, whether it is diagnosing a
      medical condition, a routine checkup, or getting your medication and
      immunizations.
    </p>
  </PageIntro>

  <PagePhoto>
    <!-- Phones show the photo taller than its wide shape, so they get a crop
         that matches instead of downloading the wide version -->
    <picture>
      <source
        media="(max-width: 639px)"
        srcset="@/assets/images/stawamus-chief-howe-sound-squamish-phone.webp"
        width="824"
        height="549"
      />
      <img
        src="@/assets/images/stawamus-chief-howe-sound-squamish-1440.webp"
        srcset="
          @/assets/images/stawamus-chief-howe-sound-squamish-800.webp 800w,
          @/assets/images/stawamus-chief-howe-sound-squamish-1440.webp 1440w
        "
        sizes="(min-width: 1152px) 1104px, calc(100vw - 3rem)"
        width="1440"
        height="549"
        fetchpriority="high"
        alt="The Stawamus Chief rising above Howe Sound in Squamish, BC, under a cloudy sky"
      />
    </picture>
    <template #credit>
      <NuxtLink
        to="https://mattanthonyphoto.com/"
        class="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-primary-900 backdrop-blur transition-colors hover:bg-primary-900 hover:text-white"
        ><Icon name="fa6-solid:circle-info" />Photo: Matt Anthony
        Photography</NuxtLink
      >
    </template>
  </PagePhoto>

  <!-- Who we are / What we do -->
  <section class="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:pt-20">
    <div class="grid gap-x-16 text-primary-900 md:grid-cols-2">
      <div v-reveal class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h2 class="text-2xl font-bold tracking-tight">Who we are</h2>
        <div class="mt-4 space-y-4 font-light leading-relaxed text-slate-600">
          <p>
            Garibaldi Pharmacy is Squamish’s first independent pharmacy, owned
            and operated by locals.
          </p>
          <p>
            Located in the heart of the Garibaldi Highlights region, we are
            conveniently only a short distance from your home so you always
            have quick access for your health care needs.
          </p>
        </div>
      </div>
      <div v-reveal="120" class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h2 class="text-2xl font-bold tracking-tight">What we do</h2>
        <div class="mt-4 space-y-4 font-light leading-relaxed text-slate-600">
          <p>
            We are a full-service pharmacy specializing in compounding with an
            in-house medical clinic.
          </p>
          <p>
            Our goal is to meet your healthcare needs, whether it is diagnosing
            a medical condition, a routine checkup, or getting your medication
            and immunizations.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Why Us -->
  <SectionWhyUs />

  <!-- Local Experts: a light counterpart to the Why Us panel above -->
  <SectionLocalExperts />

  <CallToAction title="Interested in becoming a patient?" />
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "About Garibaldi Pharmacy | Independent Pharmacy in Squamish",
  description:
    "Garibaldi Pharmacy is Squamish's first independent pharmacy, owned and operated by locals. We provide full-service care, including compounding, prescriptions, immunizations, and an in-house medical clinic.",
  ogTitle: "About Garibaldi Pharmacy | Independent Pharmacy in Squamish",
  ogDescription:
    "Garibaldi Pharmacy is Squamish's first independent pharmacy, owned and operated by locals. We provide full-service care, including compounding, prescriptions, immunizations, and an in-house medical clinic.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/about/",
  twitterTitle: "About Garibaldi Pharmacy | Independent Pharmacy in Squamish",
  twitterDescription:
    "Garibaldi Pharmacy is Squamish's first independent pharmacy, owned and operated by locals. We provide full-service care, including compounding, prescriptions, immunizations, and an in-house medical clinic.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/about/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
