<template>
  <header
    class="bg-white header-lower flex flex-wrap items-center p-5 shadow-lg z-50 gap-5"
  >
    <div class="logo w-1/3 sm:w-auto">
      <NuxtLink to="/">
        <img
          src="@/assets/images/logostyles/logo-wide.svg"
          alt="Garibaldi Pharmacy and Compounding Lab logo"
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

const links = ref<HeaderNavLink[]>([
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About",
    link: "/about",
  },
  {
    title: "Compounding",
    link: "/services/compounding",
  },
  {
    title: "Pharmacy Services",
    link: "#",
    expanded: true,
    children: [
      {
        title: "Prescriptions",
        link: "/prescriptions",
        icon: "fa6-solid:prescription",
      },
      {
        title: "Minor Ailments",
        link: "/services/minor-ailments",
        icon: "fa6-solid:hand-holding-medical",
      },
      {
        title: "Immunizations",
        link: "/services/immunizations",
        icon: "medical-icon:i-immunizations",
      },
    ],
  },
  {
    title: "Medical Clinic",
    link: "/medical-clinic",
  },
]);
</script>

<style scoped></style>
