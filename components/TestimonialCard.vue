<template>
  <div class="shadow rounded-md p-7 bg-white h-full flex flex-col">
    <!-- Star Rating -->
    <div class="flex gap-1 mb-4">
      <Icon
        v-for="star in 5"
        :key="star"
        name="fa6-solid:star"
        class="text-yellow-400 text-sm"
      />
    </div>

    <!-- Review Text -->
    <p class="text-slate-700 font-light text-sm mb-5 flex-grow leading-relaxed whitespace-pre-line">
      "{{ review }}"
    </p>

    <!-- Reviewer Info -->
    <div class="pt-4 border-t border-slate-200">
      <p class="text-primary-900 font-medium text-sm">{{ name }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  name: String,
  review: String,
});
</script>
