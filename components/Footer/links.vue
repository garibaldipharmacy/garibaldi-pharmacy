<template>
  <div class="flex flex-wrap gap-x-16 gap-y-10 text-sm">
    <div v-for="footerLink in footerLinks">
      <h3 class="mb-4 font-medium">{{ footerLink.title }}</h3>
      <ul class="space-y-3 font-light text-primary-300">
        <li v-for="link in footerLink.links">
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
      { title: "Contact", href: "/contact/" },
      { title: "Transfer", href: "/prescriptions/transfer/" },
      { title: "Refill", href: "/prescriptions/refill/" },
      { title: "Send", href: "/prescriptions/send/" },
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
      { title: "Compounding", href: "/services/compounding/" },
      { title: "Immunizations", href: "/services/immunizations/" },
      { title: "Prescriptions", href: "/prescriptions/" },
      { title: "Minor Ailments", href: "/services/minor-ailments/" },
      { title: "Drug Administration", href: "/services/drug-administration/" },
      { title: "Consultations", href: "/services/consultations/" },
      {
        title: "Point-of-Care Testing",
        href: "/services/point-of-care-testing/",
      },
      { title: "Covid Vaccine", href: "/services/immunizations/" },
    ],
  },
];
</script>
