<template>
  <PageIntro title="Minor Ailments">
    <p>
      Pharmacists are the most accessible healthcare provider and are
      therapeutics experts. Take advantage of our pharmacists when you are
      experiencing a minor ailment. You will be able to get treatment faster
      than it takes to see a doctor.
    </p>
  </PageIntro>

  <PagePhoto>
    <img
      src="@/assets/images/minor-ailments-pharmacy-squamish-1440.webp"
      srcset="
        @/assets/images/minor-ailments-pharmacy-squamish-800.webp 800w,
        @/assets/images/minor-ailments-pharmacy-squamish-1440.webp 1440w
      "
      sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
      width="1440"
      height="572"
      fetchpriority="high"
      alt="A healthcare professional listening to a smiling patient's chest with a stethoscope"
    />
  </PagePhoto>

  <!-- Appointment Booking -->
  <section class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
    <div
      v-reveal
      class="grid items-center gap-8 rounded-3xl bg-primary-900 px-6 py-10 text-white sm:px-12 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-12"
    >
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Appointment Booking</h2>
        <div class="mt-5 space-y-4 font-light leading-relaxed text-white/80">
          <p class="text-lg text-white">
            To get assessed and treated, have your BC Health Card ready and book
            an appointment:
          </p>
          <p class="flex gap-3">
            <Icon
              name="fa6-solid:circle-info"
              class="mt-1 shrink-0 text-secondary-400"
            /><span
              >Be sure to select Garibaldi Pharmacy as your clinic to see the
              appointments available.</span
            >
          </p>
          <p>
            Is booking an appointment too complicated, do none of the time
            slots work, or are you in a hurry? No problem. Give us a call at
            <NuxtLink
              :href="`tel:${phoneMain}`"
              class="text-white underline underline-offset-4 hover:no-underline"
              >{{ phoneMain }}</NuxtLink
            >
            or email
            <NuxtLink
              :href="`mailto:${email}`"
              class="break-words text-white underline underline-offset-4 hover:no-underline"
              >{{ email }}</NuxtLink
            >
            and our pharmacist will try to make things work for you.
          </p>
        </div>
      </div>
      <NuxtLink
        to="https://www.bookapharmacist.gov.bc.ca/minorail/s/"
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-7 py-4 font-semibold text-primary-900 transition hover:-translate-y-0.5 hover:shadow-lg"
        >Book Appointment
        <Icon name="fa6-solid:arrow-up-right-from-square" class="text-sm"
      /></NuxtLink>
    </div>
  </section>

  <!-- List of Minor Ailments -->
  <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
    <div class="mx-auto max-w-2xl text-center text-primary-900">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
        List of Minor Ailments
      </h2>
      <div class="mt-4 space-y-3 text-lg font-light text-slate-600">
        <p>
          Our pharmacists can assess and treat the following minor ailments.
          Read the description of each one to see if it matches what you are
          experiencing.
        </p>
        <p>
          Not sure if what you're experiencing is a minor ailment? No problem.
          Our pharmacists can still assess you and refer you to the appropriate
          healthcare provider.
        </p>
      </div>

      <div class="relative mx-auto mt-8 max-w-lg">
        <Icon
          name="fa6-solid:magnifying-glass"
          aria-hidden="true"
          class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          v-model="searchQuery"
          aria-label="Search minor ailments"
          placeholder="Search minor ailments..."
          class="w-full rounded-full border-0 bg-primary-50 py-3.5 pl-12 pr-12 text-primary-900 ring-1 ring-primary-900/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-700 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          v-if="searchQuery.length > 0"
          type="button"
          aria-label="Clear search"
          @click="clearInput"
          class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-primary-100 hover:text-primary-900"
        >
          <Icon name="fa6-solid:circle-xmark" />
        </button>
      </div>
    </div>

    <ul
      v-if="filteredAilments.length > 0"
      class="mt-12 grid gap-x-12 text-primary-900 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li
        v-for="ailment in filteredAilments"
        :key="ailment.title"
        class="relative pt-5 pb-8"
      >
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3 class="text-lg font-semibold">{{ ailment.title }}</h3>
        <p class="mt-2 font-light leading-relaxed text-slate-600">
          {{ ailment.description }}
        </p>
      </li>
    </ul>
    <!-- Display message if no results found -->
    <p
      v-else
      role="status"
      class="mt-12 rounded-3xl bg-primary-50 py-12 text-center text-xl font-light text-primary-900"
    >
      No matching minor ailments found.
    </p>
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
  title: "Garibaldi Pharmacy | Minor Ailment Pharmacy in Squamish",
  description:
    "Get fast treatment for minor ailments at Garibaldi Pharmacy in Squamish. Our expert pharmacists provide accessible care, helping you feel better without waiting to see a doctor.",
  ogTitle: "Garibaldi Pharmacy | Minor Ailment Pharmacy in Squamish",
  ogDescription:
    "Get fast treatment for minor ailments at Garibaldi Pharmacy in Squamish. Our expert pharmacists provide accessible care, helping you feel better without waiting to see a doctor.",
  ...shareImages.dog,
  ogUrl: "https://garibaldipharmacy.com/services/minor-ailments/",
  twitterTitle: "Garibaldi Pharmacy | Minor Ailment Pharmacy in Squamish",
  twitterDescription:
    "Get fast treatment for minor ailments at Garibaldi Pharmacy in Squamish. Our expert pharmacists provide accessible care, helping you feel better without waiting to see a doctor.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/services/minor-ailments/",
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
    synonyms: ["period pain", "dysmenorrhea", "cramps"],
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
    synonyms: ["smoking cessation", "cigarettes"],
  },
  {
    title: "Seasonal Allergies",
    description:
      "Sneezing or coughing with a runny nose or itchy/watery eyes that is triggered by an allergen. ",
    synonyms: [
      "hay fever",
      "allergic rhinitis",
      "runny nose",
      "itchy eyes",
      "sneezing",
    ],
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
      ) ||
      ailment.description.toLowerCase().includes(searchTerm)
    );
  });
});
</script>
