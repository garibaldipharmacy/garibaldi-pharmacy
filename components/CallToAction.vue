<template>
  <div
    class="my-10 bg-secondary-100 px-20 py-10 container mx-auto text-center relative"
  >
    <img
      src="@/assets/images/cta-artifact.svg"
      alt="an illustration of a half circle artifact"
      class="absolute top-0 left-0"
    />
    <h2 class="text-3xl font-bold text-secondary-900 w-1/2 mx-auto">
      We're here to help, become a patient now!
    </h2>

    <nav class="flex items-center justify-center gap-5 mt-5">
      <ButtonPill
        :to="primaryButton.link"
        :icon="primaryButton.icon"
        theme="secondary"
        :showArrow="false"
      >
        {{ primaryButton.text }}
      </ButtonPill>

      <ButtonPill
        :to="secondaryButton.link"
        :icon="secondaryButton.icon"
        theme="secondary"
        :showArrow="false"
      >
        {{ secondaryButton.text }}
      </ButtonPill>
    </nav>
    <p class="mt-10 text-slate-600">
      Something else?
      <NuxtLink
        to="/contact"
        class="text-secondary-900 underline hover:no-underline"
        >Contact us</NuxtLink
      >
    </p>
    <img
      src="@/assets/images/cta-artifact.svg"
      alt="an illustration of a half circle artifact"
      class="absolute bottom-0 right-0 rotate-180"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
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
});
</script>
