<template>
  <!-- min-w-0: fieldsets otherwise refuse to shrink below their content, so a
       long file name would push the card past the edge on phones -->
  <fieldset class="min-w-0 sm:col-span-2">
    <!-- Hidden visually when a form section's heading already names it -->
    <legend :class="hideLegend ? 'sr-only' : 'form-label'">
      {{ legend }}
    </legend>

    <p v-if="hint" class="form-hint">{{ hint }}</p>

    <ul class="space-y-3">
      <li
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-900/10 sm:p-5"
      >
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-primary-900">
            {{ itemLabel }} {{ rowIndex + 1 }}
          </span>
          <button
            v-if="rows.length > minRows"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-light text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
            @click="removeRow(rowIndex)"
          >
            <Icon name="fa6-solid:xmark" aria-hidden="true" />
            Remove
          </button>
        </div>

        <div :class="['grid gap-3', { 'sm:grid-cols-2': fields.length > 1 }]">
          <!-- min-w-0: a grid item otherwise grows to fit a long file name -->
          <div v-for="field in fields" :key="field.key" class="min-w-0">
            <p
              v-if="fields.length > 1"
              :id="labelId(rowIndex, field.key)"
              class="mb-1.5 text-sm font-medium text-primary-900"
            >
              {{ field.label }}
            </p>
            <!-- The whole zone is the file input's label, so tapping anywhere
                 opens the camera or file picker. Files can also be dropped
                 onto it -->
            <label
              :for="inputId(rowIndex, field.key)"
              :class="[
                'flex min-h-[5.5rem] cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors focus-within:ring-2 focus-within:ring-primary-700',
                dragging === inputId(rowIndex, field.key)
                  ? 'border-primary-700 bg-primary-50'
                  : errorFor(rowIndex, field.key)
                    ? 'border-red-400 bg-red-50/50'
                    : row[field.key]
                      ? 'border-transparent bg-primary-50'
                      : 'border-primary-900/20 hover:border-primary-700 hover:bg-primary-50/60',
              ]"
              @dragover.prevent="dragging = inputId(rowIndex, field.key)"
              @dragleave="dragging = null"
              @drop.prevent="onDrop(rowIndex, field.key, $event)"
            >
              <input
                :id="inputId(rowIndex, field.key)"
                type="file"
                :accept="accept"
                :aria-labelledby="
                  fields.length > 1 ? labelId(rowIndex, field.key) : undefined
                "
                :aria-label="fields.length > 1 ? undefined : `${itemLabel} ${rowIndex + 1}`"
                :aria-describedby="
                  errorFor(rowIndex, field.key) ? errorId(rowIndex, field.key) : undefined
                "
                :aria-invalid="errorFor(rowIndex, field.key) ? 'true' : undefined"
                class="sr-only"
                @change="onSelect(rowIndex, field.key, $event)"
              />

              <template v-if="optimizing.has(inputId(rowIndex, field.key))">
                <Icon
                  name="fa6-solid:spinner"
                  aria-hidden="true"
                  class="shrink-0 animate-spin text-xl text-primary-700 motion-reduce:animate-none"
                />
                <span class="text-sm font-medium text-primary-900">Preparing your photo…</span>
              </template>

              <template v-else-if="row[field.key]">
                <img
                  v-if="previewFor(row[field.key]!)"
                  :src="previewFor(row[field.key]!)"
                  alt=""
                  class="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-primary-900/10"
                  @error="noPreview.add(row[field.key]!)"
                />
                <span
                  v-else
                  aria-hidden="true"
                  class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-xl text-primary-700 ring-1 ring-primary-900/10"
                >
                  <Icon name="fa6-solid:file-lines" />
                </span>
                <span class="min-w-0 flex-1">
                  <span
                    class="block truncate text-sm font-medium text-primary-900"
                    >{{ row[field.key]!.name }}</span
                  >
                  <span class="block text-xs font-light text-slate-600">
                    {{ humanSize(row[field.key]!.size)
                    }}<template v-if="originalSize.has(row[field.key]!)">
                      (was {{ humanSize(originalSize.get(row[field.key]!)!) }})</template
                    >
                    · Tap to replace
                  </span>
                </span>
                <Icon
                  name="fa6-solid:circle-check"
                  aria-hidden="true"
                  class="shrink-0 text-secondary-700"
                />
              </template>

              <template v-else>
                <span
                  aria-hidden="true"
                  class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg text-primary-900"
                >
                  <Icon name="fa6-solid:camera" />
                </span>
                <span>
                  <span class="block text-sm font-medium text-primary-900"
                    >Take a photo or choose a file</span
                  >
                  <span class="block text-xs font-light text-slate-600"
                    >Photo or PDF, up to {{ maxMegabytes }} MB</span
                  >
                </span>
              </template>
            </label>

            <button
              v-if="editorNote && row[field.key] && editable.has(row[field.key]!)"
              type="button"
              class="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-900 shadow-sm ring-1 ring-primary-900/20 transition hover:bg-primary-50"
              @click="openEditor(rowIndex, field.key)"
            >
              <Icon name="fa6-solid:crop-simple" aria-hidden="true" />
              Crop &amp; enhance
            </button>

            <!-- Below the drop zone, so zones side by side stay level
                 whether or not they have a hint -->
            <p v-if="field.hint" class="mt-1.5 text-xs font-light text-slate-600">
              {{ field.hint }}
            </p>

            <FieldError
              :id="errorId(rowIndex, field.key)"
              :message="errorFor(rowIndex, field.key)"
            />
          </div>
        </div>
      </li>
    </ul>

    <LazyFormImageEditor
      v-if="editing"
      :open="!!editing"
      :file="editing.original"
      :note="editorNote!"
      @close="editing = null"
      @apply="onEdited"
    />

    <div class="mt-3">
      <button
        type="button"
        :disabled="atMax"
        class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-primary-900 shadow-sm ring-1 ring-primary-900/20 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
        @click="addRow"
      >
        <Icon name="fa6-solid:plus" aria-hidden="true" />
        {{ addLabel }}
      </button>

      <!-- Say why the button is disabled rather than letting it silently do nothing. -->
      <p v-if="atMax" class="mt-2 text-sm font-light text-slate-600">
        You can attach up to {{ max }} {{ max === 1 ? itemLabel.toLowerCase() : pluralLabel }}.
        Call us at 604-848-7059 if you need to send more.
      </p>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ACCEPT_ATTRIBUTE, LIMITS } from "~~/shared/forms";
