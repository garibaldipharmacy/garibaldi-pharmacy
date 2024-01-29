import type { businessInfo } from '~/constants/business'; import type {
businessInfo } from '~/constants/business';
<template>
  <footer class="bg-primary-900 text-white p-5">
    <div class="flex gap-5 items-start">
      <FooterInfo class="flex-1" />
      <FooterLinks />
      <FooterHours />
    </div>
    <FooterLower />
  </footer>
</template>

<script setup lang="ts"></script>
