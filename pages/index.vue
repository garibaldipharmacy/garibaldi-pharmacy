<template>
  <!-- Hero Section -->
  <section
    class="landing-hero-section relative isolate flex min-h-[24rem] items-center pt-12 pb-24 md:min-h-[26rem] lg:min-h-[28rem]"
  >
    <!-- Darkens the photo behind the text: evenly on mobile where the text
         spans the width, from the left on larger screens -->
    <div
      aria-hidden="true"
      class="absolute inset-0 -z-10 bg-black/[.35] md:bg-transparent md:bg-gradient-to-r md:from-black/40 md:via-black/10 md:to-transparent"
    />
    <div
      class="w-full px-6 text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:px-12 lg:px-20"
    >
      <h1
        class="max-w-md text-3xl font-bold leading-tight lg:max-w-xl lg:text-4xl"
      >
        Discover personalized medicine and accessible healthcare at its best
      </h1>
      <p class="mt-3 max-w-md text-lg font-light sm:text-xl">
        We are dedicated to improving the health and wellness of Squamish
      </p>
    </div>
  </section>

  <!-- Navigation / Appointments -->
  <section class="container mx-auto">
    <nav>
      <ul
        class="pill-buttons relative z-10 -mt-16 mb-10 grid max-w-2xl mx-auto gap-2 p-3 sm:grid-cols-2 lg:flex lg:max-w-none lg:justify-center"
      >
        <li>
          <button
            type="button"
            @click="openModal"
            class="py-4 px-5 shadow-lg text-primary-900 inline-flex items-center rounded-md bg-white hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <CircleIcon icon="fa6-solid:phone" class="mr-3" />
            <span>Contact Us</span>
            <Icon class="ml-auto" name="fa6-solid:angle-right" />
          </button>
        </li>

        <li v-for="action in prescriptionActions" :key="action.link">
          <ButtonPill :to="action.link" :icon="action.icon" :theme="action.theme">
            {{ action.title }}
          </ButtonPill>
        </li>
      </ul>
    </nav>
  </section>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 flex items-center"
              >
                <CircleIcon icon="fa6-solid:address-book" class="mr-2" /><span
                  >Contact Information</span
                >
              </DialogTitle>
              <div class="mt-4">
                <ul>
                  <li
                    v-for="option in contactOptions"
                    :key="option.title"
                    class="p-1"
                  >
                    <NuxtLink
                      :to="option.link"
                      class="text-primary-900 flex gap-2 flex-wrap"
                    >
                      <div>
                        <Icon :name="option.icon" class="mr-3" />
                        <span class="font-medium">{{ option.title }}</span>
                      </div>
                      <span
                        class="font-light w-full sm:w-auto sm:ml-auto text-sm sm:text-base"
                        >{{ option.value }}</span
                      >
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-900 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Services -->
  <section class="container mx-auto services-section">
    <TitleSection
      title="Services"
      description="Discover our range of services designed for your wellness. From prescription refills to health consultations, we're here to support you."
    />
    <div class="px-4 my-10 flex gap-5 py-5 flex-wrap">
      <BorderedCard
        v-for="card in serviceCards"
        :icon="card.icon"
        :title="card.title"
        :description="card.description"
        class="w-full sm:w-auto sm:flex-1"
      />
    </div>
    <!-- <NuxtLink
      to="/services/"
      class="mx-auto text-center block mb-10 text-slate-500 hover:text-slate-800 transition-colors"
      >View all our service offerings
      <Icon class="ml-3" name="fa6-solid:arrow-right-long"
    /></NuxtLink> -->
  </section>

  <!-- Why Us -->
  <SectionWhyUs />

  <!-- CTA -->
  <CallToAction />
</template>

<script setup lang="ts">
import { businessInfo } from "~/constants/business";
import { prescriptionActions } from "~/constants/prescriptionActions";
const { contact } = businessInfo;
import { ref } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const contactOptions = [
  {
    icon: "fa6-solid:phone",
    title: "Phone / Text",
    value: contact.phone.main,
    link: `tel:${contact.phone.main}`,
  },
  {
    icon: "fa6-solid:fax",
    title: "Fax",
    value: contact.phone.fax,
    link: `tel:${contact.phone.fax}`,
  },
  {
    icon: "fa6-solid:envelope",
    title: "Email",
    value: contact.email,
    link: `mailto:${contact.email}`,
  },
];

useSeoMeta({
  title: "Garibaldi Pharmacy | Your Local Squamish Pharmacy & Compounding Lab",
  description:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
  ogTitle:
    "Garibaldi Pharmacy | Your Local Squamish Pharmacy & Compounding Lab",
  ogDescription:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/",
  twitterTitle:
    "Garibaldi Pharmacy | Your Local Squamish Pharmacy & Compounding Lab",
  twitterDescription:
    "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
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
    description:
      "We provide delivery throughout Squamish. Have your medications delivered straight to the comfort of your own home.",
  },
  {
    icon: "healthicons:blister-pills-round-x4",
    title: "Compliance Packaging",
    description:
      "If you take several medications at different times of the day and find it difficult to manage, we can arrange your medication into a convenient blister or bubble pack to help you take the right medication at the right time.",
  },
  {
    icon: "fa6-solid:clipboard-list",
    title: "Medication Reviews",
    description:
      "Pharmacists are the therapeutics experts. Have a one-on-one consultation with a pharmacist to better understand your medications. We will make sure you are getting the maximum benefit from your medications.",
  },
  {
    icon: "bx:bxs-injection",
    title: "Vaccines & Immunizations",
    description:
      "Whether you need your seasonal flu shot, travel vaccinations, or most other vaccines to prevent certain diseases, we can make sure you get what you need to stay protected.",
  },
];

const isOpen = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}
</script>

<style scoped>
/* .pill-buttons li {
  flex: 1 1 33%;
} */

.pill-buttons li a,
.pill-buttons li button {
  width: 100%;
  height: 100%;
}
</style>
