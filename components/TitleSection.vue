<template>
  <div class="p-1 sm:w-1/2 mx-auto text-primary-900 title-section">
    <h2 class="text-2xl font-bold text-center">{{ title }}</h2>
    <p class="text-center font-light opacity-80 mt-3">{{ description }}</p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: String,
  description: String,
});
</script>
