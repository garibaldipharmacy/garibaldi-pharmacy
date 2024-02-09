<template>
  <header>
    <ul
      class="header-upper flex flex-wrap items-center justify-center text-center text-sm font-light bg-primary-900 text-white sm:py-1 px-5 pt-3 pb-5"
    >
      <li class="p-3 text-2xl sm:text-sm">
        <NuxtLink
          class="hover:opacity-75 transition-colors delay-150 flex items-center justify-center"
          :href="`tel:${phoneMain}`"
        >
          <Icon name="fa6-solid:phone" class="mr-2" />
          <span class="hidden sm:block">{{ phoneMain }}</span>
        </NuxtLink>
      </li>

      <li class="p-3 hidden sm:flex items-center justify-center">
        <Icon name="fa6-solid:clock" class="mr-2" />
        <span>{{ hours }}</span>
      </li>

      <li class="p-3 text-2xl sm:text-sm flex items-center justify-center">
        <NuxtLink
          class="hover:opacity-75 transition-colors delay-150 flex items-center justify-center"
          :href="links.google_maps"
        >
          <Icon name="fa6-solid:location-dot" class="mr-2" />
          <span class="hidden sm:block">{{ location }}</span>
        </NuxtLink>
      </li>

      <li class="sm:ml-auto flex items-center justify-center">
        <!-- <NuxtLink
          class="flex items-center rounded-full p-1.5 px-5 bg-primary-200 text-primary-900 hover:opacity-75 transition-opacity"
          :href="links.patient_register"
        >
          <span>Register As a Patient</span>
          <Icon class="ml-2" name="fa6-solid:angle-right"
        /></NuxtLink> -->
      </li>
    </ul>
  </header>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const phoneMain = businessInfo.contact.phone.main;
const hours = businessInfo.business_hours.short;
const location = businessInfo.address.short;
const { links } = businessInfo;
</script>
