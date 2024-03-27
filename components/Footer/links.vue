<template>
  <div
    class="flex bg-primary-930 rounded-lg p-5 gap-5 text-sm flex-wrap w-full md:w-auto"
  >
    <div v-for="footerLink in footerLinks">
      <h4 class="mb-5">{{ footerLink.title }}</h4>
      <ul class="font-light text-primary-300">
        <li v-for="link in footerLink.links" class="mb-3">
          <NuxtLink
            :to="link.href"
            :class="['transition-colors', link.href && 'hover:text-white']"
            >{{ link.title }}</NuxtLink
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
const footerLinks = [
  {
    title: "Prescriptions",
    links: [
      { title: "Contact", href: "/contact" },
      { title: "Transfer", href: "/prescriptions/transfer" },
      { title: "Refill", href: "/prescriptions/refill" },
      { title: "Send", href: "/prescriptions/send" },
    ],
  },
  // {
  //   title: "Home Health & Wellness",
  //   links: [
  //     { title: "Compression stockings", href: "" },
  //     { title: "Breast care", href: "" },
  //     { title: "Ostomy and wound care", href: "" },
  //     { title: "Crutches", href: "" },
  //     { title: "Wheelchairs", href: "" },
  //     { title: "Walkers", href: "" },
  //     { title: "Cast", href: "" },
  //   ],
  // },
  {
    title: "Services",
    links: [
      { title: "Compounding", href: "/services/compounding" },
      { title: "Immunizations", href: "/services/immunizations" },
      { title: "Prescriptions", href: "/prescriptions" },
      { title: "Minor Ailments", href: "/services/minor-ailments" },
      { title: "Drug Administration", href: "/services/drug-administration" },
      { title: "Consultations", href: "/services/consultations" },
      { title: "Covid Vaccine", href: "" },
    ],
  },
];
</script>
