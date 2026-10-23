<template>
  <!-- A landing page for people searching for a pharmacy in Squamish. It is
       left out of the navigation on purpose; search engines find it through
       the sitemap. Every statement here is already made elsewhere on the
       site, so keep the two in step if one changes -->
  <PageIntro title="Your local pharmacy in Squamish, BC">
    <p>
      Fill and transfer prescriptions, talk to a pharmacist, and get compounded
      medications made right here in town at Garibaldi Pharmacy, with delivery
      throughout Squamish.
    </p>
  </PageIntro>

  <PagePhoto>
    <!-- Cropped to the panel's shapes, so no hidden part of the photo is
         downloaded: wide for larger screens, about 3:2 for phones -->
    <picture>
      <source
        media="(max-width: 639px)"
        srcset="@/assets/images/squamish-pharmacy-front-phone.webp"
        width="824"
        height="550"
      />
      <img
        src="@/assets/images/squamish-pharmacy-front-1440.webp"
        srcset="
          @/assets/images/squamish-pharmacy-front-800.webp   800w,
          @/assets/images/squamish-pharmacy-front-1440.webp 1440w,
          @/assets/images/squamish-pharmacy-front-2400.webp 2400w
        "
        sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
        width="1440"
        height="618"
        fetchpriority="high"
        alt="The entrance to Garibaldi Pharmacy in the Wilfred Building on Dowad Drive in Squamish"
      />
    </picture>
  </PagePhoto>

  <!-- Visit us: the name, address and phone number match the contact page
       and the business listing, which local search compares -->
  <section class="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:pt-20">
    <h2 class="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
      Visit us in Squamish
    </h2>
    <div class="mt-10 grid gap-x-16 text-primary-900 md:grid-cols-3">
      <div v-reveal class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3 class="flex items-center gap-3 text-xl font-medium">
          <Icon name="fa6-solid:location-dot" class="shrink-0 text-lg" />
          Location
        </h3>
        <p class="mt-3 font-light leading-relaxed text-slate-600">
          In the Wilfred Building<br />
          <NuxtLink
            :to="links.google_maps"
            class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
            >{{ address.full }}</NuxtLink
          >
        </p>
      </div>
      <div v-reveal="120" class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3 class="flex items-center gap-3 text-xl font-medium">
          <Icon name="fa6-solid:clock" class="shrink-0 text-lg" />
          Hours
        </h3>
        <p class="mt-3 font-light leading-relaxed text-slate-600">
          Monday to Friday, {{ weekdayHours }}<br />
          Closed weekends and B.C. statutory holidays
        </p>
      </div>
      <div v-reveal="240" class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3 class="flex items-center gap-3 text-xl font-medium">
          <Icon name="fa6-solid:phone" class="shrink-0 text-lg" />
          Call or text
        </h3>
        <p class="mt-3 font-light leading-relaxed text-slate-600">
          <NuxtLink
            :to="`tel:${contact.phone.main}`"
            class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
            >{{ contact.phone.main }}</NuxtLink
          ><br />
          <NuxtLink
            :to="`mailto:${contact.email}`"
            class="font-normal text-primary-700 underline underline-offset-4 [overflow-wrap:anywhere] hover:no-underline"
            >{{ contact.email }}</NuxtLink
          >
        </p>
      </div>
    </div>
  </section>

  <!-- Owned and operated by locals, in the About page's words -->
  <section class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
    <h2 class="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
      Owned and operated by locals
    </h2>
    <div
      class="mt-10 grid gap-x-16 font-light leading-relaxed text-slate-600 md:grid-cols-2"
    >
      <div v-reveal class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <p class="text-lg text-primary-900">
          Garibaldi Pharmacy is Squamish’s first independent pharmacy, owned and
          operated by locals.
        </p>
      </div>
      <div v-reveal="120" class="relative pt-6 pb-10">
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <p>
          We are a full-service pharmacy specializing in
          <NuxtLink to="/services/compounding/" :class="linkClass"
            >compounding</NuxtLink
          >
          with an
          <NuxtLink to="/medical-clinic/" :class="linkClass"
            >in-house medical clinic</NuxtLink
          >, conveniently only a short distance from your home so you always
          have quick access for your health care needs.
        </p>
      </div>
    </div>
  </section>

  <SectionLocalExperts />

  <!-- Services, each linking to its own page -->
  <section class="mx-auto max-w-6xl px-4 pt-10 pb-10 sm:px-6">
    <h2 class="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
      Pharmacy services in Squamish
    </h2>
    <div class="mt-10 grid gap-x-16 text-primary-900 md:grid-cols-2">
      <div
        v-for="(service, index) in services"
        :key="service.title"
        v-reveal="(index % 2) * 120"
        class="relative pt-6 pb-10"
      >
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <h3 class="flex items-center gap-3 text-xl font-medium">
          <Icon :name="service.icon" class="shrink-0 text-lg" />
          <NuxtLink
            v-if="service.link"
            :to="service.link"
            class="underline-offset-4 hover:underline"
            >{{ service.title }}</NuxtLink
          >
          <template v-else>{{ service.title }}</template>
        </h3>
        <p class="mt-3 font-light leading-relaxed text-slate-600">
          <RichText :parts="service.text" :link-class="linkClass" />
        </p>
      </div>
    </div>
  </section>

  <!-- The neighbourhoods and towns we serve, for local search. The list
       lives in constants/business.js, shared with the structured data -->
  <section class="mx-auto max-w-6xl px-4 pt-10 pb-10 sm:px-6">
    <div
      v-reveal
      class="rounded-3xl bg-primary-50 p-8 text-primary-900 sm:p-12"
    >
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Serving Squamish and the Sea to Sky
      </h2>
      <p class="mt-4 max-w-2xl font-light leading-relaxed text-slate-600">
        We’re proud to care for patients from every corner of Squamish and
        beyond, including:
      </p>
      <h3
        class="mt-8 text-sm font-medium uppercase tracking-wider text-primary-700"
      >
        Squamish neighbourhoods
      </h3>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li
          v-for="place in service_area.neighbourhoods"
          :key="place"
          class="rounded-full bg-white px-4 py-1.5 text-sm ring-1 ring-primary-900/5"
        >
          {{ place }}
        </li>
      </ul>
      <h3
        class="mt-8 text-sm font-medium uppercase tracking-wider text-primary-700"
      >
        Across the Sea to Sky
      </h3>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li
          v-for="place in service_area.communities"
          :key="place"
          class="rounded-full bg-white px-4 py-1.5 text-sm ring-1 ring-primary-900/5"
        >
          {{ place }}
        </li>
      </ul>
      <p class="mt-8 font-light text-slate-600">…and more.</p>
    </div>
  </section>

  <!-- Common questions. Shown in full, as search engines only credit
       answers a visitor can see. The same text goes into the structured data
       below -->
  <section class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
    <h2 class="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
      Common questions
    </h2>
    <dl class="mt-10 grid gap-x-16 text-primary-900 md:grid-cols-2">
      <div
        v-for="(faq, index) in faqs"
        :key="faq.question"
        v-reveal="(index % 2) * 120"
        class="relative pt-6 pb-10"
      >
        <span
          aria-hidden="true"
          class="absolute inset-x-0 top-0 h-px bg-primary-900/10"
        />
        <dt class="text-xl font-medium">{{ faq.question }}</dt>
        <dd class="mt-3 font-light leading-relaxed text-slate-600">
          <RichText :parts="faq.answer" :link-class="linkClass" />
        </dd>
      </div>
    </dl>
  </section>

  <!-- To add once confirmed by the pharmacy, then remove this note:
       - Parking at the Wilfred Building -->

  <CallToAction />
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const { address, contact, links, business_hours, service_area } = businessInfo;

