<template>
  <!-- Hero Section -->
  <section class="">
    <div class="relative">
      <!-- Desktop Hero Image -->
      <NuxtImg
        preload
        src="/images/pharmacy-squamish-hero-image.jpg"
        alt="A happy family wearing white t-shirts and blue jeans in the park jumping and smiling."
        format="webp"
        width="1700"
        height="600"
        :placeholder="[850, 300, 75, 10]"
        sizes="lg:1478px"
        class="w-full hidden lg:block"
        fit="cover"
      />
      <!-- Tablet Hero Image -->
      <NuxtImg
        preload
        src="/images/pharmacy-squamish-hero-image-tablet.jpg"
        alt="A happy family wearing white t-shirts and blue jeans in the park jumping and smiling."
        format="webp"
        width="1700"
        height="800"
        :placeholder="[850, 300, 75, 10]"
        sizes="sm:768px"
        class="w-full hidden sm:block lg:hidden"
        fit="cover"
      />
      <!-- Mobile Hero Image -->
      <NuxtImg
        preload
        src="/images/pharmacy-squamish-hero-image-mobile.jpg"
        alt="A happy family wearing white t-shirts and blue jeans in the park jumping and smiling."
        format="webp"
        height="600"
        width="400"
        :placeholder="[400, 600, 75, 10]"
        sizes="xs:600px"
        class="w-full sm:hidden"
        fit="cover"
      />

      <div
        class="text-white px-5 mb-10 sm:px-10 xl:px-20 absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-start md:justify-center mt-10 md:mt-0 text-center sm:text-left"
      >
        <h1 class="text-3xl font-bold md:w-2/6">
          Discover personalized medicine and accessible healthcare at its best
        </h1>
        <p class="font-light text-xl md:w-2/6 mt-2">
          We are dedicated to improving the health and wellness of Squamish
        </p>
      </div>

      <nav class="">
        <ul
          class="flex p-3 gap-2 -mt-10 mb-10 items-center pill-buttons justify-center flex-wrap no-appointment-pills-only"
        >
          <!-- <li class="flex-1">
          <AppointmentCard />
        </li> -->
          <!-- <div class="flex gap-2 pill-buttons content-center flex-wrap basis-3/6"> -->
          <li>
            <button
              type="button"
              @click="openModal"
              class="py-4 px-5 shadow-lg text-primary-900 inline-flex items-center rounded-md bg-white hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <CircleIcon icon="fa6-solid:phone" class="mr-3" />
              <span>Contact Us</span>
              <Icon class="ml-auto" name="fa6-solid:angle-right" />
            </button>
          </li>

          <li>
            <ButtonPill
              to="/prescriptions/transfer"
              icon="fa6-solid:paper-plane"
              theme="secondary"
            >
              Transfer Prescription
            </ButtonPill>
          </li>

          <li>
            <ButtonPill
              to="/prescriptions/refill"
              icon="fa6-solid:prescription-bottle"
            >
              Refill Medications
            </ButtonPill>
          </li>

          <li>
            <ButtonPill
              to="/prescriptions/send"
              icon="fa6-solid:prescription"
              theme="secondary"
            >
              Send Prescription
            </ButtonPill>
          </li>
          <!-- </div> -->
        </ul>
      </nav>
    </div>
  </section>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 flex items-center"
              >
                <CircleIcon icon="fa6-solid:address-book" class="mr-2" /><span
                  >Contact Information</span
                >
              </DialogTitle>
              <div class="mt-4">
                <ul>
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
                        class="font-light w-full sm:w-auto sm:ml-auto text-sm sm:text-base"
                        >{{ option.value }}</span
                      >
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-900 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Services -->
  <section class="container mx-auto services-section">
    <TitleSection
      title="Services"
      description="Discover our range of services designed for your wellness. From prescription refills to health consultations, we're here to support you."
    />
    <div class="px-4 my-10 flex gap-5 py-5 flex-wrap">
      <BorderedCard
        v-for="card in serviceCards"
        :icon="card.icon"
        :title="card.title"
        :description="card.description"
        class="w-full sm:w-auto sm:flex-1"
      />
    </div>
    <!-- <NuxtLink
      to="/services"
      class="mx-auto text-center block mb-10 text-slate-500 hover:text-slate-800 transition-colors"
      >View all our service offerings
      <Icon class="ml-3" name="fa6-solid:arrow-right-long"
    /></NuxtLink> -->
  </section>

  <!-- Why Us -->
  <SectionWhyUs />

  <!-- CTA -->
  <CallToAction />
</template>

<script setup lang="ts">
import { businessInfo } from "~/constants/business";
const { contact } = businessInfo;
import { ref } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

defineOgImageComponent("NuxtSeo", {
  title: "Garibaldi Pharmacy",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  theme: "#141E39",
  siteLogo: "/images/logostyles/garibaldi-pharmacy-squamish-logo.svg",
  icon: "/pwa/garibaldi-pharmacy-512.png",
});

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
    value: contact.email,
    link: `mailto:${contact.email}`,
  },
];

useSeoMeta({
  title: "Garibaldi Pharmacy - Your Squamish Compounding Pharmacy",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy - Your Squamish Compounding Pharmacy",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy - Your Squamish Compounding Pharmacy",
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
      href: "https://garibaldipharmacy.com",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

const serviceCards = [
  {
    icon: "fa6-solid:truck",
    title: "Delivery",
    description:
      "We provide delivery throughout Squamish. Have your medications delivered straight to the comfort of your own home.",
  },
  {
    icon: "healthicons:blister-pills-round-x4",
    title: "Compliance Packaging",
    description:
      "If you take several medications at different times of the day and find it difficult to manage, we can arrange your medication into a convenient blister or bubble pack to help you take the right medication at the right time.",
  },
  {
    icon: "fa6-solid:clipboard-list",
    title: "Medication Reviews",
    description:
      "Pharmacists are the therapeutics experts. Have a one-on-one consultation with a pharmacist to better understand your medications. We will make sure you are getting the maximum benefit from your medications.",
  },
  {
    icon: "bx:bxs-injection",
    title: "Vaccines & Immunizations",
    description:
      "Whether you need your seasonal flu shot, travel vaccinations, or most other vaccines to prevent certain diseases, we can make sure you get what you need to stay protected.",
  },
];

const isOpen = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}
</script>

<style scoped>
.pill-buttons li a,
.pill-buttons li button {
  width: 100%;
}

@media screen and (max-width: 768px) {
  .no-appointment-pills-only li,
  .no-appointment-pills-only li a {
    width: 100%;
  }
}
</style>
