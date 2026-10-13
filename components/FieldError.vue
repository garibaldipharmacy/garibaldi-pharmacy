<template>
  <p v-if="message" class="text-xs text-red-700 mt-1">{{ message }}</p>
</template>

<script setup lang="ts">
defineProps<{ message?: string }>();
</script>
