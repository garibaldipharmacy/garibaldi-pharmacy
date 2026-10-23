<template>
  <div>
    <div>
      <NuxtLink to="/">
        <img
          src="@/assets/images/logostyles/logo-wide-dark.svg"
          alt="Garibaldi Pharmacy and Compounding Lab logo"
          width="172"
          height="50"
          loading="lazy"
        />
      </NuxtLink>
      <h2 class="mt-6 text-lg font-medium">Garibaldi Pharmacy</h2>
      <p class="mt-2 mb-8 max-w-sm text-sm font-light text-primary-200">
        Discover personalized medicine and accessible healthcare at its best.
        Dedicated to improving the health and wellness of Squamish.
      </p>
    </div>

    <!-- Wraps rather than nesting a <div> in the list, which screen readers
         can't announce, to keep telephone and fax side by side -->
    <ul class="grid max-w-sm grid-cols-2 gap-x-6 gap-y-5 text-sm">
      <li class="col-span-2">
        <h3 class="mb-1 flex items-center font-medium">
          <Icon class="mr-2 text-xs text-primary-300" name="fa6-solid:location-dot" /> Address
        </h3>
        <p>
          <NuxtLink
            :href="links.google_maps"
            class="font-light text-primary-200 transition-colors hover:text-white"
            >{{ address }}</NuxtLink
          >
        </p>
      </li>

      <li>
        <h3 class="mb-1 flex items-center font-medium">
          <Icon class="mr-2 text-xs text-primary-300" name="fa6-solid:phone" /> Telephone
        </h3>
        <p>
          <NuxtLink
            :href="`tel:${phone.main}`"
            class="font-light text-primary-200 transition-colors hover:text-white"
            >{{ phone.main }}</NuxtLink
          >
        </p>
      </li>

      <li>
        <h3 class="mb-1 flex items-center font-medium">
          <Icon class="mr-2 text-xs text-primary-300" name="fa6-solid:fax" /> Fax
        </h3>
        <NuxtLink
          :href="`tel:${phone.fax}`"
          class="font-light text-primary-200 transition-colors hover:text-white"
          >{{ phone.fax }}</NuxtLink
        >
      </li>

      <li class="col-span-2">
        <h3 class="mb-1 flex items-center font-medium">
          <Icon class="mr-2 text-xs text-primary-300" name="fa6-solid:envelope" /> Email
        </h3>
        <p>
          <NuxtLink
            :href="`mailto:${email}`"
            class="font-light text-primary-200 transition-colors hover:text-white"
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
