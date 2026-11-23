<template>
  <FormSuccess
    title="Thank you, we have your consent form"
    confirming="consent form"
  >
    Your pharmacist will review your answers before your appointment.
    <template #note>
      At your appointment, your pharmacist will go over everything with you
      before any vaccine is given, and you can change your mind at any time.
      Questions before then? Call
      <a
        :href="`tel:${phone}`"
        class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
        >{{ phone }}</a
      >.
    </template>
    <template #actions>
      <NuxtLink
        to="/consent/"
        class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-primary-900 shadow-sm ring-1 ring-primary-900/20 transition-colors hover:bg-primary-100"
      >
        <Icon name="fa6-solid:file-pen" aria-hidden="true" class="text-sm" />
        Fill another
      </NuxtLink>
    </template>
  </FormSuccess>
</template>

<script setup>
import { businessInfo } from "~/constants/business";

const phone = businessInfo.contact.phone.main;

useSeoMeta({
  title: "Consent Form Sent | Garibaldi Pharmacy",
  description: "Thank you for sending your vaccine consent form.",
  ogTitle: "Consent Form Sent | Garibaldi Pharmacy",
  ogDescription: "Thank you for sending your vaccine consent form.",
  twitterTitle: "Consent Form Sent | Garibaldi Pharmacy",
  twitterDescription: "Thank you for sending your vaccine consent form.",
});
</script>
