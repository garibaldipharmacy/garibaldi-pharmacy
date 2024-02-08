<template>
  <header
    v-if="currentHeaderItem"
    class="bg-secondary-100 p-10 md:p-20 text-secondary-900"
  >
    <div class="flex text-3xl font-bold">
      <Icon :name="currentHeaderItem.icon" class="mr-3" />
      <h1>{{ currentHeaderItem.title }}</h1>
    </div>
    <p class="md:w-1/2 font-light mt-3">{{ currentHeaderItem.description }}</p>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router"; // required since we are using outside of <NuxtPage />

const router = useRoute();

const headerItems = ref([
  {
    name: "prescriptions-send",
    icon: "fa6-solid:prescription",
    title: "Send Prescription",
    link: "/prescriptions/send",
    description:
      "If you were given a paper prescription by your doctor, you may send it to us electronically so we can prepare it in advance and reduce your wait time.",
  },
  {
    name: "prescriptions-transfer",
    icon: "fa6-solid:paper-plane",
    title: "Transfer Prescription",
    link: "/prescriptions/transfer",
    description:
      "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  },
  {
    name: "prescriptions-refill",
    icon: "fa6-solid:prescription-bottle",
    title: "Refill Prescription",
    link: "/prescriptions/refill",
    description:
      "By completing the form below, the information will be provided to our pharmacy staff to confirm and refill your prescription.",
  },
]);

let currentHeaderItem = ref({ name: "", icon: "", title: "", description: "" });
currentHeaderItem = computed(() => {
  const routeName = router.name;
  return headerItems.value.find((item) => item.name === routeName) || null;
});
</script>
