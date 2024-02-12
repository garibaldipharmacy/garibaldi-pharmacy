<template>
  <nav>
    <ul
      class="flex bg-primary-100 p-5 text-primary-900 border-b-2 flex-wrap gap-10 sm:gap-0"
    >
      <li v-for="link in navItems">
        <NuxtLink
          :class="[
            'p-5',
            'hover:border-primary-400',
            'hover:border-b-4',
            'hover-bg-primary-200',
            activeClass(link?.name),
          ]"
          :to="link?.link"
        >
          <Icon class="mr-3" :name="link?.icon" />
          <span>{{ link?.text }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router"; // required since we are using outside of <NuxtPage />

const route = useRoute();
const navItems = ref([
  {
    name: "prescriptions-transfer",
    icon: "fa6-solid:paper-plane",
    text: "Transfer Prescription",
    link: "/prescriptions/transfer",
  },
  {
    name: "prescriptions-refill",
    icon: "fa6-solid:prescription-bottle",
    text: "Refill Prescription",
    link: "/prescriptions/refill",
  },
  {
    name: "prescriptions-send",
    icon: "fa6-solid:prescription",
    text: "Send Prescription",
    link: "/prescriptions/send",
  },
]);

const activeClass = (name: string) => {
  return route.name === name
    ? "border-primary-900 bg-primary-200 border-b-4"
    : "";
};
</script>
