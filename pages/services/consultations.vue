<template>
  <section
    class="flex flex-wrap bg-primary-100 mx-auto items-center justify-center"
  >
    <div class="px-10 py-20 sm:w-1/2 mx-auto text-primary-900 title-section">
      <h1 class="text-4xl font-bold text-center">Consultations</h1>
      <p class="text-center font-light opacity-80 mt-3 w-4/5 mx-auto">
        Pharmacists are the medication experts and can help you understand your
        medical conditions. Take advantage of their knowledge by booking a
        consultation relevant to you.
      </p>
    </div>
  </section>

  <section class="container mx-auto -m-14 pb-40">
    <ul
      class="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-5"
    >
      <li
        v-for="card in pricingCards"
        :key="card.title"
        class="shadow-md text-primary-900 flex flex-col gap-2 p-5 bg-white rounded-xl"
      >
        <span class="text-xl">{{ card.name }}</span>
        <span class="font-light opacity-75">{{ card.description }}</span>
        <span class="text-3xl font-bold"
          >{{ card.price }}<span v-if="card.note">*</span></span
        >
        <span v-if="card.note" class="text-xs mt-5 opacity-75 mb-5"
          >*{{ card.note }}</span
        >
        <button
          type="button"
          @click="openModal"
          class="transition-colors cursor-pointer font-light hover:bg-primary-900 hover:text-white py-2 px-5 rounded-md mt-auto text-center border-primary-200 border"
        >
          Call to Book
        </button>
      </li>
    </ul>
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
                class="text-lg font-medium leading-6 text-primary-900 flex items-center"
              >
                <span>Consultation Booking</span>
              </DialogTitle>

              <p class="mt-5 text-xl text-primary-900 font-light">
                Call
                <NuxtLink
                  class="hover:underline hover:opacity-75 transition-opacity font-medium"
                  :href="`tel:${phone}`"
                  >{{ phone }}</NuxtLink
                >
                now to book your consultation
              </p>

              <div class="mt-10">
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
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const pricingCards = businessInfo.pricing.consultations;

const { contact } = businessInfo;
const phone = contact.phone.main;

import { ref } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const isOpen = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}

useSeoMeta({
  title: "Garibaldi Pharmacy | Consultations",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy | Consultations",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | Consultations",
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
      href: "https://garibaldipharmacy.com/services/consultations",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
