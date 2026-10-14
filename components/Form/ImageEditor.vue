<template>
  <!-- Crop, rotate and an optional document filter for an uploaded photo.
       Loaded only when first opened (as LazyFormImageEditor), so its code
       never weighs on the form page. Edits are always made from the original
       file, so editing twice never loses quality -->
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-[60]" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-primary-950/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center sm:p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="flex min-h-screen w-full flex-col bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-primary-900 shadow-xl [min-height:100dvh] sm:min-h-0 sm:max-w-3xl sm:rounded-3xl sm:p-6 sm:[min-height:0]"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle class="text-xl font-semibold">
                    Check your photo
                  </DialogTitle>
                  <p class="mt-1 text-sm font-light text-slate-600">
                    Crop out the background, or use Document to make the text
                    easier to read.
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-900"
                  aria-label="Skip, and use the photo as it is"
                  @click="emit('close')"
                >
                  <Icon name="fa6-solid:xmark" class="text-lg" />
                </button>
              </div>

              <p
                class="mt-3 flex items-start gap-3 rounded-2xl bg-secondary-100 px-4 py-3 text-sm text-secondary-950"
              >
                <Icon
                  name="fa6-solid:circle-info"
                  aria-hidden="true"
                  class="mt-0.5 shrink-0 text-secondary-800"
                />
                {{ note }}
              </p>

              <!-- The photo, with the crop box over it -->
              <div
                class="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-primary-950 p-4 sm:min-h-[22rem]"
              >
                <Icon
                  v-if="!previewUrl"
                  name="fa6-solid:spinner"
                  class="animate-spin text-2xl text-white/70 motion-reduce:animate-none"
                />
                <!-- Two layers over the photo: one clipped to it, for the
                     dimming outside the crop, and one unclipped, so the
                     corner handles stay whole at the photo's edges -->
                <div
                  v-else
                  ref="stage"
                  class="relative inline-block touch-none select-none"
                >
                  <img
                    :src="previewUrl"
                    alt="Your photo, with the crop area marked"
                    class="block max-h-[50vh] w-auto max-w-full [max-height:50dvh]"
                    draggable="false"
                  />
                  <div class="pointer-events-none absolute inset-0 overflow-hidden">
                    <div class="absolute" :style="{ ...cropBox, ...dimOutside }" />
                  </div>
                  <div
                    class="absolute cursor-move outline outline-2 outline-white focus:outline-secondary-400"
                    :style="cropBox"
                    tabindex="0"
                    role="group"
                    aria-label="Crop area. Drag, or use the arrow keys, to move it"
                    @pointerdown="startDrag('move', $event)"
                    @keydown="nudge('move', $event)"
                  >
                    <button
                      v-for="corner in corners"
                      :key="corner.id"
                      type="button"
                      :aria-label="`Resize from the ${corner.label} corner. Use the arrow keys`"
                      :class="[
                        'absolute flex h-11 w-11 items-center justify-center focus:outline-none',
                        corner.position,
                      ]"
                      @pointerdown.stop="startDrag(corner.id, $event)"
                      @keydown.stop="nudge(corner.id, $event)"
                    >
                      <span
                        class="h-5 w-5 rounded-full border-2 border-primary-900 bg-white shadow"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Controls -->
              <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-900 transition-colors hover:bg-primary-100"
                    aria-label="Rotate left"
                    @click="turn(-90)"
                  >
                    <Icon name="fa6-solid:rotate-left" />
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-900 transition-colors hover:bg-primary-100"
                    aria-label="Rotate right"
                    @click="turn(90)"
                  >
                    <Icon name="fa6-solid:rotate-right" />
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-900"
                    @click="reset"
                  >
                    Reset
                  </button>
                </div>

                <div
                  role="group"
                  aria-label="Filter"
                  class="inline-flex gap-1 rounded-full bg-primary-50 p-1"
                >
                  <button
                    v-for="option in filters"
                    :key="option.value"
                    type="button"
                    :aria-pressed="filter === option.value"
                    :class="[
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      filter === option.value
                        ? 'bg-white text-primary-900 shadow'
                        : 'text-slate-600 hover:text-primary-900',
                    ]"
                    @click="filter = option.value"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <p v-if="failed" role="alert" class="mt-3 text-sm text-red-700">
                That photo couldn't be edited. You can still send it as it is.
              </p>

              <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-full px-6 py-3 font-medium text-primary-900 ring-1 ring-primary-900/20 transition-colors hover:bg-primary-50"
                  @click="emit('close')"
                >
                  Skip
                </button>
                <button
                  type="button"
                  :disabled="!working || applying"
                  class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-900 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  @click="apply"
                >
                  <Icon
                    v-show="applying"
                    name="fa6-solid:spinner"
                    aria-hidden="true"
                    class="animate-spin motion-reduce:animate-none"
                  />
                  Use photo
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import {
  FULL_CROP,
  applyDocumentFilter,
  asJpegFile,
  loadWorkingCopy,
  renderEdit,
  rotate,
  type Crop,
  type Filter,
  type Rotation,
} from "~/utils/imageTools";

