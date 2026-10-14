<template>
  <PageIntro title="Consultations">
    <p>
      Pharmacists are the medication experts and can help you understand your
      medical conditions. Take advantage of their knowledge by booking a
      consultation relevant to you.
    </p>
  </PageIntro>

  <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-24">
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <li
        v-for="(card, index) in pricingCards"
        :key="card.name"
        v-reveal="(index % 4) * 100"
        class="flex flex-col rounded-3xl bg-primary-50 p-7 text-primary-900"
      >
        <h2 class="text-lg font-semibold">{{ card.name }}</h2>
        <p class="mt-3 text-sm font-light leading-relaxed text-slate-600">
          {{ card.description }}
        </p>
        <p class="mt-auto pt-8 text-4xl font-bold tracking-tight">
          {{ card.price }}<span v-if="card.note">*</span>
        </p>
        <!-- Always present, so prices and buttons line up across cards
             whether or not a card has a footnote -->
        <p class="mt-2 min-h-[2rem] text-xs font-light text-slate-600">
          <template v-if="card.note">*{{ card.note }}</template>
        </p>
        <button
          type="button"
          @click="openModal"
          class="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary-900 px-5 py-3 font-medium text-white transition-colors hover:bg-primary-700"
        >
          <span class="icon-motion--ring inline-flex">
            <Icon name="fa6-solid:phone" class="text-sm" />
          </span>
          Call to Book
        </button>
      </li>
    </ul>
  </section>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-[60]">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-primary-950/40 backdrop-blur-sm" />
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
              class="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-sm font-medium uppercase tracking-widest text-primary-400"
              >
                <span>Consultation Booking</span>
              </DialogTitle>

              <p class="mt-4 text-2xl font-light text-primary-900">
                Call
                <NuxtLink
                  class="font-semibold underline underline-offset-4 hover:no-underline"
                  :href="`tel:${phone}`"
                  >{{ phone }}</NuxtLink
                >
                now to book your consultation
              </p>

              <div class="mt-8">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-full bg-primary-100 px-6 py-2.5 text-sm font-medium text-primary-900 transition-colors hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-900 focus-visible:ring-offset-2"
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
  title: "Pharmacist Consultations in Squamish | Garibaldi Pharmacy",
  description:
    "Book a personalized pharmacist consultation at Garibaldi Pharmacy in Squamish. Our experts provide health advice, medication reviews, and one-on-one guidance tailored to you.",
  ogTitle: "Pharmacist Consultations in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Book a personalized pharmacist consultation at Garibaldi Pharmacy in Squamish. Our experts provide health advice, medication reviews, and one-on-one guidance tailored to you.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/services/consultations/",
  twitterTitle: "Pharmacist Consultations in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Book a personalized pharmacist consultation at Garibaldi Pharmacy in Squamish. Our experts provide health advice, medication reviews, and one-on-one guidance tailored to you.",
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
      href: "https://garibaldipharmacy.com/services/consultations/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
