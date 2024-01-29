<template>
  <div>
    <div>
      <img
        src="@/assets/images/logostyles/logo-wide-dark.svg"
        alt="Garibaldi Pharmacy and Compounding Lab logo"
      />
      <h3 class="text-xl mt-5">Garibaldi Pharmacy</h3>
      <p class="text-sm font-extralight w-4/5 mb-5">
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
          <a
            :href="links.google_maps"
            target="_blank"
            rel="noopener noreferrer"
            >{{ address }}</a
          >
        </p>
      </li>

      <div class="flex gap-5 mb-5">
        <li class="font-extralight text-sm">
          <h4 class="mb-2 font-bold">
            <Icon class="mr-2" name="fa6-solid:phone" /> Telephone
          </h4>
          <p>
            <a :href="`tel:${phone.main}`">{{ phone.main }}</a>
          </p>
        </li>

        <li class="font-extralight text-sm">
          <h4 class="mb-2 font-bold">
            <Icon class="mr-2" name="fa6-solid:fax" /> Fax
          </h4>
          <a :href="`tel:${phone.fax}`">{{ phone.fax }}</a>
        </li>
      </div>

      <li class="font-extralight text-sm">
        <h4 class="mb-2 font-bold">
          <Icon class="mr-2" name="fa6-solid:envelope" /> Email
        </h4>
        <p>
          <a :href="`mailto:${email}`">{{ email }}</a>
        </p>
      </li>
    </ul>

    <p class="font-extralight opacity-75 text-xs pt-5">
      Garibaldi Pharmacy is licensed by the College of Pharmacists of British
      Columbia. The college registrant who is the manager of the record is Dean
      George. All pharmacy practice issues may be reported directly to the
      College of Pharmacists of BC via their
      <a
        class="underline hover:no-underline"
        href="https://www.bcpharmacists.org/"
        target="_blank"
        rel="noopener noreferrer"
        >website</a
      >.
    </p>
  </div>
</template>

<script setup lang="ts">
import { businessInfo } from "~/constants/business";

const address = businessInfo.address.full;
const phone = businessInfo.contact.phone;
const email = businessInfo.contact.email;
const links = businessInfo.links;
</script>
