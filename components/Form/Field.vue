<template>
  <!-- A labelled form field. The input goes in the default slot and binds
       the slot's `field` props, which connect it to its hint and error so
       screen readers announce them and an invalid field is marked as such:

         <FormField id="email" label="Email" :error="fieldError('email')" v-slot="{ field }">
           <input v-bind="field" v-model="email" class="form-input" required />
         </FormField> -->
  <div>
    <label :for="id" class="form-label">
      {{ label
      }}<span v-if="optional" class="font-light text-slate-600"> (optional)</span>
    </label>
    <p v-if="hint" :id="`${id}-hint`" class="form-hint">{{ hint }}</p>
    <slot :field="field" />
    <FieldError :id="`${id}-error`" :message="error" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string;
  label: string;
  hint?: string;
  error?: string;
  // Required is the default; the few optional fields say so instead of every
  // required one carrying a marker
  optional?: boolean;
}>();

const field = computed(() => ({
  id: props.id,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  "aria-describedby":
    [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`]
      .filter(Boolean)
      .join(" ") || undefined,
}));
</script>
