<template>
  <p v-if="message" :id="id" class="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
    <Icon name="fa6-solid:circle-exclamation" aria-hidden="true" class="mt-0.5 shrink-0" />
    {{ message }}
  </p>
</template>

<script setup lang="ts">
defineProps<{ message?: string; id?: string }>();
</script>
