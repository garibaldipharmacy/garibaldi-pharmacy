<template>
  <!-- One of the prescription or contact actions: an icon that moves like
       the thing it shows when hovered (clipped to its circle, so it can
       leave through the edge), a label and an arrow. A link when given
       `to`, otherwise a button that emits click -->
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    class="group flex h-full w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-4 font-medium text-primary-900 transition-colors hover:bg-primary-50"
  >
    <CircleIcon
      :icon="icon"
      :class="['h-10 w-10 shrink-0 overflow-hidden', iconMotion(icon)]"
      v-bind="theme === 'secondary' ? secondaryColours : {}"
    />
    <span>{{ title }}</span>
    <Icon
      class="ml-auto text-sm text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-900"
      name="fa6-solid:arrow-right"
    />
  </component>
</template>

<script lang="ts" setup>
import { iconMotion } from "~/constants/iconMotions";

defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  to: String,
  // Icon colour scheme, matching the prescription actions
  theme: {
    type: String,
    default: "primary",
  },
});

const NuxtLink = resolveComponent("NuxtLink");

const secondaryColours = {
  bgColor: "bg-secondary-100",
  iconColor: "text-secondary-900",
};
</script>
