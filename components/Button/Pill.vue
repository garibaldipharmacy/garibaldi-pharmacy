<template>
  <NuxtLink
    :class="[
      'py-4',
      'px-5',
      'shadow-lg',
      `text-primary-900`,
      'inline-flex',
      'items-center',
      'rounded-md',
      'bg-white',
      'hover:shadow-xl',
      'hover:-translate-y-1',
      'transition-all',
    ]"
  >
    <CircleIcon
      :icon="icon"
      :bgColor="bgColor"
      :iconColor="iconColor"
      class="mr-3"
    />
    <slot />
    <Icon v-if="showArrow" class="ml-auto" name="fa6-solid:angle-right" />
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
