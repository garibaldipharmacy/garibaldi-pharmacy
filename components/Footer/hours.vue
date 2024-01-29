<template>
  <div class="font-light bg-primary-930 rounded-lg p-5 text-sm">
    <h4><Icon name="fa6-solid:clock" class="mr-2" /> Business Hours</h4>
    <ul class="mt-5">
      <li
        v-for="(hour, day) in hours"
        :class="[
          'flex',
          'gap-5',
          'mb-2',
          'capitalize',
          { 'opacity-75': !isCurrentDay(day), 'font-bold': isCurrentDay(day) },
        ]"
        :key="day"
      >
        <span>{{ day }}</span>
        <span class="ml-auto">{{ hour }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { businessInfo } from "~/constants/business";

const hours = businessInfo.business_hours.full_week;

const isCurrentDay = (day) => {
  const currentDayIndex = new Date().getDay();
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return daysOfWeek[currentDayIndex].toLowerCase() === day.toLowerCase();
};
</script>
