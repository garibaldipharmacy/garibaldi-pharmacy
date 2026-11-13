<template>
  <!-- The same question on all three prescription forms. One choice, required,
       so nothing is selected until the patient picks -->
  <FormChoice
    id="notify_by"
    :model-value="modelValue"
    label="How do you want to be notified when your prescription is ready for pick up?"
    :options="options"
    :error="error"
    class="sm:col-span-2"
    @update:model-value="(value) => emit('update:modelValue', value as NotifyMethod)"
  />
</template>

<script setup lang="ts">
import { NOTIFY_METHODS, type NotifyMethod } from "~~/shared/forms";

defineProps<{ modelValue: NotifyMethod | null; error?: string }>();

const emit = defineEmits<{ "update:modelValue": [NotifyMethod] }>();

const ICONS: Record<NotifyMethod, string> = {
  call: "fa6-solid:phone",
  text: "fa6-solid:comment-sms",
  email: "fa6-solid:envelope",
};

const options = (Object.keys(NOTIFY_METHODS) as NotifyMethod[]).map((value) => ({
  value,
  label: NOTIFY_METHODS[value],
  icon: ICONS[value],
}));
</script>
