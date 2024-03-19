<template>
  <section class="container mx-auto">
    <div
      class="flex flex-wrap py-20 gap-5 px-5 sm:gap-0 items-center justify-center text-primary-900"
    >
      <h1 class="text-3xl font-bold md:basis-1/2">
        Owned and operated by locals
      </h1>
      <p class="font-light md:basis-1/2">
        Our goal is to meet your healthcare needs, whether it is diagnosing a
        medical condition, a routine checkup, or getting your medication and
        immunizations.
      </p>
    </div>
  </section>

  <section class="mx-auto">
    <div class="bg-primary-100">
      <div class="relative">
        <img
          class="w-full"
          src="@/assets/images/squamish-garibaldi-area.jpg"
          alt="The image captures the view in Squamish BC, a forest-covered cliffs beside a tranquil fjord under a cloudy sky."
        />
        <NuxtLink
          to="https://mattanthonyphoto.com/"
          class="flex items-center justify-center photo-credit absolute bg-primary-100 opacity-75 px-2 py-1 rounded-full text-xs text-primary-900 backdrop-blur-lg hover:bg-primary-900 hover:text-primary-100 transition-colors"
          ><Icon name="fa6-solid:circle-info" class="mr-2" />Photo: Matt Anthony
          Photography</NuxtLink
        >
      </div>
    </div>
  </section>

  <section class="container mx-auto p-5">
    <div class="flex flex-wrap py-20 text-primary-900">
      <div class="md:basis-1/2 p-1">
        <h2 class="text-2xl font-bold mb-5">Who we are</h2>
        <p class="font-light mb-5">
          Garibaldi Pharmacy is Squamish’s first independent pharmacy, owned and
          operated by locals.
        </p>
        <p class="font-light">
          Located in the heart of the Garibaldi Highlights region, we are
          conveniently only a short distance from your home so you always have
          quick access for your health care needs.
        </p>
      </div>
      <div class="md:basis-1/2 p-1">
        <h2 class="text-2xl font-bold mb-5">What we do</h2>
        <p class="font-light mb-5">
          We are a full-service pharmacy specializing in compounding with an
          in-house medical clinic.
        </p>
        <p class="font-light">
          Our goal is to meet your healthcare needs, whether it is diagnosing a
          medical condition, a routine checkup, or getting your medication and
          immunizations.
        </p>
      </div>
    </div>
  </section>

  <SectionWhyUs />

  <section class="2xl:container 2xl:mx-auto flex justify-center flex-wrap">
    <div class="md:basis-1/2">
      <img
        class="fill-image"
        src="@/assets/images/squamish-pharmacist-medicine-to-patient.jpg"
        alt="A doctor showing information on a clipboard to their patient while sitting inside an exam room."
      />
    </div>
    <div
      class="md:basis-1/2 bg-primary-100 text-primary-900 p-10 flex flex-col justify-center"
    >
      <h2 class="font-bold text-2xl mb-10">Local Experts</h2>
      <div class="font-light">
        <p class="mb-5">
          When you are issued a prescription by your doctor that calls for a
          medication or dosage form that is not commercially available, in many
          cases this must be outsourced to a compounding pharmacy in the Lower
          Mainland. Turnaround can usually take several days.
        </p>
        <p class="mb-5">
          Garibaldi Pharmacy will be the Sea to Sky’s first compounding
          pharmacy. With our state-of-the-art clean room that is built to the
          latest regulatory standards, we can produce your customized medication
          in-house.
          <NuxtLink
            to="/services/compounding"
            class="underline hover:no-underline"
            >Learn more about our compounding services.</NuxtLink
          >
        </p>
        <p>
          As local business owners, we want to serve the best interests of
          Squamish residents and be trusted professionals in the community.
        </p>
      </div>
    </div>
  </section>

  <CallToAction />
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Garibaldi Pharmacy | About",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy | About",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | About",
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
      href: "https://garibaldipharmacy.com/about",
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
.photo-credit {
  right: 1rem;
  bottom: 1rem;
}

.fill-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
