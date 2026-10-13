<template>
  <fieldset class="col-span-2 px-5">
    <legend class="flex mb-2 text-sm font-medium text-gray-900">
      {{ legend }}
      <Icon
        v-if="required"
        name="fa6-solid:asterisk"
        class="text-red-600 text-xs ml-1"
      />
    </legend>

    <p v-if="hint" class="text-sm font-light mb-3 text-gray-600">{{ hint }}</p>

    <ul class="space-y-4">
      <li
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="border border-primary-100 rounded p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-900">
            {{ itemLabel }} {{ rowIndex + 1 }}
          </span>
          <button
            v-if="rows.length > minRows"
            type="button"
            class="text-sm font-light text-gray-600 hover:text-red-700 transition-colors"
            @click="removeRow(rowIndex)"
          >
            <Icon name="fa6-solid:xmark" class="mr-1" />
            Remove
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="field in fields" :key="field.key">
            <label
              :for="inputId(rowIndex, field.key)"
              class="flex mb-1 text-sm font-light text-gray-900"
            >
              {{ field.label }}
              <Icon
                v-if="field.required"
                name="fa6-solid:asterisk"
                class="text-red-600 text-xs ml-1"
              />
            </label>

            <p v-if="field.hint" class="text-xs font-light text-gray-500 mb-1">
              {{ field.hint }}
            </p>

            <input
              :id="inputId(rowIndex, field.key)"
              type="file"
              :accept="accept"
              :aria-describedby="
                errorFor(rowIndex, field.key) ? errorId(rowIndex, field.key) : undefined
              "
              :aria-invalid="errorFor(rowIndex, field.key) ? 'true' : undefined"
              class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 file:mr-3 file:rounded file:border-0 file:bg-primary-900 file:px-3 file:py-1 file:text-white"
              @change="onSelect(rowIndex, field.key, $event)"
            />

            <p
              v-if="row[field.key]"
              class="text-xs font-light text-gray-600 mt-1"
            >
              {{ row[field.key]!.name }} ({{ humanSize(row[field.key]!.size) }})
            </p>

            <p
              v-if="errorFor(rowIndex, field.key)"
              :id="errorId(rowIndex, field.key)"
              class="text-xs text-red-700 mt-1"
            >
              {{ errorFor(rowIndex, field.key) }}
            </p>
          </div>
        </div>
      </li>
    </ul>

    <div class="mt-4">
      <button
        type="button"
        :disabled="atMax"
        class="text-sm rounded border border-primary-900 text-primary-900 py-2 px-4 hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        @click="addRow"
      >
        <Icon name="fa6-solid:plus" class="mr-2" />
        {{ addLabel }}
      </button>

      <!-- Say why the button is disabled rather than letting it silently do nothing. -->
      <p v-if="atMax" class="text-xs font-light text-gray-600 mt-2">
        You can attach up to {{ max }} {{ max === 1 ? itemLabel.toLowerCase() : pluralLabel }}.
        Call us at 604-848-7059 if you need to send more.
      </p>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ACCEPT_ATTRIBUTE } from "~~/shared/forms";

export interface RepeaterField {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export type RepeaterRow = Record<string, File | null>;

const props = withDefaults(
  defineProps<{
    modelValue: RepeaterRow[];
    fields: RepeaterField[];
    max: number;
    legend: string;
    itemLabel: string;
    pluralLabel: string;
    addLabel: string;
    hint?: string;
    required?: boolean;
    minRows?: number;
    /** Keyed `prefix.<rowIndex>.<fieldKey>` so server errors can target one input. */
    errorPrefix?: string;
    errors?: Record<string, string>;
  }>(),
  { minRows: 1, required: false, errors: () => ({}) },
);

const emit = defineEmits<{ "update:modelValue": [RepeaterRow[]] }>();

const accept = ACCEPT_ATTRIBUTE;

const rows = computed(() => props.modelValue);
const atMax = computed(() => rows.value.length >= props.max);

function emptyRow(): RepeaterRow {
  return Object.fromEntries(props.fields.map((f) => [f.key, null]));
}

function addRow() {
  if (atMax.value) return;
  emit("update:modelValue", [...rows.value, emptyRow()]);
}

function removeRow(index: number) {
  const next = rows.value.filter((_, i) => i !== index);
  // An optional group (minRows 0) may go back to showing nothing at all.
  emit("update:modelValue", next.length >= props.minRows ? next : [emptyRow()]);
}

function onSelect(index: number, key: string, event: Event) {
  const input = event.target as HTMLInputElement;
  const next = rows.value.map((row, i) =>
    i === index ? { ...row, [key]: input.files?.[0] ?? null } : { ...row },
  );
  emit("update:modelValue", next);
}

function inputId(index: number, key: string): string {
  return `${props.errorPrefix ?? "file"}-${index}-${key}`;
}

function errorId(index: number, key: string): string {
  return `${inputId(index, key)}-error`;
}

function errorFor(index: number, key: string): string | undefined {
  return props.errors?.[`${props.errorPrefix}.${index}.${key}`];
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Required groups open with a row so the form does not look empty. Optional
// groups open with none, so the add button is the only thing on screen and the
// group reads as "only if you have one".
onMounted(() => {
  if (rows.value.length < props.minRows) emit("update:modelValue", [emptyRow()]);
});
</script>
