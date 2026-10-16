<template>
  <!-- Full-width background, with the items held to the same width as the
       navbar below and kept to the right, above the links and Contact
       button, so the logo has clear space above it. A named section rather
       than a second <header>, which would announce two page banners -->
  <section
    aria-label="Store information"
    class="hidden bg-primary-900 lg:block"
  >
    <ul
      class="header-upper mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-6 px-4 py-0.5 sm:px-6 text-[13px] font-light text-white"
    >
      <li class="py-2 text-2xl sm:text-[13px]">
        <NuxtLink
          class="hover:opacity-75 transition-opacity flex items-center justify-center"
          :href="`tel:${phoneMain}`"
          title="Main phone"
        >
          <Icon name="fa6-solid:phone" class="mr-2" />
          <span class="hidden sm:block">{{ phoneMain }}</span>
        </NuxtLink>
      </li>

      <li class="py-2 text-2xl sm:text-[13px]">
        <NuxtLink
          class="hover:opacity-75 transition-opacity flex items-center justify-center"
          :href="`tel:${phoneFax}`"
          title="Fax"
        >
          <Icon name="fa6-solid:fax" class="mr-2" />
          <span class="sr-only">Fax:</span>
          <span class="hidden sm:block">{{ phoneFax }}</span>
        </NuxtLink>
      </li>

      <!-- Shows the week's hours on hover or keyboard focus -->
      <li class="group relative hidden sm:flex items-center justify-center">
        <button
          type="button"
          class="flex items-center py-2 transition-opacity hover:opacity-75"
          aria-describedby="store-hours"
        >
          <Icon name="fa6-solid:clock" class="mr-2" />
          <!-- Prerendered pages can't know the time, so the status fills in
               once the page loads -->
          <span v-if="isOpen === null">Business Hours</span>
          <span v-else-if="holiday">Closed · Holiday</span>
          <span v-else>{{ isOpen ? "Open now" : "Closed now" }}</span>
          <Icon
            name="flowbite:angle-down-solid"
            class="ml-1 opacity-60 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
          />
        </button>

        <div
          id="store-hours"
          role="tooltip"
          class="invisible absolute left-1/2 top-full z-[60] -translate-x-1/2 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        >
          <div
            class="min-w-64 whitespace-nowrap rounded-xl bg-white p-3 text-left text-sm text-primary-900 shadow-[0_12px_40px_-12px_rgba(20,30,57,0.35)] ring-1 ring-primary-900/5"
          >
            <p class="mb-2 px-2 font-normal">Business Hours</p>
            <ul>
              <li
                v-for="(hour, day) in weekHours"
                :key="day"
                :class="[
                  'flex gap-6 rounded-md px-2 py-1 capitalize',
                  day === today
                    ? 'bg-primary-50 font-normal'
                    : 'font-light text-primary-700',
                ]"
              >
                <span>{{ day }}</span>
                <span class="ml-auto">{{ hour }}</span>
              </li>
            </ul>
          </div>
        </div>
      </li>

      <li class="py-2 text-2xl sm:text-[13px] flex items-center justify-center">
        <NuxtLink
          class="hover:opacity-75 transition-opacity flex items-center justify-center"
          :href="links.google_maps"
        >
          <Icon name="fa6-solid:location-dot" class="mr-2" />
          <span class="hidden sm:block">{{ location }}</span>
        </NuxtLink>
      </li>

      <!-- Hidden while the register link below is commented out, so it
           doesn't add a gap after the address -->
      <li class="hidden">
        <!-- <NuxtLink
          class="flex items-center rounded-full p-1.5 px-5 bg-primary-200 text-primary-900 hover:opacity-75 transition-opacity"
          :href="links.patient_register"
        >
          <span>Register As a Patient</span>
          <Icon class="ml-2" name="fa6-solid:angle-right"
        /></NuxtLink> -->
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const phoneMain = businessInfo.contact.phone.main;
const phoneFax = businessInfo.contact.phone.fax;
const { hours: weekHours, today, isOpen, holiday } = useStoreHours();
const location = businessInfo.address.short;
const { links } = businessInfo;
</script>
