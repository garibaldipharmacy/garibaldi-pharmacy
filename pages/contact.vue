<template>
  <PageIntro title="Contact Us">
    <p>Use one of the options below to reach us!</p>
  </PageIntro>

  <PagePhoto>
    <img
      src="@/assets/images/squamish-pharmacy-front-1440.webp"
      srcset="
        @/assets/images/squamish-pharmacy-front-800.webp   800w,
        @/assets/images/squamish-pharmacy-front-1440.webp 1440w,
        @/assets/images/squamish-pharmacy-front-2400.webp 2400w
      "
      sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
      width="1440"
      height="1080"
      fetchpriority="high"
      alt="The Squamish storefront of Garibaldi Pharmacy and Terra Nova Medical clinic"
    />
  </PagePhoto>

  <section class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
    <div class="grid gap-4 lg:grid-cols-[2fr_3fr]">
      <!-- Prescription actions -->
      <nav
        v-reveal
        aria-label="Prescriptions"
        class="rounded-3xl bg-primary-50 p-3 sm:p-4"
      >
        <ul class="grid gap-2">
          <li
            v-for="action in prescriptionActions"
            :key="action.link"
            class="rounded-2xl bg-white"
          >
            <ActionTile
              :icon="action.icon"
              :title="action.title"
              :to="action.link"
              :theme="action.theme"
              class="px-4 py-5"
            />
          </li>
        </ul>
      </nav>

      <!-- Contact Information -->
      <div
        v-reveal="100"
        class="rounded-3xl bg-primary-50 p-6 text-primary-900 sm:p-8"
      >
        <h2 class="flex items-center gap-3 text-lg font-semibold">
          <CircleIcon icon="fa6-solid:address-book" bgColor="bg-white" />
          <span>Contact Information</span>
        </h2>
        <ul class="mt-6 grid gap-2 sm:grid-cols-2">
          <!-- Long values like the email address get a full row so they
               never wrap or get cut off -->
          <li
            v-for="option in contactOptions"
            :key="option.title"
            :class="{ 'sm:col-span-2': option.wide }"
          >
            <NuxtLink
              :to="option.link"
              class="group flex items-center gap-4 rounded-2xl bg-white p-4 transition hover:shadow-md"
            >
              <CircleIcon
                :icon="option.icon"
                :class="[
                  'h-10 w-10 shrink-0 overflow-hidden',
                  iconMotion(option.icon),
                ]"
              />
              <span class="min-w-0">
                <span class="block text-sm font-light text-slate-500">{{
                  option.title
                }}</span>
                <span class="block font-medium [overflow-wrap:anywhere]"
                  ><!-- A break opportunity after the @, so an email address that
                  doesn't fit splits there rather than mid-word. <wbr> adds
                  nothing to copied text -->
                  <template v-if="option.value.indexOf('@') > 0"
                    >{{ option.value.split("@")[0] }}@<wbr />{{
                      option.value.split("@")[1]
                    }}</template
                  >
                  <template v-else>{{ option.value }}</template></span
                >
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Location -->
  <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
    <div class="text-center text-primary-900">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Our Location
      </h2>
      <p class="mt-3 text-lg">Located in the Wilfred Building</p>
      <NuxtLink
        :to="links.google_maps"
        class="mt-1 inline-block font-light text-slate-600 underline-offset-4 hover:text-primary-900 hover:underline"
        >{{ address.full }}</NuxtLink
      >
    </div>
    <div
      v-reveal
      class="mt-10 overflow-hidden rounded-3xl ring-1 ring-primary-900/10"
    >
      <iframe
        class="block h-[360px] w-full sm:h-[450px]"
        title="Map showing Garibaldi Pharmacy in Squamish"
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
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";
import { iconMotion } from "~/constants/iconMotions";
import { prescriptionActions } from "~/constants/prescriptionActions";

const { address, contact, links } = businessInfo;

const contactOptions = [
  {
    icon: "fa6-solid:phone",
    title: "Phone / Text",
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
    wide: true,
    value: contact.email,
    link: `mailto:${contact.email}`,
  },
  {
    icon: "fa6-solid:globe",
    title: "Social",
    wide: true,
    value: contact.social_handle,
    link: links.instagram,
  },
];

useSeoMeta({
  title: "Contact Garibaldi Pharmacy | Squamish Pharmacy & Compounding Lab",
  description:
    "Get in touch with Garibaldi Pharmacy in Squamish. Reach us by phone, email, or visit our location for prescriptions, compounding, vaccinations, and healthcare services.",
  ogTitle: "Contact Garibaldi Pharmacy | Squamish Pharmacy & Compounding Lab",
  ogDescription:
    "Get in touch with Garibaldi Pharmacy in Squamish. Reach us by phone, email, or visit our location for prescriptions, compounding, vaccinations, and healthcare services.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/contact/",
  twitterTitle:
    "Contact Garibaldi Pharmacy | Squamish Pharmacy & Compounding Lab",
  twitterDescription:
    "Get in touch with Garibaldi Pharmacy in Squamish. Reach us by phone, email, or visit our location for prescriptions, compounding, vaccinations, and healthcare services.",
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
      href: "https://garibaldipharmacy.com/contact/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
