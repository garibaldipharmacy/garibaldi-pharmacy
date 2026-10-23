<template>
  <div
    class="w-full self-start rounded-2xl bg-primary-930 p-6 text-sm font-light lg:w-72"
  >
    <h3 class="flex items-center font-medium">
      <Icon name="fa6-solid:clock" class="mr-2 text-xs text-primary-300" />
      Business Hours
    </h3>

    <ul class="mt-4">
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
const { hours, today } = useStoreHours();

const isCurrentDay = (day: string) => today.value === day;
</script>

<style scoped>
.is-current-day {
  font-weight: bold;
  color: white;
  opacity: 1 !important;
}
</style>
