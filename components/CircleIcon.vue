<template>
  <span
    :class="[
      iconColor,
      bgColor,
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
  bgColor: {
    type: String,
    default: "bg-primary-100",
  },
  iconColor: {
    type: String,
    default: "text-primary-900",
  },
});
</script>
