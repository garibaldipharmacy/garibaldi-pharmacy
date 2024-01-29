<template>
  <section class="landing-hero-section py-40">
    <div class="text-white px-20">
      <h1 class="text-3xl font-bold w-2/5">
        Discover personalized medicine and accessible healthcare at its best
      </h1>
      <p class="font-light text-xl w-1/3">
        We are dedicated to improving the health and wellness of Squamish
      </p>
    </div>
  </section>
  <section class="container mx-auto p-4">
    <ul class="flex gap-5 flex-wrap bg-slate-500 p-3 -mt-20 mb-10">
      <li>
        <ButtonPill to="https://garibaldipharmacy.com" icon="fa6-solid:phone">
          Call or Text Us
        </ButtonPill>
      </li>

      <li>
        <ButtonPill
          to="https://garibaldipharmacy.com"
          icon="fa6-solid:prescription-bottle"
        >
          Refill Medications
        </ButtonPill>
      </li>

      <li>
        <ButtonPill
          to="https://garibaldipharmacy.com"
          icon="fa6-solid:paper-plane"
          theme="secondary"
        >
          Transfer Prescription
        </ButtonPill>
      </li>

      <li>
        <ButtonPill
          to="https://garibaldipharmacy.com"
          icon="fa6-solid:prescription"
          theme="secondary"
        >
          Send Prescription
        </ButtonPill>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Garibaldi Pharmacy | Home",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
});
</script>

<style></style>
