<template>
  <!-- Hero Section -->
  <section class="mx-auto">
    <div class="relative">
      <img
        class="w-full"
        src="@/assets/images/minor-ailments-pharmacy-squamish.jpg"
        alt="A healthcare professional in a white coat and gloves is using a stethoscope to check the heart or lungs of a smiling young man wearing a denim jacket in a clinical setting."
      />
      <div class="hero-over-text sm:text-white px-5 mt-5 text-primary-900">
        <h1 class="text-4xl font-bold">Minor Ailments</h1>
        <p class="font-light mt-2 opacity-75 sm:opacity-100">
          Pharmacists are the most accessible healthcare provider and are
          therapeutics experts. Take advantage of our pharmacists when you are
          experiencing a minor ailment. You will be able to get treatment faster
          than it takes to see a doctor.
        </p>
      </div>
    </div>
  </section>

  <!-- Appointment Booking -->
  <section
    class="text-primary-900 bg-primary-100 sm:rounded-lg container mx-auto my-5 p-5 sm:p-10"
  >
    <h2 class="text-2xl font-bold mb-3">Appointment Booking</h2>
    <div class="flex flex-wrap md:flex-nowrap items-center gap-5">
      <div class="flex flex-col gap-4 md:w-3/4">
        <p>
          To get assessed and treated, have your BC Health Card ready and book
          an appointment:
        </p>
        <p class="md:flex items-center">
          <Icon name="fa6-solid:circle-info" class="mr-2" /><span
            >Be sure to select Garibaldi Pharmacy as your clinic to see the
            appointments available.</span
          >
        </p>
        <p class="font-light w-4/5">
          Is booking an appointment too complicated, do none of the time slots
          work, or are you in a hurry? No problem. Give us a call at
          <NuxtLink
            :href="`tel:${phoneMain}`"
            class="underline hover:no-underline"
            >{{ phoneMain }}</NuxtLink
          >
          or email
          <NuxtLink
            :href="`mailto:${email}`"
            class="underline hover:no-underline"
            >{{ email }}</NuxtLink
          >
          and our pharmacist will try to make things work for you.
        </p>
      </div>
      <div class="md:w-1/4">
        <NuxtLink
          to="https://www.bookapharmacist.gov.bc.ca/minorail/s/"
          class="font-bold bg-primary-900 p-4 rounded-lg text-white flex gap-2 items-center justify-center hover:scale-105 hover:opacity-95 transition-transform"
          >Book Appointment <Icon name="fa6-solid:arrow-up-right-from-square"
        /></NuxtLink>
      </div>
    </div>
  </section>

  <!-- List of Minor Ailments -->
  <section class="mb-10">
    <div class="p-1 sm:w-1/2 mx-auto text-primary-900 title-section container">
      <h2 class="text-2xl font-bold text-center">List of Minor Ailments</h2>
      <p class="text-center font-light opacity-80 mt-3">
        Our pharmacists can assess and treat the following minor ailments. Click
        on each one to learn more about the condition to see if it matches what
        you are experiencing.
      </p>
      <p class="text-center font-light opacity-80 mt-3">
        Not sure if what you're experiencing is a minor ailment? No problem. Our
        pharmacists can still assess you and refer you to the appropriate
        healthcare provider.
      </p>
    </div>
    <div class="">
      <div class="relative sm:w-1/2 mx-5 sm:mx-auto">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search minor ailments..."
            class="placeholder:text-slate-400 text-primary-900 border border-primary-100 bg-primary-50 rounded-md px-10 py-2 my-4 w-full focus:outline-primary-800"
          />
          <template v-if="searchQuery.length > 0">
            <button
              @click="clearInput"
              class="absolute right-0 top-1/2 -translate-y-1/2 px-3 text-slate-400 focus:outline-none"
            >
              <Icon
                name="fa6-solid:circle-xmark"
                class=""
                style="width: 1.5rem"
              />
            </button>
          </template>
          <Icon
            name="fa6-solid:magnifying-glass"
            class="text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            style="width: 1.5rem"
          />
        </div>
      </div>
      <!-- Minor Ailments List -->
      <div v-if="filteredAilments.length > 0">
        <ul
          class="text-primary-900 container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5"
        >
          <li
            v-for="ailment in filteredAilments"
            :key="ailment.title"
            class="bg-primary-100 p-5 rounded-lg"
          >
            <h3 class="text-xl font-bold">{{ ailment.title }}</h3>
            <p class="opacity-75 font-light mt-2">{{ ailment.description }}</p>
          </li>
        </ul>
      </div>
      <!-- Display message if no results found -->
      <p
        v-else
        class="text-center py-10 bg-primary-100 sm:rounded-lg font-light text-xl text-primary-900 container mx-auto"
      >
        No matching minor ailments found.
      </p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";
const phoneMain = businessInfo.contact.phone.main;
const email = businessInfo.contact.email;

const searchQuery = ref("");

const clearInput = () => {
  searchQuery.value = "";
};