import { optimizeForUpload } from "~/utils/imageTools";

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
    hideLegend?: boolean;
    /** Turns on the crop and enhance editor for photos, with this reminder */
    editorNote?: string;
    minRows?: number;
    /** Keyed `prefix.<rowIndex>.<fieldKey>` so server errors can target one input. */
    errorPrefix?: string;
    errors?: Record<string, string>;
  }>(),
  { minRows: 1, required: false, errors: () => ({}) },
);

const emit = defineEmits<{ "update:modelValue": [RepeaterRow[]] }>();

const accept = ACCEPT_ATTRIBUTE;
const maxMegabytes = LIMITS.maxBytesPerFile / 1024 / 1024;

const rows = computed(() => props.modelValue);
const atMax = computed(() => rows.value.length >= props.max);

// The drop zone a file is being dragged over, to highlight it
const dragging = ref<string | null>(null);

// Problems caught in the browser before upload, like an oversized file, so a
// patient on a slow connection hears about it now rather than after sending.
// Keyed like the server's errors, which take over once the form is sent
const localErrors = ref<Record<string, string>>({});

function emptyRow(): RepeaterRow {
  return Object.fromEntries(props.fields.map((f) => [f.key, null]));
}

function addRow() {
  if (atMax.value) return;
  emit("update:modelValue", [...rows.value, emptyRow()]);
}

function removeRow(index: number) {
  const next = rows.value.filter((_, i) => i !== index);
  localErrors.value = {};
  // An optional group (minRows 0) may go back to showing nothing at all.
  emit("update:modelValue", next.length >= props.minRows ? next : [emptyRow()]);
}

// What the browser has worked out about each chosen file: the original it
// came from (edits always start there), the original's size when it was made
// smaller, and whether the photo editor can open it
const originals = new WeakMap<File, File>();
const originalSize = reactive(new Map<File, number>());
const editable = reactive(new WeakSet<File>());
// Zones whose photo is being made smaller before it can be shown
const optimizing = reactive(new Set<string>());
// The latest pick per zone, so a slow earlier pick can't overwrite it
const latestPick = new Map<string, File>();

