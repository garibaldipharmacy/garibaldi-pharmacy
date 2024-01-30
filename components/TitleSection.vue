<template>
  <div class="w-1/2 mx-auto">
    <h2 class="text-2xl font-bold text-center">{{ title }}</h2>
    <p class="text-center font-light opacity-80">{{ description }}</p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: String,
  description: String,
});
</script>
