<template>
  <div class="flex bg-primary-930 rounded-lg p-5 gap-5 text-sm">
    <div v-for="footerLink in footerLinks">
      <h4 class="mb-5">{{ footerLink.title }}</h4>
      <ul class="font-light text-primary-300">
        <li v-for="link in footerLink.links" class="mb-3">
          <NuxtLink
            :to="link.href"
            class="hover:text-white transition-colors"
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
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Blog", href: "/blog" },
      { title: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Home Health & Wellness",
    links: [
      { title: "Compression stockings", href: "#" },
      { title: "Breast care", href: "#" },
      { title: "Ostomy and wound care", href: "#" },
      { title: "Crutches", href: "#" },
      { title: "Wheelchairs", href: "#" },
      { title: "Walkers", href: "#" },
      { title: "Cast", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { title: "Compounding", href: "#" },
      { title: "Covid Vaccine", href: "#" },
      { title: "One on one counselling", href: "#" },
      { title: "Injectable injection administration", href: "#" },
      { title: "Immunizations", href: "#" },
      { title: "Prescriptions", href: "#" },
      { title: "Minor conditions", href: "#" },
    ],
  },
];
</script>
