<template>
  <div class="bg-white text-primary-900 rounded-md shadow-lg p-2">
    <div class="flex items-center p-4">
      <CircleIcon icon="fa6-solid:calendar" />
      <span class="ml-3 text-xl">Book an Appointment</span>
      <span class="font-light text-sm ml-auto opacity-75"
        >Select an appointment type below</span
      >
    </div>

    <div class="px-3 py-4 flex gap-2 border-t-2 border-primary-100">
      <ButtonBadge
        v-for="option in appointmentOptions"
        :to="option.link"
        :title="option.title"
      >
        {{ option.title }}
      </ButtonBadge>
    </div>
  </div>
</template>

<script lang="ts" setup>
const appointmentOptions = [
  {
    title: "Minor Ailments",
    link: "#",
  },
  {
    title: "Flu/Covid Shots",
    link: "#",
  },
  {
    title: "Travel Consult",
    link: "#",
  },
  {
    title: "Medication Review",
    link: "#",
  },
  {
    title: "Other Vaccinations",
    link: "#",
  },
];
</script>
