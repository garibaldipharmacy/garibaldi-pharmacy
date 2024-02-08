<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div
      class="bg-primary-100 text-primary-900 container mx-auto rounded my-10 p-10"
    >
      <h1 class="text-3xl font-bold">Oops! That page doesn't exist.</h1>
      <button
        @click="handleError"
        class="text-2xl mt-5 hover:text-secondary-900 transition-colors"
      >
        Return to home
      </button>
    </div>
    <Footer class="mt-auto" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: "/" });

console.dir(props.error);
</script>
