<template>
  <div>
    <!-- Hero Section -->
    <section
      class="flex flex-wrap bg-primary-100 mx-auto items-center justify-center"
    >
      <div class="p-10 sm:w-1/2 mx-auto text-primary-900 title-section">
        <h2 class="text-3xl font-bold text-center">
          Garibaldi Pharmacy is proud to bring a new medical clinic into
          Squamish!
        </h2>
      </div>
      <img
        class="sm:w-1/2"
        src="@/assets/images/terra-nova-squamish-medical-clinic.jpg"
        alt="The Squamish storefront of Garibaldi Pharmacy and Terra Nova Medical clinic"
      />
    </section>

    <!-- Announcement for No More Patients -->
    <!-- <section class="container mx-auto flex items-center justify-center mt-10">
      <div
        class="bg-secondary-100 p-4 rounded-md border-secondary-900 border-t-8 flex items-center justify-center gap-5 md:w-1/2 mx-10 md:mx-0 flex-wrap"
      >
        <div
          class="flex items-center justify-center gap-5 text-secondary-900 font-bold"
        >
          <Icon name="fa6-solid:bullhorn" class="text-xl" />
          <h3 class="text-xl">Announcement</h3>
        </div>
        <div>
          <p>
            Due to the high volume of patient registrations, the clinic is no
            longer taking in new patients. If you are in need of a family
            doctor, you may call the clinic to be put on a wait list. We are
            hoping to open up intake again soon as more practitioners become
            available later this year.
          </p>
        </div>
      </div>
    </section> -->

    <section
      class="flex container p-10 md:p-0 justify-center mx-auto gap-5 my-10 flex-wrap"
    >
      <div
        class="bg-secondary-100 rounded-md p-10 text font-light flex flex-col gap-5 flex-1"
      >
        <img
          src="@/assets/images/logostyles/terranova-logo.svg"
          alt="Terranova Medical Clinic Logo"
          width="150"
          class="mx-auto mb-5"
        />
        <p>
          Our in-house medical clinic is a family practice clinic and is managed
          by the
          <NuxtLink
            class="text-secondary-900 underline hover:no-underline"
            target="_blank"
            to="https://www.terranovamedical.ca/"
            rel="noopener noreferrer"
            >Terra Nova Medical Group</NuxtLink
          >. The clinic is currently accepting new patients who do not already
          have a family doctor in Squamish.
        </p>
        <p>
          Terra Nova Squamish Clinic is currently led by Dr. Alison Ukrainec.
        </p>
      </div>

      <div class="bg-white shadow-md rounded-md py-2.5 px-3 w-full md:w-2/6">
        <h3 class="text-primary-900 ml-5 mt-5 text-lg">
          To reach the clinic you may now contact them directly:
        </h3>
        <ul class="p-4">
          <li v-for="option in contactOptions" :key="option.title" class="p-1">
            <NuxtLink
              :to="option.link"
              class="text-primary-900 flex gap-2 flex-wrap hover:text-secondary-900 transition-colors"
            >
              <div>
                <Icon :name="option.icon" class="mr-3" />
                <span class="font-medium">{{ option.title }}</span>
              </div>
              <span class="font-light w-full sm:w-auto sm:ml-auto truncate">{{
                option.value
              }}</span>
            </NuxtLink>
          </li>
        </ul>
        <p class="text-primary-900 ml-5 mt-5 mb-5 font-light">
          Please address any emails to Christina, our medical office assistant
        </p>
      </div>

      <div class="font-light bg-white p-8 flex-1 shadow-md rounded-md">
        <h4 class="font-bold text-primary-900 text-lg">
          <Icon name="fa6-solid:clock" class="mr-2" /> Medical Clinic Hours
        </h4>
        <ul class="mt-5">
          <li
            v-for="(hour, day) in hours"
            :class="[
              'flex',
              'gap-5',
              'mb-2',
              'capitalize',
              {
                'opacity-75': !isCurrentDay(day),
                'text-primary-900': !isCurrentDay(day),
                'font-bold': isCurrentDay(day),
                'text-secondary-900': isCurrentDay(day),
              },
            ]"
            :key="day"
          >
            <span>{{ day }}</span>
            <span class="ml-auto">{{ hour }}</span>
          </li>
        </ul>
      </div>
    </section>
    <section
      class="flex mx-auto justify-start items-center container mb-10"
    ></section>
  </div>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";
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

const isCurrentDay = (day: string) => {
  const currentDate = new Date();
  const currentDayIndex = new Date(
    currentDate.toLocaleString("en-US", { timeZone: "America/Vancouver" })
  ).getDay();

  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return daysOfWeek[currentDayIndex].toLowerCase() === day.toLowerCase();
};

useSeoMeta({
  title: "Garibaldi Pharmacy | Medical Clinic",
  description:
    "Our in-house medical clinic is a family practice clinic and is managed by the Terra Nova Medical Group.",
  ogTitle: "Garibaldi Pharmacy | Medical Clinic",
  ogDescription:
    "Our in-house medical clinic is a family practice clinic and is managed by the Terra Nova Medical Group.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | Medical Clinic",
  twitterDescription:
    "Our in-house medical clinic is a family practice clinic and is managed by the Terra Nova Medical Group.",
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
      href: "https://garibaldipharmacy.com/medical-clinic",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>
