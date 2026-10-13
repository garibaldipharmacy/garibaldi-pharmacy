<template>
  <!--
    Announced to screen readers and focusable, so a failed submit is never silent.
    `tabindex="-1"` lets the composable move focus here programmatically.
  -->
  <div
    v-if="message"
    ref="region"
    role="status"
    aria-live="polite"
    tabindex="-1"
    class="col-span-2 mx-5 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
  >
    <p class="font-medium">{{ message }}</p>
    <ul v-if="fieldCount" class="mt-2 list-disc list-inside font-light">
      <li v-for="(text, key) in errors" :key="key">{{ text }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string | null;
  errors?: Record<string, string>;
}>();

const region = ref<HTMLElement | null>(null);
const fieldCount = computed(() => Object.keys(props.errors ?? {}).length);

defineExpose({ region });
</script>
