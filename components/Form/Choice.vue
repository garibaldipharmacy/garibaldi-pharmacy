<template>
  <!-- A small set of choices: a pill toggle, or side-by-side cards when the
       options carry a description. Still a radio group underneath, so arrow
       keys and screen readers work as for any set of radio buttons -->
  <RadioGroup
    :id="id"
    :model-value="modelValue"
    :aria-invalid="error ? 'true' : undefined"
    :aria-describedby="error ? `${id}-error` : undefined"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <RadioGroupLabel class="form-label">{{ label }}</RadioGroupLabel>

    <div v-if="asCards" class="grid gap-3 sm:grid-cols-2">
      <RadioGroupOption
        v-for="option in options"
        :key="String(option.value)"
        v-slot="{ checked }"
        :value="option.value"
        class="cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
      >
        <span
          :class="[
            'flex h-full gap-4 rounded-2xl bg-white p-4 shadow-sm transition',
            checked
              ? 'ring-2 ring-primary-700'
              : 'ring-1 ring-primary-900/20 hover:ring-primary-900/30',
          ]"
        >
          <span
            aria-hidden="true"
            :class="[
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
              checked ? 'bg-primary-900 text-white' : 'bg-primary-100 text-primary-900',
            ]"
          >
            <Icon :name="checked ? 'fa6-solid:check' : option.icon || 'fa6-regular:circle'" />
          </span>
          <span>
            <span class="block font-medium text-primary-900">{{ option.label }}</span>
            <span class="mt-0.5 block text-sm font-light text-slate-600">{{
              option.description
            }}</span>
          </span>
        </span>
      </RadioGroupOption>
    </div>

    <div
      v-else
      class="inline-flex w-full gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-primary-900/20 sm:w-auto"
    >
      <RadioGroupOption
        v-for="option in options"
        :key="String(option.value)"
        v-slot="{ checked }"
        :value="option.value"
        class="flex-1 cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 sm:flex-none"
      >
        <span
          :class="[
            // Icon above the label on phones, so three options fit a narrow
            // screen without stretching the form wider than it
            'flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-xl px-2 py-2.5 font-medium transition sm:flex-row sm:gap-2 sm:px-6',
            checked
              ? 'bg-primary-900 text-white shadow'
              : 'text-slate-600 hover:bg-primary-50 hover:text-primary-900',
          ]"
        >
          <Icon v-if="option.icon" :name="option.icon" aria-hidden="true" />
          <span>{{ option.label }}</span>
        </span>
      </RadioGroupOption>
    </div>

    <FieldError v-if="id" :id="`${id}-error`" :message="error" />
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";

const props = defineProps<{
  modelValue: unknown;
  label: string;
  // Both needed for an error to be shown and announced
  id?: string;
  error?: string;
  options: {
    value: unknown;
    label: string;
    icon?: string;
    description?: string;
  }[];
}>();

const emit = defineEmits<{ "update:modelValue": [unknown] }>();

const asCards = computed(() => props.options.some((o) => o.description));
</script>
