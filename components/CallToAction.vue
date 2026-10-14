<template>
  <section class="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pb-24">
    <div
      v-reveal
      class="relative isolate overflow-hidden rounded-3xl bg-secondary-100 px-6 py-14 text-center ring-1 ring-secondary-900/10 sm:px-16 lg:py-16"
    >
      <img
        src="@/assets/images/cta-artifact.svg"
        alt=""
        width="180"
        height="241"
        loading="lazy"
        class="cta-artifact cta-artifact--start absolute left-0 top-0 -z-10 opacity-25 md:opacity-100"
      />
      <img
        src="@/assets/images/cta-artifact.svg"
        alt=""
        width="180"
        height="241"
        loading="lazy"
        class="cta-artifact cta-artifact--end absolute bottom-0 right-0 -z-10 rotate-180 opacity-25 md:opacity-100"
      />
      <h2
        class="mx-auto max-w-lg text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl"
      >
        {{ title }}
      </h2>
      <nav class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <NuxtLink
          v-for="button in [primaryButton, secondaryButton].filter(Boolean)"
          :key="button.link"
          :to="button.link"
          class="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-6 font-medium text-primary-900 shadow-md shadow-secondary-900/10 ring-1 ring-secondary-900/5 transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
        >
          <CircleIcon
            :icon="button.icon"
            bgColor="bg-secondary-100"
            iconColor="text-secondary-900"
            :class="['h-9 w-9 overflow-hidden', iconMotion(button.icon)]"
          />
          {{ button.text }}
        </NuxtLink>
      </nav>
      <p v-if="showFooter" class="mt-8 text-slate-600">
        Something else?
        <NuxtLink
          to="/contact/"
          class="text-secondary-900 underline underline-offset-4 hover:no-underline"
          >Contact us</NuxtLink
        >
      </p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { iconMotion } from "~/constants/iconMotions";

defineProps({
  title: {
    type: String,
    default: "We're here to help, become a patient now!",
  },
  primaryButton: {
    type: Object,
    default: () => ({
      text: "Transfer Prescription",
      icon: "fa6-solid:paper-plane",
      link: "/prescriptions/transfer/",
    }),
  },
  // Pass null for a single button
  secondaryButton: {
    type: [Object, null],
    default: () => ({
      text: "Send Prescription",
      icon: "fa6-solid:prescription",
      link: "/prescriptions/send/",
    }),
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
});
</script>