const props = defineProps<{
  open: boolean;
  /** The original file, never a previous edit */
  file: File;
  note: string;
}>();

const emit = defineEmits<{ close: []; apply: [File] }>();

const filters: { value: Filter; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "document", label: "Document" },
];

const corners = [
  { id: "nw", label: "top left", position: "-left-5 -top-5" },
  { id: "ne", label: "top right", position: "-right-5 -top-5" },
  { id: "sw", label: "bottom left", position: "-bottom-5 -left-5" },
  { id: "se", label: "bottom right", position: "-bottom-5 -right-5" },
] as const;

type Handle = "move" | (typeof corners)[number]["id"];

/** The smallest crop, as a fraction of each side */
const MIN_SIZE = 0.1;
/** Longest side of the on-screen preview */
const PREVIEW_MAX_SIDE = 1400;

const working = shallowRef<HTMLCanvasElement | null>(null);
const rotation = ref<Rotation>(0);
const crop = ref<Crop>({ ...FULL_CROP });
const filter = ref<Filter>("original");
const previewUrl = ref<string | null>(null);
const applying = ref(false);
const failed = ref(false);
const stage = ref<HTMLElement | null>(null);

const cropBox = computed(() => ({
  left: `${crop.value.x * 100}%`,
  top: `${crop.value.y * 100}%`,
  width: `${crop.value.width * 100}%`,
  height: `${crop.value.height * 100}%`,
}));

// A shadow spreading out from the crop dims everything outside it
const dimOutside = { boxShadow: "0 0 0 9999px rgba(11, 16, 29, 0.6)" };

onMounted(async () => {
  try {
    working.value = await loadWorkingCopy(props.file);
  } catch {
    failed.value = true;
  }
});

// Redraw the preview whenever the turn or filter changes
watch(
  [working, rotation, filter],
  async () => {
    if (!working.value) return;
    const preview = rotate(working.value, rotation.value, PREVIEW_MAX_SIDE);
    if (filter.value === "document") applyDocumentFilter(preview);
    const blob = await new Promise<Blob | null>((resolve) =>
      preview.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) return;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(blob);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

function turn(degrees: 90 | -90) {
  rotation.value = (((rotation.value + degrees) % 360) + 360) % 360 as Rotation;
  // A crop drawn on the old orientation wouldn't fit the new one
  crop.value = { ...FULL_CROP };
}

function reset() {
  rotation.value = 0;
  crop.value = { ...FULL_CROP };
  filter.value = "original";
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Moves the box, or one corner, by a fraction of the image */
function adjust(handle: Handle, from: Crop, dx: number, dy: number): Crop {
  if (handle === "move") {
    return {
      ...from,
      x: clamp(from.x + dx, 0, 1 - from.width),
      y: clamp(from.y + dy, 0, 1 - from.height),
    };
  }

  let left = from.x;
  let top = from.y;
  let right = from.x + from.width;
  let bottom = from.y + from.height;
  if (handle.includes("w")) left = clamp(left + dx, 0, right - MIN_SIZE);
  if (handle.includes("e")) right = clamp(right + dx, left + MIN_SIZE, 1);
  if (handle.includes("n")) top = clamp(top + dy, 0, bottom - MIN_SIZE);
  if (handle.includes("s")) bottom = clamp(bottom + dy, top + MIN_SIZE, 1);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function startDrag(handle: Handle, event: PointerEvent) {
  const rect = stage.value?.getBoundingClientRect();
  if (!rect) return;
  event.preventDefault();
  const start = { x: event.clientX, y: event.clientY, crop: { ...crop.value } };

  const move = (e: PointerEvent) => {
    crop.value = adjust(
      handle,
      start.crop,
      (e.clientX - start.x) / rect.width,
      (e.clientY - start.y) / rect.height,
    );
  };
  const end = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

/** Arrow keys move the box or a corner by 1% (5% with Shift) */
function nudge(handle: Handle, event: KeyboardEvent) {
  const step = event.shiftKey ? 0.05 : 0.01;
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const delta = moves[event.key];
  if (!delta) return;
  event.preventDefault();
  crop.value = adjust(handle, crop.value, delta[0], delta[1]);
}

const unchanged = computed(
  () =>
    rotation.value === 0 &&
    filter.value === "original" &&
    crop.value.x === 0 &&
    crop.value.y === 0 &&
    crop.value.width === 1 &&
    crop.value.height === 1,
);

async function apply() {
  if (!working.value) return;
  // Nothing to change: keep the photo already chosen rather than encoding
  // another copy of it
  if (unchanged.value) {
    emit("close");
    return;
  }
  applying.value = true;
  try {
    const blob = await renderEdit(working.value, {
      rotation: rotation.value,
      crop: crop.value,
      filter: filter.value,
    });
    emit("apply", asJpegFile(blob, props.file.name));
  } catch {
    failed.value = true;
  } finally {
    applying.value = false;
  }
}
</script>
