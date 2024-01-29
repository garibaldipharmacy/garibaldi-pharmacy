<template>
  <span
    :class="[
      `text-${theme}-900`,
      `bg-${theme}-100`,
      'rounded-full',
      'inline-flex',
      'items-center',
      'justify-center',
      'h-8',
      'w-8',
    ]"
  >
    <Icon v-if="icon" :name="icon" />
  </span>
</template>

<script lang="ts" setup>
const props = defineProps({
  icon: String,
  theme: {
    type: String,
    default: "primary",
  },
});
</script>

<style></style>
