<template>
  <div>
    <!-- Hero Section -->
    <section
      class="flex flex-wrap bg-primary-900 mx-auto items-center justify-center"
    >
      <img
        class="sm:w-1/2"
        src="@/assets/images/squamish-pharmacy-front.jpg"
        alt="The Squamish storefront of Garibaldi Pharmacy and Terra Nova Medical clinic"
      />
      <div class="p-10 sm:w-1/2 mx-auto text-white title-section">
        <h2 class="text-3xl font-bold text-center">Contact Us</h2>
        <p class="text-center font-light opacity-80 mt-3">
          Use one of the options below to reach us!
        </p>
      </div>
    </section>
    <section class="bg-primary-100 flex items-center justify-center">
      <nav class="container">
        <ul
          class="flex gap-5 flex-wrap md:flex-nowrap p-10 mx-auto items-center justify-center"
        >
          <!-- Prescription buttons -->
          <div class="flex items-center md:w-2/3 flex-wrap gap-5">
            <li class="w-full">
              <ButtonPill
                to="/prescriptions/transfer"
                icon="fa6-solid:paper-plane"
                theme="secondary"
                class="w-full"
              >
                Transfer Prescription
              </ButtonPill>
            </li>

            <li class="w-full">
              <ButtonPill
                to="/prescriptions/refill"
                icon="fa6-solid:prescription-bottle"
                class="w-full"
              >
                Refill Medications
              </ButtonPill>
            </li>

            <li class="w-full">
              <ButtonPill
                to="/prescriptions/send"
                icon="fa6-solid:prescription"
                theme="secondary"
                class="w-full"
              >
                Send Prescription
              </ButtonPill>
            </li>
          </div>
          <div class="bg-white shadow-md rounded-md py-2.5 px-3 w-full">
            <h3 class="text-primary-900 text-lg p-3">
              <CircleIcon icon="fa6-solid:address-book" class="mr-3" />
              <span>Contact Information</span>
            </h3>
            <!-- Contact Information -->
            <ul class="p-4">
              <li
                v-for="option in contactOptions"
                :key="option.title"
                class="p-1"
              >
                <NuxtLink
                  :to="option.link"
                  class="text-primary-900 flex gap-2 flex-wrap"
                >
                  <div>
                    <Icon :name="option.icon" class="mr-3" />
                    <span class="font-medium">{{ option.title }}</span>
                  </div>
                  <span
                    class="font-light w-full sm:w-auto sm:ml-auto truncate"
                    >{{ option.value }}</span
                  >
                </NuxtLink>
              </li>
            </ul>
          </div>
        </ul>
      </nav>
    </section>
    <section
      class="container mx-auto gap-5 flex flex-wrap items-center justify-center mt-10 mb-10"
    >
      <div class="text-center w-full">
        <h3 class="text-2xl font-bold text-primary-900">Our Location</h3>
        <p class="text-primary-900 font-normal">
          Located in the Wilfred Building
        </p>
        <NuxtLink
          :to="links.google_maps"
          class="font-light text-primary-900 hover:underline"
          >{{ address.full }}</NuxtLink
        >
      </div>
      <div class="w-full mt-3">
        <iframe
          class="w-full"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10312.492073503878!2d-123.14409766842617!3d49.74612905701535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486f9aba5d1b65d%3A0xbf08346d48a7b8a6!2sGaribaldi%20Pharmacy%20%26%20Compounding%20Lab!5e0!3m2!1sen!2sca!4v1708477543698!5m2!1sen!2sca"
          width="600"
          height="450"
          style="border: 0"
          allowfullscreen="false"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";
const { address, contact, links } = businessInfo;

const contactOptions = [
  {
    icon: "fa6-solid:phone",
    title: "Phone",
    value: contact.phone.main,
    link: `tel:${contact.phone.main}`,
  },
  {
    icon: "fa6-solid:fax",
    title: "Fax",
    value: contact.phone.fax,
    link: `tel:${contact.phone.fax}`,
  },
  {
    icon: "fa6-solid:envelope",
    title: "Email",
    value: contact.email,
    link: `mailto:${contact.email}`,
  },
  {
    icon: "fa6-solid:globe",
    title: "Social",
    value: contact.social_handle,
    link: links.instagram,
  },
];

useSeoMeta({
  title: "Garibaldi Pharmacy | Contact",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy | Contact",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | Contact",
  twitterDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  twitterImage: "/favicon/android-chrome-512x512.png",
  twitterCard: "summary",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/contact",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
