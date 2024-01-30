<template>
  <NuxtLink
    :class="[
      'px-2',
      'py-1',
      'bg-primary-100',
      `text-primary-900`,
      'rounded-md',
      'inline-block',
      'font-light',
      'text-xs',
      'bg-white',
      'hover:text-primary-100',
      'hover:bg-primary-900',
      'transition-colors',
    ]"
    ><slot />
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

const bgColor = ref("bg-primary-100");
const iconColor = ref("text-primary-900");

if (props.theme === "secondary") {
  bgColor.value = "bg-secondary-100";
  iconColor.value = "text-secondary-900";
}
</script>
