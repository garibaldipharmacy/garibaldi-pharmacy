<template>
  <div>
    <div>
      <NuxtLink to="/">
        <img
          src="@/assets/images/logostyles/logo-wide-dark.svg"
          alt="Garibaldi Pharmacy and Compounding Lab logo"
        />
      </NuxtLink>
      <h3 class="text-xl mt-5">Garibaldi Pharmacy</h3>
      <p class="text-sm font-extralight mb-5 sm:w-1/2 md:w-auto">
        Discover personalized medicine and accessible healthcare at its best.
        Dedicated to improving the health and wellness of Squamish.
      </p>
    </div>

    <ul class="font-light">
      <li class="mb-5 font-extralight text-sm">
        <h4 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:location-dot" /> Address
        </h4>
        <p>
          <NuxtLink
            :href="links.google_maps"
            class="hover:opacity-50 transition-opacity"
            >{{ address }}</NuxtLink
          >
        </p>
      </li>

      <div class="flex gap-5 mb-5">
        <li class="font-extralight text-sm">
          <h4 class="mb-2 font-bold">
            <Icon class="mr-2" name="fa6-solid:phone" /> Telephone
          </h4>
          <p>
            <NuxtLink
              :href="`tel:${phone.main}`"
              class="hover:opacity-50 transition-opacity"
              >{{ phone.main }}</NuxtLink
            >
          </p>
        </li>

        <li class="font-extralight text-sm">
          <h4 class="mb-2 font-bold">
            <Icon class="mr-2" name="fa6-solid:fax" /> Fax
          </h4>
          <NuxtLink
            :href="`tel:${phone.fax}`"
            class="hover:opacity-50 transition-opacity"
            >{{ phone.fax }}</NuxtLink
          >
        </li>
      </div>

      <li class="font-extralight text-sm">
        <h4 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:envelope" /> Email
        </h4>
        <p>
          <NuxtLink
            :href="`mailto:${email}`"
            class="hover:opacity-50 transition-opacity"
            >{{ email }}</NuxtLink
          >
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { businessInfo } from "~/constants/business";

const address = businessInfo.address.full;
const phone = businessInfo.contact.phone;
const email = businessInfo.contact.email;
const links = businessInfo.links;
</script>