useSeoMeta({
  title: "Garibaldi Pharmacy | Minor Ailments",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogTitle: "Garibaldi Pharmacy | Minor Ailments",
  ogDescription:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com",
  twitterTitle: "Garibaldi Pharmacy | Minor Ailments",
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
      href: "https://garibaldipharmacy.com/minor-ailments",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

const minorAilments = [
  {
    title: "Birth Control",
    description:
      "Get a prescription for ongoing and emergency contraceptive needs.",
    synonyms: [
      "contraception",
      "contraceptive",
      "pregnancy",
      "condoms",
      "iud",
      "pill",
    ],
  },
  {
    title: "Acne",
    description:
      "Red pimples that often occur on the face, neck, chest, and/or back primarily in teenagers.",
    synonyms: ["pimples", "zits"],
  },
  {
    title: "Bladder Infections",
    description:
      "Bacterial infection in the bladder that causes pain when urinating.",
    synonyms: ["uti"],
  },
  {
    title: "Cold Sores",
    description:
      "A blister that usually forms near the lip and is caused by the herpes simplex virus.",
    synonyms: ["lip sores", "fever blisters"],
  },
  {
    title: "Fungal Infections",
    description:
      "Infections that cause an itchy rash or discoloured toenail. Commonly affect the toenails, groin area, or feet.",
    synonyms: ["athlete's foot", "ringworm"],
  },
  {
    title: "Headaches",
    description: "Continuous pain that affects the head.",
    synonyms: ["migraine", "tension headache"],
  },
  {
    title: "Heartburn",
    description: "A burning sensation in the chest and or throat. ",
    synonyms: ["acid reflux", "indigestion"],
  },
  {
    title: "Hemorrhoids",
    description: "Swollen veins in the anus that may cause pain or discomfort.",
    synonyms: ["piles"],
  },
  {
    title: "Impetigo",
    description:
      "Yellow crusty sores with pus that form on the skin due to a contagious bacterial skin infection.",
    synonyms: ["skin sores"],
  },
  {
    title: "Itching",
    description:
      "Itchy skin from raised welts that be due to an allergic reaction or an insect bite.",
    synonyms: ["skin irritation", "pruritus"],
  },
  {
    title: "Menstrual Pain",
    description: "Cramping pain surrounding a person's menstrual period.",
    synonyms: ["period pain", "dysmenorrhea"],
  },
  {
    title: "Mouth Ulcers",
    description:
      "Small round or oval patches in the mouth or under the tongue that are painful.",
    synonyms: ["canker sores"],
  },
  {
    title: "Pink Eye",
    description:
      "Redness in the eye with possible discharge that may be due to an allergy or due to a bacterial or viral infection.",
    synonyms: ["conjunctivitis"],
  },
  {
    title: "Quitting Smoking",
    description:
      "Nicotine replacement products or medication that can help one to gradually quit smoking cigarettes.",
    synonyms: ["smoking cessation"],
  },
  {
    title: "Seasonal Allergies",
    description:
      "Sneezing or coughing with a runny nose or itchy/watery eyes that is triggered by an allergen. ",
    synonyms: ["hay fever", "allergic rhinitis"],
  },
  {
    title: "Shingles",
    description:
      "A viral disease caused by the same virus as chickenpox that commonly occurs in people over the age of 50. Usually starting as a deep, burning or throbbing pain. ",
    synonyms: ["herpes zoster"],
  },
  {
    title: "Skin Rashes",
    description:
      "Red, irritated, and scaly patches on the skin, which are usually itchy.",
    synonyms: ["dermatitis", "eczema"],
  },
  {
    title: "Sprains and Strains",
    description: "Pain, bruising, and limited movement of a muscle or joint.",
    synonyms: ["muscle injury", "ligament injury"],
  },
  {
    title: "Thrush",
    description:
      "A fungal infection in the mouth with creamy white patches on the tongue or inner cheeks.",
    synonyms: ["oral candidiasis"],
  },
  {
    title: "Upset Stomach",
    description:
      "Discomfort in the upper abdomen, which may include pain, nausea, bloating, and an early feeling of fullness when eating.",
    synonyms: ["dyspepsia", "stomach upset"],
  },
  {
    title: "Worms",
    description:
      "A contagious infection of the intestines by pinworms that cause itching in the anal area, especially at night.",
    synonyms: ["pinworm infection"],
  },
  {
    title: "Yeast Infections",
    description:
      "A fungal infection that affects the vagina and its external skin area, commonly resulting in itch and discharge.",
    synonyms: ["vaginal candidiasis", "thrush"],
  },
];

minorAilments.sort((a, b) => {
  return a.title.localeCompare(b.title);
});

// Filter the minor ailments based on the search query
const filteredAilments = computed(() => {
  return minorAilments.filter((ailment) => {
    const searchTerm = searchQuery.value.toLowerCase();
    return (
      ailment.title.toLowerCase().includes(searchTerm) ||
      ailment.synonyms.some((synonym) =>
        synonym.toLowerCase().includes(searchTerm)
      )
    );
  });
});
</script>

<style scoped>
@media screen and (min-width: 640px) {
  .hero-over-text {
    position: absolute;
    top: 50%;
    right: 2rem;
    transform: translateY(-50%);
    width: 450px;
    max-width: calc(100% - 40px);
    padding: 0;
    margin-top: 0;
  }
}
</style>
