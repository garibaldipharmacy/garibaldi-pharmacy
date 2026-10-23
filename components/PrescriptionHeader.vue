<template>
  <header v-if="currentHeaderItem" class="mt-10 text-primary-900 sm:mt-14">
    <h1
      class="motion-rise flex items-center gap-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
    >
      <span
        aria-hidden="true"
        class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-100 text-xl text-secondary-900 sm:h-14 sm:w-14 sm:text-2xl"
      >
        <Icon :name="currentHeaderItem.icon" />
      </span>
      {{ currentHeaderItem.title }}
    </h1>
    <p
      class="motion-rise mt-5 text-lg font-light text-slate-600 [animation-delay:150ms]"
    >
      {{ currentHeaderItem.description }}
    </p>
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
    link: "/prescriptions/send/",
    description:
      "If you were given a paper prescription by your doctor, you may send it to us electronically so we can prepare it in advance and reduce your wait time.",
  },
  {
    name: "prescriptions-transfer",
    icon: "fa6-solid:paper-plane",
    title: "Transfer Prescription",
    link: "/prescriptions/transfer/",
    description:
      "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  },
  {
    name: "prescriptions-refill",
    icon: "fa6-solid:prescription-bottle",
    title: "Refill Prescription",
    link: "/prescriptions/refill/",
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