function replaceFile(index: number, key: string, file: File | null) {
  const next = rows.value.map((row, i) =>
    i === index ? { ...row, [key]: file } : { ...row },
  );
  emit("update:modelValue", next);
}

function setLocalError(errorKey: string, message?: string) {
  const { [errorKey]: _, ...rest } = localErrors.value;
  localErrors.value = message ? { ...rest, [errorKey]: message } : rest;
}

async function setFile(index: number, key: string, file: File | null) {
  const errorKey = `${props.errorPrefix}.${index}.${key}`;
  const zone = inputId(index, key);
  setLocalError(errorKey);

  if (!file) {
    replaceFile(index, key, null);
    return;
  }

  latestPick.set(zone, file);
  const fits = file.size <= LIMITS.maxBytesPerFile;
  // Show it straight away when it's within the limit, so a quick submit
  // still sends it; otherwise wait to see whether shrinking it gets it under
  if (fits) replaceFile(index, key, file);
  else optimizing.add(zone);

  const { optimized, editable: canEdit } = await optimizeForUpload(file);
  optimizing.delete(zone);
  if (latestPick.get(zone) !== file) return;

  const chosen = optimized ?? file;
  if (chosen.size > LIMITS.maxBytesPerFile) {
    setLocalError(
      errorKey,
      `That file is over ${maxMegabytes} MB. Please choose a smaller photo or file.`,
    );
    replaceFile(index, key, null);
    return;
  }

  originals.set(chosen, file);
  if (optimized) originalSize.set(chosen, file.size);
  if (canEdit) editable.add(chosen);
  if (optimized || !fits) replaceFile(index, key, chosen);

  // Reviewing the photo is the natural next step, as in a scanner app, so
  // the editor opens straight away. One tap on "Use photo" or "Skip" accepts
  // it as it is
  if (canEdit && props.editorNote) {
    editing.value = { index, key, original: file };
  }
}

// The photo open in the editor
const editing = shallowRef<{ index: number; key: string; original: File } | null>(
  null,
);

function openEditor(index: number, key: string) {
  const current = rows.value[index]?.[key];
  if (!current) return;
  editing.value = { index, key, original: originals.get(current) ?? current };
}

function onEdited(file: File) {
  if (!editing.value) return;
  const { index, key, original } = editing.value;
  originals.set(file, original);
  originalSize.set(file, original.size);
  editable.add(file);
  latestPick.set(inputId(index, key), file);
  replaceFile(index, key, file);
  editing.value = null;
}

function onSelect(index: number, key: string, event: Event) {
  const input = event.target as HTMLInputElement;
  setFile(index, key, input.files?.[0] ?? null);
}

function onDrop(index: number, key: string, event: DragEvent) {
  dragging.value = null;
  const file = event.dataTransfer?.files?.[0];
  if (file) setFile(index, key, file);
}

function inputId(index: number, key: string): string {
  return `${props.errorPrefix ?? "file"}-${index}-${key}`;
}

function labelId(index: number, key: string): string {
  return `${inputId(index, key)}-label`;
}

function errorId(index: number, key: string): string {
  return `${inputId(index, key)}-error`;
}

function errorFor(index: number, key: string): string | undefined {
  const errorKey = `${props.errorPrefix}.${index}.${key}`;
  return localErrors.value[errorKey] ?? props.errors?.[errorKey];
}

// Thumbnails for chosen images. Browsers that can't show a format (HEIC
// outside Safari) or a PDF get a document icon instead
const previews = new Map<File, string>();
const noPreview = reactive(new Set<File>());

function previewFor(file: File): string | undefined {
  if (!file.type.startsWith("image/") || noPreview.has(file)) return undefined;
  if (!previews.has(file)) previews.set(file, URL.createObjectURL(file));
  return previews.get(file);
}

// Let go of previews for files that are no longer chosen
watch(rows, (current) => {
  const chosen = new Set(current.flatMap((row) => Object.values(row)));
  for (const [file, url] of previews) {
    if (!chosen.has(file)) {
      URL.revokeObjectURL(url);
      previews.delete(file);
    }
  }
});

onBeforeUnmount(() => {
  for (const url of previews.values()) URL.revokeObjectURL(url);
});

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