const linkClass =
  "font-normal text-primary-700 underline underline-offset-4 hover:no-underline";

// Copy with inline links is written as a list of parts: plain strings, and
// { text, to } for a link. toText() flattens it for the structured data
type Parts = (string | { text: string; to: string })[];
const toText = (parts: Parts) =>
  parts.map((part) => (typeof part === "string" ? part : part.text)).join("");

// "9:00 AM - 6:00 PM" reads as "9:00 AM to 6:00 PM"
const weekdayHours = business_hours.full_week.monday.replace(" - ", " to ");

const services: {
  icon: string;
  title: string;
  link?: string;
  text: Parts;
}[] = [
  {
    icon: "fa6-solid:prescription",
    title: "Prescriptions",
    link: "/prescriptions/",
    text: [
      { text: "Transfer", to: "/prescriptions/transfer/" },
      ", ",
      { text: "refill", to: "/prescriptions/refill/" },
      " or ",
      { text: "send", to: "/prescriptions/send/" },
      " us your prescription using our online forms.",
    ],
  },
  {
    icon: "fa6-solid:mortar-pestle",
    title: "Compounding",
    link: "/services/compounding/",
    text: [
      "Garibaldi Pharmacy is the Sea to Sky’s first compounding pharmacy. Medications that aren’t commercially available are made in-house in our clean room, rather than sent out to the Lower Mainland.",
    ],
  },
  {
    icon: "bx:bxs-injection",
    title: "Immunizations",
    link: "/services/immunizations/",
    text: [
      "Your seasonal flu shot, travel vaccinations, and most other vaccines to prevent certain diseases.",
    ],
  },
  {
    icon: "fa6-solid:hand-holding-medical",
    title: "Minor Ailments",
    link: "/services/minor-ailments/",
    text: [
      "See a pharmacist when you’re experiencing a minor ailment, and get treatment faster than it takes to see a doctor.",
    ],
  },
  {
    icon: "fa6-solid:clipboard-list",
    title: "Consultations & Medication Reviews",
    link: "/services/consultations/",
    text: [
      "One-on-one time with a pharmacist to better understand your medications and get the most benefit from them.",
    ],
  },
  {
    icon: "fa6-solid:prescription-bottle-medical",
    title: "Drug Administration",
    link: "/services/drug-administration/",
    text: [
      "Our pharmacists can administer your medications safely, with personalized care.",
    ],
  },
  {
    icon: "fa6-solid:user-doctor",
    title: "In-House Medical Clinic",
    link: "/medical-clinic/",
    text: [
      "Terra Nova Squamish Clinic, a family practice clinic managed by Terra Nova Medical Group, is right here in the pharmacy.",
    ],
  },
  {
    icon: "fa6-solid:truck",
    title: "Delivery & Compliance Packaging",
    text: [
      "We deliver throughout Squamish, and can arrange your medications into blister or bubble packs so you take the right medication at the right time.",
    ],
  },
];

