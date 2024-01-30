<template>
  <!-- Hero Section -->
  <section class="landing-hero-section py-40">
    <div class="text-white px-20">
      <h1 class="text-3xl font-bold w-2/5">
        Discover personalized medicine and accessible healthcare at its best
      </h1>
      <p class="font-light text-xl w-1/3">
        We are dedicated to improving the health and wellness of Squamish
      </p>
    </div>
  </section>

  <!-- Navigation / Appointments -->
  <section class="container mx-auto">
    <nav>
      <ul class="flex p-3 gap-2 -mt-16 mb-10">
        <li class="flex-1">
          <AppointmentCard />
        </li>
        <div class="flex gap-2 pill-buttons content-center flex-wrap basis-3/6">
          <li>
            <ButtonPill
              to="https://garibaldipharmacy.com"
              icon="fa6-solid:phone"
            >
              Call or Text Us
            </ButtonPill>
          </li>

          <li>
            <ButtonPill
              to="https://garibaldipharmacy.com"
              icon="fa6-solid:paper-plane"
              theme="secondary"
            >
              Transfer Prescription
            </ButtonPill>
          </li>

          <li>
            <ButtonPill
              to="https://garibaldipharmacy.com"
              icon="fa6-solid:prescription-bottle"
            >
              Refill Medications
            </ButtonPill>
          </li>

          <li>
            <ButtonPill
              to="https://garibaldipharmacy.com"
              icon="fa6-solid:prescription"
              theme="secondary"
            >
              Send Prescription
            </ButtonPill>
          </li>
        </div>
      </ul>
    </nav>
  </section>

  <!-- Services -->
  <section class="container mx-auto services-section">
    <TitleSection
      title="Services"
      description="Discover our range of services designed for your wellness. From prescription refills to health consultations, we're here to support you."
    />
    <div class="px-4 my-10 flex gap-5 py-5">
      <BorderedCard
        v-for="card in serviceCards"
        :icon="card.icon"
        :title="card.title"
        :description="card.description"
        class="flex-1"
      />
    </div>
    <NuxtLink
      to="/services"
      class="mx-auto text-center block mb-10 text-slate-500 hover:text-slate-800 transition-colors"
      >View all our service offerings
      <Icon class="ml-3" name="fa6-solid:arrow-right-long"
    /></NuxtLink>
  </section>

  <!-- Why Us -->
  <SectionWhyUs />

  <!-- CTA -->
  <CallToAction />
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Garibaldi Pharmacy | Home",
  description:
    "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
});

const serviceCards = [
  {
    icon: "fa6-solid:truck",
    title: "Delivery",
    description:
      "We provide free delivery throughout Squamish. Have your medications delivered straight to the comfort of your own home.",
  },
  {
    icon: "healthicons:blister-pills-round-x4",
    title: "Compliance Packaging",
    description:
      "Elit in et ipsum nisi enim enim laboris nostrud ea velit duis dolore sunt ex. Eiusmod enim Lorem id in magna nisi qui aliqua cillum pariatur dolore.",
  },
  {
    icon: "fa6-solid:clipboard-list",
    title: "Medication Reviews",
    description:
      "Elit in et ipsum nisi enim enim laboris nostrud ea velit duis dolore sunt ex. Eiusmod enim Lorem id in magna nisi qui aliqua cillum pariatur dolore.",
  },
  {
    icon: "bx:bxs-injection",
    title: "Vaccines & Immunizations",
    description:
      "Elit in et ipsum nisi enim enim laboris nostrud ea velit duis dolore sunt ex. Eiusmod enim Lorem id in magna nisi qui aliqua cillum pariatur dolore.",
  },
];
</script>

<style scoped>
.pill-buttons li {
  flex: 1 1 33%;
}

.pill-buttons li a {
  width: 100%;
}
</style>
