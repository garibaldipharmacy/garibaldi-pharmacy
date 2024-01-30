<template>
  <div class="shadow-md border-primary-900 border-t-8 rounded-md p-7">
    <CircleIcon :icon="icon" class="scale-150 mb-5" />
    <h3 class="text-xl font-medium text-primary-900">{{ title }}</h3>
    <p class="text-slate-600 font-light text-sm mt-5">
      {{ description }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  icon: String,
  title: String,
  description: String,
});
</script>
