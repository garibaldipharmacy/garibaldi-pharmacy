<template>
  <div
    class="container mx-auto mt-20 mb-20 text-center w-2/3 bg-slate-200 p-10 rounded"
  >
    <h2 class="text-4xl font-bold mb-4">Your prescription has been sent!</h2>
    <p class="text-lg mb-8">
      We have received your prescription request and will be in touch shortly.
      Please keep your prescription as it must be provided to the pharmacist at
      the time of pickup.
    </p>
    <div class="mx-5 col-span-2 flex-100 font-light p-5 rounded">
      <p>
        Note: If you do not receive an automated e-mail message or phone call
        within 24-hours to confirm your prescription transfer, please call
        {{ phoneMain }} for assistance.
      </p>
    </div>
  </div>
</template>

<script setup>
import { businessInfo } from "~/constants/business";
const phoneMain = businessInfo.contact.phone.main;

useSeoMeta({
  title: "Prescription Submitted | Garibaldi Pharmacy",
  description: "Thank you for submitting your prescription.",
  ogTitle: "Prescription Submitted | Garibaldi Pharmacy",
  ogDescription: "Thank you for submitting your prescription.",
  twitterTitle: "Prescription Submitted | Garibaldi Pharmacy",
  twitterDescription: "Thank you for submitting your prescription.",
});
</script>
