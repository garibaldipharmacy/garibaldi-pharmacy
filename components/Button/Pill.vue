<template>
  <NuxtLink
    :class="[
      'py-3',
      'px-5',
      'shadow-xl',
      `text-primary-900`,
      'inline-flex',
      'items-center',
      'rounded-md',
      'bg-white',
      'hover:shadow-2xl',
      'hover:scale-110',
      'transition-all',
    ]"
  >
    <CircleIcon :icon="icon" :theme="theme" class="mr-3" />
    <slot />
    <Icon v-if="showArrow" class="ml-5" name="fa6-solid:angle-right" />
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps({
  icon: String,
  theme: {
    type: String,
    default: "primary",
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
});
</script>
