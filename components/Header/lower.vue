<template>
  <header
    class="bg-white header-lower flex flex-wrap items-center p-5 shadow-lg z-50 gap-5"
  >
    <div class="logo w-1/3 sm:w-auto">
      <NuxtLink to="/">
        <img
          src="@/assets/images/logostyles/logo-wide.svg"
          alt="Garibaldi Pharmacy and Compounding Lab logo"
          width="172"
          height="50"
        />
      </NuxtLink>
    </div>

    <Nav :links="links" class="hidden lg:flex" />
    <NavMobile :links="links" class="lg:hidden" />
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { HeaderNavLink } from "@/types/HeaderNavLink.interface";
import { prescriptionActions } from "@/constants/prescriptionActions";

const links = ref<HeaderNavLink[]>([
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About",
    link: "/about/",
  },
  {
    title: "Compounding",
    link: "/services/compounding/",
  },
  {
    title: "Pharmacy Services",
    cta: {
      text: "Moving from another pharmacy?",
      linkText: "Transfer a prescription",
      link: "/prescriptions/transfer/",
    },
    children: [
      {
        title: "Prescriptions",
        link: "/prescriptions/",
        icon: "fa6-solid:prescription",
        description: "Transfer, refill or send a prescription",
      },
      {
        title: "Minor Ailments",
        link: "/services/minor-ailments/",
        icon: "fa6-solid:hand-holding-medical",
        description: "Treat common conditions without seeing a doctor",
      },
      {
        title: "Immunizations",
        link: "/services/immunizations/",
        icon: "medical-icon:i-immunizations",
        description: "Vaccinations given by our pharmacists",
      },
      {
        title: "Drug Administration",
        link: "/services/drug-administration/",
        icon: "fa6-solid:prescription-bottle-medical",
        description: "Have a pharmacist administer your medication",
      },
      {
        title: "Consultations",
        link: "/services/consultations/",
        icon: "fa6-solid:user-doctor",
        description: "One-on-one health advice and medication reviews",
      },
      {
        title: "Point-of-Care Testing",
        link: "/services/point-of-care-testing/",
        icon: "solar:test-tube-bold",
        description: "Quick health checks done right at the pharmacy",
      },
    ],
  },
  {
    title: "Prescriptions",
    mobileOnly: true,
    children: prescriptionActions.map(({ title, link, icon, theme }) => ({
      title,
      link,
      icon,
      theme,
    })),
  },
  {
    title: "Medical Clinic",
    link: "/medical-clinic/",
  },
  {
    title: "Contact",
    link: "/contact/",
    variant: "button",
  },
]);
</script>

<style scoped></style>
