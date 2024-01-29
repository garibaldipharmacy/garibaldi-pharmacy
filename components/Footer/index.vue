import type { businessInfo } from '~/constants/business'; import type {
businessInfo } from '~/constants/business';
<template>
  <footer class="bg-primary-900 text-white p-5">
    <div class="flex gap-5 items-start">
      <FooterInfo class="flex-1" />
      <FooterLinks />
      <FooterHours />
    </div>
    <p class="font-light text-xs pt-5 text-primary-300 w-2/4">
      Garibaldi Pharmacy is licensed by the College of Pharmacists of British
      Columbia. The college registrant who is the manager of the record is Dean
      George. All pharmacy practice issues may be reported directly to the
      College of Pharmacists of BC via their
      <NuxtLink
        class="underline hover:no-underline"
        href="https://www.bcpharmacists.org/"
        >website</NuxtLink
      >.
    </p>
    <FooterLower />
  </footer>
</template>

<script setup lang="ts"></script>
