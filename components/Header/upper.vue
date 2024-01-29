<template>
  <ul
    class="header-upper flex text-sm font-light bg-primary-900 text-white py-1 px-5"
  >
    <li class="p-3">
      <Icon name="fa6-solid:phone" class="mr-2" />
      <a
        class="hover:opacity-75 transition-colors delay-150"
        :href="`tel:${phoneMain}`"
        >{{ phoneMain }}</a
      >
    </li>

    <li class="p-3">
      <Icon name="fa6-solid:clock" class="mr-2" />
      <span>{{ hours }}</span>
    </li>

    <li class="p-3">
      <Icon name="fa6-solid:location-dot" class="mr-2" />
      <a
        class="hover:opacity-75 transition-colors delay-150"
        :href="links.google_maps"
        target="_blank"
        rel="noopener noreferrer"
        >{{ location }}</a
      >
    </li>

    <li class="ml-auto flex items-center justify-center">
      <a
        class="flex items-center rounded-full p-1.5 px-5 bg-primary-200 text-primary-900 hover:opacity-75 transition-opacity"
        :href="links.patient_register"
        target="_blank"
        rel="noopener noreferrer"
        >Register As a Patient <Icon class="ml-2" name="fa6-solid:angle-right"
      /></a>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const phoneMain = businessInfo.contact.phone.main;
const hours = businessInfo.business_hours.short;
const location = businessInfo.address.short;
const { links } = businessInfo;
</script>