const faqs: { question: string; answer: Parts }[] = [
  {
    question: "Where is Garibaldi Pharmacy in Squamish?",
    answer: [
      "In the Wilfred Building at ",
      { text: address.full, to: links.google_maps },
      ". Our in-house medical clinic, ",
      { text: "Terra Nova Squamish Clinic", to: "/medical-clinic/" },
      ", is at the same location.",
    ],
  },
  {
    question: "What are the pharmacy’s hours?",
    answer: [
      `We’re open Monday to Friday, ${weekdayHours}, and closed on weekends and B.C. statutory holidays. `,
      { text: "Contact us", to: "/contact/" },
      " by phone, text or email.",
    ],
  },
  {
    question: "Can I transfer my prescription to Garibaldi Pharmacy?",
    answer: [
      "Yes. Fill in our ",
      { text: "online transfer form", to: "/prescriptions/transfer/" },
      " and our pharmacy staff will contact your current pharmacy to transfer your medication. You can also ",
      { text: "request a refill", to: "/prescriptions/refill/" },
      " or ",
      { text: "send us a new prescription", to: "/prescriptions/send/" },
      " online.",
    ],
  },
  {
    question: "Do you deliver in Squamish?",
    answer: [
      "Yes. We deliver throughout Squamish, so your medications can come straight to your home.",
    ],
  },
  {
    question: "Can I get my flu shot at the pharmacy?",
    answer: [
      "Yes. We give ",
      {
        text: "seasonal flu shots, travel vaccinations and most other vaccines",
        to: "/services/immunizations/",
      },
      ". In B.C., pharmacists can give vaccines by injection to anyone 4 years and older.",
    ],
  },
  {
    question: "Do you make compounded medications?",
    answer: [
      "Yes. We’re the Sea to Sky’s first ",
      { text: "compounding pharmacy", to: "/services/compounding/" },
      ", and we make customized medications in-house in our clean room, built to the latest regulatory standards.",
    ],
  },
];

const title = "Pharmacy in Squamish, BC | Garibaldi Pharmacy";
const description =
  "Garibaldi Pharmacy is Squamish's first independent, locally owned pharmacy on Dowad Drive. Prescriptions, compounding, flu shots, minor ailments and delivery throughout Squamish.";
const url = "https://garibaldipharmacy.com/squamish-pharmacy/";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ...shareImages.dog,
  ogUrl: url,
  twitterTitle: title,
  twitterDescription: description,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: url,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

// The pharmacy itself is already described on every page (see schemaOrg in
// nuxt.config.ts); this marks the questions above as an FAQ
useSchemaOrg([
  defineWebPage({ "@type": ["WebPage", "FAQPage"] }),
  ...faqs.map((faq) =>
    defineQuestion({ name: faq.question, acceptedAnswer: toText(faq.answer) }),
  ),
]);
</script>
