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
    class="flex gap-3 rounded-2xl bg-red-50 p-5 text-red-800 ring-1 ring-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
  >
    <Icon
      name="fa6-solid:triangle-exclamation"
      aria-hidden="true"
      class="mt-0.5 shrink-0 text-lg"
    />
    <div>
      <p class="font-medium">{{ message }}</p>
      <ul v-if="fieldCount" class="mt-2 list-inside list-disc text-sm font-light">
        <li v-for="(text, key) in errors" :key="key">{{ text }}</li>
      </ul>
    </div>
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
