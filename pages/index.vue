<template>
  <!-- Hero Section -->
  <section
    class="relative isolate flex min-h-[30rem] items-center pt-16 pb-36 md:min-h-[34rem] lg:min-h-[38rem]"
  >
    <!-- A real image rather than a CSS background so the browser finds it in
         the HTML and fetches it first, as it is the largest paint on the page.
         Phones get a portrait crop around the dog, which is all a tall,
         narrow hero shows anyway, so they download far less. Wider screens
         get a banner crop (about 2.2:1) for the same reason. Below 1024px
         wide the hero is taller than the banner's shape, so the photo scales
         to its height and shows about 1200px wide, hence the sizes floor.
         The position keeps the dog in frame as the sides crop -->
    <picture class="motion-settle absolute inset-0 -z-10">
      <source
        media="(max-width: 639px)"
        :srcset="heroImagePortrait"
        width="864"
        height="1152"
      />
      <source
        :srcset="`${heroImage1440} 1440w, ${heroImage} 1920w`"
        sizes="(max-width: 1023px) 1200px, 100vw"
        width="1920"
        height="873"
      />
      <img
        :src="heroImage"
        alt="A toy poodle holding a prescription bag on top of Garibaldi Lake overlooking Garibaldi Mountain in Squamish"
        width="1920"
        height="873"
        fetchpriority="high"
        class="h-full w-full object-cover object-[90%_30%] md:object-[78%_30%]"
      />
    </picture>
    <!-- Darkens the photo behind the text: evenly on mobile where the text
         spans the width, from the left on larger screens -->
    <div
      aria-hidden="true"
      class="absolute inset-0 -z-10 bg-primary-950/50 md:bg-transparent md:bg-gradient-to-r md:from-primary-950/70 md:via-primary-950/25 md:to-transparent"
    />
    <div class="mx-auto w-full max-w-6xl px-4 text-white sm:px-6">
      <h1
        class="motion-rise max-w-xl text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:max-w-2xl lg:text-[3.5rem]"
      >
        Discover personalized medicine and accessible healthcare at its best
      </h1>
      <p
        class="motion-rise mt-5 max-w-xl text-xl font-light text-white/90 [animation-delay:150ms] sm:text-2xl"
      >
        We are dedicated to improving the health and wellness of Squamish
      </p>
    </div>
  </section>

  <!-- Navigation / Appointments -->
  <section class="mx-auto max-w-6xl px-4 sm:px-6">
    <nav>
      <ul
        class="motion-rise-in relative z-10 -mt-20 grid gap-1 [animation-delay:300ms] rounded-2xl bg-white p-2 shadow-lg sm:grid-cols-2 lg:grid-cols-4"
      >
        <li>
          <ActionTile
            icon="fa6-solid:phone"
            title="Contact Us"
            @click="openModal"
          />
        </li>

        <li v-for="action in prescriptionActions" :key="action.link">
          <ActionTile
            :icon="action.icon"
            :title="action.title"
            :to="action.link"
            :theme="action.theme"
          />
        </li>
      </ul>
    </nav>
  </section>

  <!-- Loads its dialog code on the first click rather than with the page -->
  <LazyContactModal v-if="modalRequested" :open="isOpen" @close="closeModal" />

  <!-- Services -->
  <section class="mx-auto max-w-6xl px-4 pt-20 pb-10 sm:px-6 lg:pt-24">
    <div class="mx-auto max-w-2xl text-center text-primary-900">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Services</h2>
      <p class="mt-4 text-lg font-light text-slate-600">
        Discover our range of services designed for your wellness. From
        prescription refills to health consultations, we're here to support
        you.
      </p>
    </div>

    <div class="mt-14 grid gap-x-16 md:grid-cols-2">
      <div
        v-for="(card, index) in serviceCards"
        :key="card.title"
        v-reveal="index * 120"
        class="service group relative pt-6 pb-10"
      >
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3
          class="flex items-center gap-3 text-xl font-medium text-primary-900"
        >
          <span :class="['service-icon', `service-icon--${card.animation}`]">
            <Icon :name="card.icon" class="text-lg" />
          </span>
          {{ card.title }}
        </h3>
        <p class="mt-3 font-light leading-relaxed text-slate-600">
          {{ card.description }}
        </p>
      </div>
    </div>
  </section>

  <!-- Why Us -->
  <SectionWhyUs />

  <!-- Testimonials -->
  <SectionTestimonials />

  <!-- CTA -->
  <CallToAction />
</template>

<script setup lang="ts">
import heroImage from "~/assets/images/dog-hero-garibaldi-mountain-in-squamish.webp";
import heroImage1440 from "~/assets/images/dog-hero-garibaldi-mountain-in-squamish-1440.webp";
import heroImagePortrait from "~/assets/images/dog-hero-garibaldi-mountain-in-squamish-portrait.webp";
import { prescriptionActions } from "~/constants/prescriptionActions";
import { ref } from "vue";

useSeoMeta({
  title: "Garibaldi Pharmacy | Your Local Squamish Pharmacy & Compounding Lab",
  description:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
  ogTitle:
    "Garibaldi Pharmacy | Your Local Squamish Pharmacy & Compounding Lab",
  ogDescription:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/",
  twitterTitle:
    "Garibaldi Pharmacy | Your Local Squamish Pharmacy & Compounding Lab",
  twitterDescription:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

const serviceCards = [
  {
    icon: "fa6-solid:truck",
    title: "Delivery",
    // Icon hover animation, see the .service-icon styles in assets/main.scss
    animation: "drive",
    description:
      "We provide delivery throughout Squamish. Have your medications delivered straight to the comfort of your own home.",
  },
  {
    icon: "healthicons:blister-pills-round-x4",
    title: "Compliance Packaging",
    animation: "wiggle",
    description:
      "If you take several medications at different times of the day and find it difficult to manage, we can arrange your medication into a convenient blister or bubble pack to help you take the right medication at the right time.",
  },
  {
    icon: "fa6-solid:clipboard-list",
    title: "Medication Reviews",
    animation: "tilt",
    description:
      "Pharmacists are the therapeutics experts. Have a one-on-one consultation with a pharmacist to better understand your medications. We will make sure you are getting the maximum benefit from your medications.",
  },
  {
    icon: "bx:bxs-injection",
    title: "Vaccines & Immunizations",
    animation: "press",
    description:
      "Whether you need your seasonal flu shot, travel vaccinations, or most other vaccines to prevent certain diseases, we can make sure you get what you need to stay protected.",
  },
];

const isOpen = ref(false);
const modalRequested = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  modalRequested.value = true;
  isOpen.value = true;
}
</script>
