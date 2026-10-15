<template>
  <PageIntro
    title="Garibaldi Pharmacy is proud to bring a new medical clinic into Squamish!"
  />

  <PagePhoto>
    <img
      src="@/assets/images/terra-nova-squamish-medical-clinic-900.webp"
      srcset="
        @/assets/images/terra-nova-squamish-medical-clinic-480.webp 480w,
        @/assets/images/terra-nova-squamish-medical-clinic-900.webp 900w
      "
      sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
      width="900"
      height="600"
      fetchpriority="high"
      alt="The reception area of Terra Nova Squamish Clinic, inside Garibaldi Pharmacy in Squamish"
    />
  </PagePhoto>

  <!-- Announcement for No More Patients -->
  <!-- <section class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
    <div
      class="flex flex-wrap items-center gap-5 rounded-3xl bg-secondary-100 p-6 text-secondary-900 sm:p-8"
    >
      <h2 class="flex items-center gap-3 text-xl font-bold">
        <Icon name="fa6-solid:bullhorn" /> Announcement
      </h2>
      <p class="font-light">
        Due to the high volume of patient registrations, the clinic is no
        longer taking in new patients. If you are in need of a family doctor,
        you may call the clinic to be put on a wait list. We are hoping to open
        up intake again soon as more practitioners become available later this
        year.
      </p>
    </div>
  </section> -->

  <section class="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pb-24">
    <!-- The clinic and its contact details stack on the left, leaving the
         hours enough width that the split-day times stay on one line -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="grid gap-4">
        <!-- The clinic -->
        <div
          v-reveal
          class="flex flex-col gap-5 rounded-3xl bg-secondary-100 p-8 font-light leading-relaxed text-secondary-950"
        >
          <img
            src="@/assets/images/logostyles/terranova-logo.svg"
            alt="Terra Nova Medical Group logo"
            width="150"
            height="91"
            loading="lazy"
            class="mb-2"
          />
          <p>
            Our in-house medical clinic is a family practice clinic and is
            managed by the
            <NuxtLink
              class="font-normal text-secondary-900 underline underline-offset-4 hover:no-underline"
              target="_blank"
              to="https://www.terranovamedical.ca/"
              rel="noopener noreferrer"
              >Terra Nova Medical Group</NuxtLink
            >.
          </p>
          <p>
            Terra Nova Squamish Clinic is currently led by Dr. Alison Ukrainec.
          </p>
        </div>

        <!-- Contact -->
        <div
          v-reveal="100"
          class="flex flex-col rounded-3xl bg-primary-50 p-8 text-primary-900"
        >
          <h2 class="text-lg font-semibold">
            To reach the clinic you may now contact them directly:
          </h2>
          <ul class="mt-6 space-y-2">
            <li v-for="option in contactOptions" :key="option.title">
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
          <p class="mt-6 font-light text-slate-600">
            Please address any emails to Christina, our medical office assistant
          </p>
        </div>
      </div>

      <!-- Hours -->
      <div
        v-reveal="200"
        class="rounded-3xl bg-primary-50 p-5 font-light text-primary-900 sm:p-8"
      >
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <Icon name="fa6-solid:clock" class="text-sm text-primary-400" />
          Medical Clinic Hours
        </h2>
        <ul class="mt-6 space-y-1 text-sm">
          <li
            v-for="(hour, day) in hours"
            :key="day"
            :class="[
              'flex items-baseline gap-4 rounded-lg px-3 py-2 capitalize',
              day === today
                ? 'bg-white font-semibold text-secondary-900'
                : 'text-primary-900/80',
            ]"
          >
            <span>{{ day }}</span>
            <span
              class="ml-auto whitespace-nowrap text-right text-xs sm:text-sm"
              >{{ hour }}</span
            >
          </li>
        </ul>
        <p class="mt-5 flex items-center gap-2 px-3 text-sm text-secondary-900">
          <Icon name="fa6-solid:asterisk" class="shrink-0" /> Please note the
          clinic is closed from 12:30 - 1:30 PM daily for lunch
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";
import { iconMotion } from "~/constants/iconMotions";

const { contact } = businessInfo;

const contactOptions = [
  {
    icon: "fa6-solid:phone",
    title: "Phone",
    value: contact.clinic.phone,
    link: `tel:${contact.clinic.phone}`,
  },
  {
    icon: "fa6-solid:envelope",
    title: "Email",
    value: contact.clinic.email,
    link: `mailto:${contact.clinic.email}`,
  },
];

const hours = businessInfo.business_hours.clinic;

// Worked out in the browser, so a prerendered page never highlights the day
// it happened to be built on
const { today } = useStoreHours();

useSeoMeta({
  title: "Medical Clinic in Squamish | Garibaldi Pharmacy & Terra Nova Clinic",
  description:
    "Garibaldi Pharmacy in Squamish offers an in-house medical clinic, managed by Terra Nova Medical Group. Get family healthcare, prescriptions, minor ailment care, and vaccinations conveniently on-site.",
  ogTitle:
    "Medical Clinic in Squamish | Garibaldi Pharmacy & Terra Nova Clinic",
  ogDescription:
    "Garibaldi Pharmacy in Squamish offers an in-house medical clinic, managed by Terra Nova Medical Group. Get family healthcare, prescriptions, minor ailment care, and vaccinations conveniently on-site.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/medical-clinic/",
  twitterTitle:
    "Medical Clinic in Squamish | Garibaldi Pharmacy & Terra Nova Clinic",
  twitterDescription:
    "Garibaldi Pharmacy in Squamish offers an in-house medical clinic, managed by Terra Nova Medical Group. Get family healthcare, prescriptions, minor ailment care, and vaccinations conveniently on-site.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/medical-clinic/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
