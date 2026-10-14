<template>
  <PageIntro title="Compounding">
    <p>
      As a compounding pharmacy we can prepare the exact medication you need by
      means of a custom formula.
    </p>
  </PageIntro>

  <PagePhoto>
    <img
      src="@/assets/images/squamish-compounding-pharmacy-1440.webp"
      srcset="
        @/assets/images/squamish-compounding-pharmacy-800.webp 800w,
        @/assets/images/squamish-compounding-pharmacy-1440.webp 1440w
      "
      sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
      width="1440"
      height="549"
      fetchpriority="high"
      alt="A stone mortar and pestle grinding dried herbs and spices on a wooden board."
    />
  </PagePhoto>

  <!-- What is compounding? / Compounding Pharmacy -->
  <section class="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:pt-20">
    <div class="grid gap-x-16 text-primary-900 md:grid-cols-2">
      <div v-reveal class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h2 class="text-2xl font-bold tracking-tight">What is compounding?</h2>
        <p class="mt-4 font-light leading-relaxed text-slate-600">
          Compounding is a term used for making medication from scratch. It is
          pharmacy just like the good old days where pharmacists take the raw
          ingredients and produce a customized medication in the required
          dosage form for the patient.
        </p>
      </div>
      <div v-reveal="120" class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h2 class="text-2xl font-bold tracking-tight">Compounding Pharmacy</h2>
        <div class="mt-4 space-y-4 font-light leading-relaxed text-slate-600">
          <p>
            At Garibaldi Pharmacy, we are the first pharmacy in the Sea to Sky
            to boast a NAPRA-certified lab where we can produce compounded
            medication with the strictest quality standards.
          </p>
          <p>
            Compounding may be necessary if your doctor wants you to take a
            medication that is not produced commercially.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Process -->
  <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div
      v-reveal
      class="group relative isolate overflow-hidden rounded-3xl bg-primary-50 px-6 py-12 text-center text-primary-900 sm:px-12 lg:py-16"
    >
      <!-- A sprig in each bottom corner, framing the centred process -->
      <LeafSprig
        flip
        class="absolute -bottom-2 left-6 -z-10 hidden h-36 w-28 md:block"
      />
      <LeafSprig
        class="absolute -bottom-2 right-6 -z-10 hidden h-28 w-24 md:block"
      />
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Process</h2>
      <p class="mt-3 text-lg font-light text-slate-600">
        How you can get a custom medication made for you
      </p>

      <!-- Headless UI 1.7 takes the selected index in and reports changes
           with an event; it ignores v-model, so the pills wouldn't follow -->
      <TabGroup
        :selectedIndex="selectedTab"
        @change="(index) => (selectedTab = index)"
        as="div"
        class="mx-auto mt-10 max-w-2xl"
      >
        <!-- A two-way toggle: the chosen side is a raised white pill -->
        <TabList
          class="inline-flex w-full flex-col gap-1 rounded-3xl bg-white/70 p-1.5 ring-1 ring-primary-900/5 sm:w-auto sm:flex-row sm:rounded-full"
        >
          <Tab
            v-for="(tab, index) in tabs"
            :key="tab.label"
            :class="[
              'flex items-center justify-center gap-3 rounded-full px-6 py-3 font-medium transition',
              selectedTab === index
                ? 'bg-white text-primary-900 shadow'
                : 'text-slate-600 hover:text-primary-900',
            ]"
          >
            <Icon :name="tab.icon" :class="['text-xl', tab.iconClass]" />
            {{ tab.label }}
          </Tab>
        </TabList>
        <TabPanels
          class="mt-10 font-light leading-relaxed text-slate-600 sm:text-lg"
        >
          <TabPanel>
            <p>
              Bring your prescription into Garibaldi Pharmacy or
              <NuxtLink
                to="/prescriptions/send/"
                class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
                >submit your prescription online.</NuxtLink
              >
            </p>
          </TabPanel>
          <TabPanel>
            <p>
              Visit your physician next door at
              <NuxtLink
                class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
                to="/medical-clinic/"
                >Terra Nova Medical Clinic</NuxtLink
              >
              and receive a prescription.
            </p>
            <!-- A divider rather than a bare word, so the two routes read
                 as alternatives -->
            <p
              class="my-8 flex items-center gap-4 text-sm font-medium uppercase tracking-widest text-primary-400"
            >
              <span aria-hidden="true" class="h-px flex-1 bg-primary-900/10" />
              OR
              <span aria-hidden="true" class="h-px flex-1 bg-primary-900/10" />
            </p>
            <p>
              Talk to our pharmacists who will offer recommendations for your
              treatment.
            </p>
            <p class="mt-3">
              A physician must review, and approve our recommendation, after
              which they will provide a prescription.
            </p>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </section>

  <CallToAction
    title="Get Started with Compounding"
    :primaryButton="primaryButton"
    :showFooter="false"
  />
</template>

<script lang="ts" setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import { ref } from "vue";

const selectedTab = ref(0);

const tabs = [
  {
    label: "I have a prescription",
    icon: "fa6-solid:circle-check",
    iconClass: "text-secondary-700",
  },
  {
    label: "I don't have a prescription",
    icon: "fa6-solid:circle-xmark",
    iconClass: "text-red-500",
  },
];

useSeoMeta({
  title: "Garibaldi Pharmacy | Compounding Pharmacy in Squamish",
  description:
    "Garibaldi Pharmacy in Squamish offers professional compounding services. Our NAPRA-certified lab creates customized medications tailored to your exact needs with the highest quality standards.",
  ogTitle: "Garibaldi Pharmacy | Compounding Pharmacy in Squamish",
  ogDescription:
    "Garibaldi Pharmacy in Squamish offers professional compounding services. Our NAPRA-certified lab creates customized medications tailored to your exact needs with the highest quality standards.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/services/compounding/",
  twitterTitle: "Garibaldi Pharmacy | Compounding Pharmacy in Squamish",
  twitterDescription:
    "Garibaldi Pharmacy in Squamish offers professional compounding services. Our NAPRA-certified lab creates customized medications tailored to your exact needs with the highest quality standards.",
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
      href: "https://garibaldipharmacy.com/services/compounding/",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

const primaryButton = {
  text: "Contact Us",
  icon: "fa6-solid:phone",
  link: "/contact/",
};
</script>
