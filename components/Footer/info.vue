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
      <h2 class="text-xl mt-5">Garibaldi Pharmacy</h2>
      <p class="text-sm font-extralight mb-5 sm:w-1/2">
        Discover personalized medicine and accessible healthcare at its best.
        Dedicated to improving the health and wellness of Squamish.
      </p>
    </div>

    <!-- Wraps rather than nesting a <div> in the list, which screen readers
         can't announce, to keep telephone and fax side by side -->
    <ul class="font-light flex flex-wrap gap-x-5">
      <li class="w-full mb-5 font-extralight text-sm">
        <h3 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:location-dot" /> Address
        </h3>
        <p>
          <NuxtLink
            :href="links.google_maps"
            class="hover:opacity-50 transition-opacity"
            >{{ address }}</NuxtLink
          >
        </p>
      </li>

      <li class="mb-5 font-extralight text-sm">
        <h3 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:phone" /> Telephone
        </h3>
        <p>
          <NuxtLink
            :href="`tel:${phone.main}`"
            class="hover:opacity-50 transition-opacity"
            >{{ phone.main }}</NuxtLink
          >
        </p>
      </li>

      <li class="mb-5 font-extralight text-sm">
        <h3 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:fax" /> Fax
        </h3>
        <NuxtLink
          :href="`tel:${phone.fax}`"
          class="hover:opacity-50 transition-opacity"
          >{{ phone.fax }}</NuxtLink
        >
      </li>

      <li class="w-full font-extralight text-sm">
        <h3 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:envelope" /> Email
        </h3>
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
