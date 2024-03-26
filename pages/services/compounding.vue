<template>
  <!-- Hero Section -->
  <section class="mx-auto">
    <div class="relative">
      <img
        class="w-full"
        src="@/assets/images/squamish-compounding-pharmacy.jpg"
        alt="A healthcare professional in a white coat and gloves is using a stethoscope to check the heart or lungs of a smiling young man wearing a denim jacket in a clinical setting."
      />
      <div class="hero-over-text sm:text-white px-5 mt-5 text-primary-900">
        <h1 class="text-4xl font-bold">Compounding</h1>
        <p class="font-light mt-2 opacity-75 sm:opacity-100">
          As a compounding pharmacy we can prepare the exact medication you need
          by means of a custom formula.
        </p>
      </div>
    </div>
  </section>

  <section class="container mx-auto">
    <div class="p-4 flex gap-2 flex-col font-light text-primary-900 my-10">
      <h2 class="font-bold text-2xl">What is compounding?</h2>
      <p>
        Compounding is a term used for making medication from scratch. It is
        pharmacy just like the good old days where pharmacists take the raw
        ingredients and produce a customized medication in the required dosage
        form for the patient.
      </p>
      <h2 class="font-bold text-2xl mt-5">Compounding Pharmacy</h2>
      <p>
        At Garibaldi Pharmacy, we are the first pharmacy in the Sea to Sky to
        boast a NAPRA-certified lab where we can produce compounded medication
        with the strictest quality standards.
      </p>
      <p>
        Compounding may be necessary if your doctor wants you to take a
        medication that is not produced commercially.
      </p>
    </div>
  </section>

  <section class="bg-primary-100 text-primary-900 py-10">
    <div class="container mx-auto">
      <div class="text-center">
        <h2 class="text-2xl font-bold">Process</h2>
        <p class="font-light">
          How you can get a custom medication made for you
        </p>
      </div>

      <!-- Tab group -->
      <div class="mt-10">
        <TabGroup v-model:modelValue="selectedTab" as="div">
          <TabList class="flex flex-wrap gap-4 justify-center">
            <Tab
              :class="[
                defaultTabStyles,
                { 'border-primary-500 outline-primary-500': selectedTab === 0 },
              ]"
              @click="selectedTab = 0"
            >
              <div class="">
                <Icon
                  name="fa6-solid:circle-check"
                  class="text-green-500 text-2xl"
                />
                <span class="ml-3">I have a prescription</span>
              </div>
            </Tab>
            <Tab
              :class="[
                defaultTabStyles,
                { 'border-primary-500 outline-primary-500': selectedTab === 1 },
              ]"
              @click="selectedTab = 1"
            >
              <div class="">
                <Icon
                  name="fa6-solid:circle-xmark"
                  class="text-red-500 text-2xl"
                />
                <span class="ml-3">I don't have a prescription</span>
              </div>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel :key="0" class="text-center mt-10 font-light">
              <!-- Content for "With Prescription" tab -->
              <p>
                Bring your prescription into Garibaldi Pharmacy or
                <NuxtLink
                  to="/prescriptions/send"
                  class="underline hover:no-underline hover:opacity-75 transition-opacity"
                  >submit your prescription online.</NuxtLink
                >
              </p>
            </TabPanel>
            <TabPanel :key="1" class="text-center mt-10 font-light">
              <!-- Content for "Without Prescription" tab -->
              <p>
                Visit your physician next door at
                <NuxtLink
                  class="underline hover:no-underline hover:opacity-75 transition-opacity"
                  to="/medical-clinic"
                  >Terra Nova Medical Clinic</NuxtLink
                >
                and receive a prescription.
              </p>
              <p class="my-10 font-bold">OR</p>
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

const defaultTabStyles =
  "w-full sm:w-auto mx-3 p-5 rounded-xl  border-2 bg-white transition-all";

const selectedTab = ref(0);

useSeoMeta({
  title: "Garibaldi Pharmacy | Compounding",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy | Compounding",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | Compounding",
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
      href: "https://garibaldipharmacy.com/services/compounding",
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
  link: "/contact",
};
</script>

<style scoped>
@media screen and (min-width: 640px) {
  .hero-over-text {
    position: absolute;
    top: 50%;
    left: 4rem;
    transform: translateY(-50%);
    width: 450px;
    max-width: calc(100% - 40px);
    padding: 0;
    margin-top: 0;
  }
}
</style>
