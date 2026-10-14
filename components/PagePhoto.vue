<template>
  <!-- A page's lead photo as a rounded panel. Every page crops its photo to
     the same wide shape, taller on phones so it isn't a thin strip. Put an
     <img> (or a <picture>) in the default slot and an optional credit link
     in the credit slot -->
  <section class="mx-auto max-w-6xl px-4 sm:px-6">
    <div class="page-photo relative overflow-hidden rounded-3xl">
      <slot />
      <div
        v-if="$slots.credit"
        class="absolute bottom-3 right-3 sm:bottom-4 sm:right-4"
      >
        <slot name="credit" />
      </div>
    </div>
  </section>
</template>
