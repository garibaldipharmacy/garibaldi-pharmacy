<template>
  <div
    class="font-light bg-primary-930 rounded-lg p-5 text-sm w-full md:w-auto"
  >
    <h4 class="font-bold">
      <Icon name="fa6-solid:clock" class="mr-2" /> Business Hours
    </h4>

    <ul class="mt-5">
      <li
        v-for="(hour, day) in hours"
        :key="day"
        :class="[
          'flex',
          'gap-5',
          'mb-2',
          'capitalize',
          'opacity-75',
          'text-primary-300',
          { 'is-current-day': isCurrentDay(day) },
        ]"
      >
        <span>{{ day }}</span>
        <span class="ml-auto">{{ hour }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { businessInfo } from "~/constants/business";

const hours = businessInfo.business_hours.full_week;
const currentDay = ref<string | null>(null);

const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

onMounted(() => {
  const now = new Date();
  const dayIndex = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Vancouver" })
  ).getDay();
  currentDay.value = daysOfWeek[dayIndex];
});

const isCurrentDay = (day: string) => {
  return currentDay.value?.toLowerCase() === day.toLowerCase();
};
</script>

<style scoped>
.is-current-day {
  font-weight: bold;
  color: white;
  opacity: 1 !important;
}
</style>
