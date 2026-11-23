<template>
  <!-- Sends people coming in for a vaccine or an injection to the consent
       form ahead of time. Same colours and button as CallToAction, in a
       slimmer band that sits near the top of a service page -->
  <section class="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:pb-16">
    <div
      class="flex flex-col gap-5 rounded-3xl bg-secondary-100 px-6 py-6 ring-1 ring-secondary-900/10 sm:flex-row sm:items-center sm:justify-between sm:px-10"
    >
      <p class="text-lg font-medium text-secondary-900 sm:text-xl">
        {{ question }}
        <span class="block font-light text-slate-600">
          Fill in your consent form before your appointment.
        </span>
      </p>
      <NuxtLink
        to="/consent/"
        class="group inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-6 font-medium text-primary-900 shadow-md shadow-secondary-900/10 ring-1 ring-secondary-900/5 transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
      >
        <CircleIcon
          icon="fa6-solid:syringe"
          bgColor="bg-secondary-100"
          iconColor="text-secondary-900"
          :class="['h-9 w-9 overflow-hidden', iconMotion('fa6-solid:syringe')]"
        />
        Fill in the consent form
      </NuxtLink>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { iconMotion } from "~/constants/iconMotions";

defineProps<{
  // The opening question, e.g. "Getting vaccinated?"
  question: string;
}>();
</script>
