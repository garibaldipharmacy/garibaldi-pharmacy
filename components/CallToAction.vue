<template>
  <div
    class="my-10 bg-secondary-100 p-10 sm:px-20 sm:py-10 container mx-auto text-center relative"
  >
    <svg
      width="180"
      height="241"
      viewBox="0 0 180 241"
      fill="none"
      class="absolute top-0 left-0 opacity-25 md:opacity-100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.17181e-09 240.266C1.52806 240.305 3.06097 240.324 4.59853 240.324C101.389 240.324 179.853 163.541 179.853 68.8242C179.853 44.472 174.666 21.3052 165.315 0.324126L131.703 0.324123C143.282 20.6779 149.853 44.0585 149.853 68.8242C149.853 146.363 85.4362 210.324 4.59853 210.324C3.05962 210.324 1.52668 210.301 2.68628e-06 210.255L5.17181e-09 240.266Z"
        fill="#377E23"
        fill-opacity="0.4"
      />
    </svg>

    <div class="">
      <h2 class="text-3xl font-bold text-secondary-900 sm:w-1/2 mx-auto">
        {{ title }}
      </h2>

      <nav class="flex flex-wrap items-center justify-center gap-5 mt-5">
        <ButtonPill
          :to="primaryButton.link"
          :icon="primaryButton.icon"
          theme="secondary"
          :showArrow="false"
          class="z-10 w-full sm:w-auto"
        >
          {{ primaryButton.text }}
        </ButtonPill>

        <ButtonPill
          :to="secondaryButton.link"
          :icon="secondaryButton.icon"
          theme="secondary"
          :showArrow="false"
          class="z-10 w-full sm:w-auto"
        >
          {{ secondaryButton.text }}
        </ButtonPill>
      </nav>
      <p class="mt-10 text-slate-600" v-if="showFooter">
        Something else?
        <NuxtLink
          to="/contact"
          class="text-secondary-950 underline hover:no-underline"
          >Contact us</NuxtLink
        >
      </p>
      <div class="mb-12" v-else></div>
    </div>
    <svg
      width="180"
      height="241"
      viewBox="0 0 180 241"
      fill="none"
      class="absolute bottom-0 right-0 rotate-180 opacity-25 md:opacity-100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.17181e-09 240.266C1.52806 240.305 3.06097 240.324 4.59853 240.324C101.389 240.324 179.853 163.541 179.853 68.8242C179.853 44.472 174.666 21.3052 165.315 0.324126L131.703 0.324123C143.282 20.6779 149.853 44.0585 149.853 68.8242C149.853 146.363 85.4362 210.324 4.59853 210.324C3.05962 210.324 1.52668 210.301 2.68628e-06 210.255L5.17181e-09 240.266Z"
        fill="#377E23"
        fill-opacity="0.4"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: "We're here to help, become a patient now!",
  },
  primaryButton: {
    type: Object,
    default: () => ({
      text: "Transfer Prescription",
      icon: "fa6-solid:paper-plane",
      link: "/prescriptions/transfer",
    }),
  },
  secondaryButton: {
    type: Object,
    default: () => ({
      text: "Send Prescription",
      icon: "fa6-solid:prescription",
      link: "/prescriptions/send",
    }),
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
});
</script>
