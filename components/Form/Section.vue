<template>
  <!-- One numbered step of a form, separated from the last by a hairline -->
  <fieldset
    class="min-w-0 border-t border-primary-900/10 pt-8 first-of-type:border-t-0 first-of-type:pt-0"
  >
    <!-- Floated, or a legend sits on the fieldset's top border -->
    <legend class="float-left w-full">
      <span class="flex items-center gap-3 text-lg font-semibold text-primary-900">
        <span
          aria-hidden="true"
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-900 text-sm text-white"
          >{{ step }}</span
        >
        {{ title }}
      </span>
    </legend>
    <p v-if="description" class="clear-left pt-2 text-sm font-light text-slate-600">
      {{ description }}
    </p>
    <div class="clear-left grid gap-5 pt-6 sm:grid-cols-2">
      <slot />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
defineProps<{
  step: number;
  title: string;
  description?: string;
}>();
</script>
