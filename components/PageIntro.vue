<template>
  <!-- A page's opening heading, with its introduction beside it on wide
       screens. Without an introduction the heading spans the width -->
  <section class="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 lg:pt-24 lg:pb-16">
    <AnnouncementPill variant="light" />
    <div
      class="grid items-end gap-6 text-primary-900 lg:grid-cols-2 lg:gap-16"
    >
      <h1
        :class="[
          'motion-rise text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl',
          { 'max-w-3xl lg:col-span-2': !$slots.default },
        ]"
      >
        {{ title }}
      </h1>
      <div
        v-if="$slots.default"
        class="motion-rise space-y-4 text-lg font-light text-slate-600 [animation-delay:150ms] sm:text-xl"
      >
        <slot />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
