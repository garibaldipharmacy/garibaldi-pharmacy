<template>
  <!-- Two steps for an uploaded photo: outline the page with free corners
       (straightening a page shot at an angle) and rotate it, then review the
       result and choose an optional document filter.
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
                    {{
                      step === "adjust"
                        ? "Drag the corners onto the corners of the page."
                        : "Here’s how the page will look. Use Document to make the text easier to read."
                    }}
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

              <!-- The photo, with the crop outline over it -->
              <div
                v-if="step === 'adjust'"
                class="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-primary-950 p-4 sm:min-h-[22rem]"
              >
                <Icon
                  v-if="!previewUrl"
                  name="fa6-solid:spinner"
                  class="animate-spin text-2xl text-white/70 motion-reduce:animate-none"
                />
                <!-- The outline is drawn in an SVG stretched over the photo,
                     in fractions of it. The handles sit in an unclipped layer
                     so they stay whole at the photo's edges -->
                <div
                  v-else
                  ref="stage"
                  class="relative inline-block touch-none select-none rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
                  tabindex="0"
                  role="group"
                  aria-label="Crop outline. Drag inside it, or use the arrow keys, to move it"
                  @keydown="nudge('move', $event)"
                >
                  <img
                    :src="previewUrl"
                    alt="Your photo, with the crop outline marked"
                    class="block max-h-[50vh] w-auto max-w-full [max-height:50dvh]"
                    draggable="false"
                  />
                  <svg
                    class="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <!-- Dims everything outside the outline -->
                    <path
                      :d="`M0 0H1V1H0Z ${outlinePath}`"
                      fill="rgba(11, 16, 29, 0.6)"
                      fill-rule="evenodd"
                    />
                    <path
                      :d="outlinePath"
                      fill="transparent"
                      stroke="white"
                      stroke-width="2"
                      vector-effect="non-scaling-stroke"
                      class="pointer-events-auto cursor-move"
                      @pointerdown="startDrag('move', $event)"
                    />
                  </svg>
                  <button
                    v-for="(corner, index) in corners"
                    :key="corner.label"
                    type="button"
                    :aria-label="`Move the ${corner.label} corner. Use the arrow keys`"
                    class="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus:outline-none focus-visible:[&>span]:ring-4 focus-visible:[&>span]:ring-secondary-400"
                    :style="{
                      left: `${quad[index].x * 100}%`,
                      top: `${quad[index].y * 100}%`,
                    }"
                    @pointerdown.stop="startDrag(index, $event)"
                    @keydown.stop="nudge(index, $event)"
                  >
                    <span
                      :class="[
                        'h-5 w-5 rounded-full border-2 border-primary-900 bg-white shadow transition-transform',
                        { 'scale-125': dragging === index },
                      ]"
                    />
                  </button>

                  <!-- A magnified view of the corner being dragged, clear of
                       the finger, so it can be placed exactly on a phone -->
                  <div
                    v-if="loupe"
                    aria-hidden="true"
                    class="pointer-events-none absolute h-24 w-24 -translate-x-1/2 overflow-hidden rounded-full border-2 border-white bg-primary-950 shadow-lg"
                    :style="loupe.style"
                  >
                    <span class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/80" />
                    <span class="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/80" />
                  </div>
                </div>
              </div>

              <!-- The result, exactly as it will be sent -->
              <div
                v-else
                class="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-primary-950 p-4 sm:min-h-[22rem]"
              >
                <Icon
                  v-if="!resultUrl"
                  name="fa6-solid:spinner"
                  class="animate-spin text-2xl text-white/70 motion-reduce:animate-none"
                />
                <img
                  v-else
                  :src="resultUrl"
                  alt="Your photo as it will be sent"
                  class="block max-h-[50vh] w-auto max-w-full rounded-sm bg-white shadow-lg [max-height:50dvh]"
                />
              </div>

              <!-- Controls -->
              <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div v-if="step === 'adjust'" class="flex items-center gap-2">
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
                  v-else
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
                  class="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-primary-900 ring-1 ring-primary-900/20 transition-colors hover:bg-primary-50"
                  @click="step === 'adjust' ? emit('close') : back()"
                >
                  <Icon
                    v-if="step === 'review'"
                    name="fa6-solid:arrow-left"
                    aria-hidden="true"
                    class="text-sm"
                  />
                  {{ step === "adjust" ? "Skip" : "Back" }}
                </button>
                <button
                  ref="primaryButton"
                  type="button"
                  :disabled="!working || busy"
                  class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-900 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  @click="step === 'adjust' ? next() : apply()"
                >
                  <Icon
                    v-show="busy"
                    name="fa6-solid:spinner"
                    aria-hidden="true"
                    class="animate-spin motion-reduce:animate-none"
                  />
                  {{ step === "adjust" ? "Next" : "Use photo" }}
                  <Icon
                    v-if="step === 'adjust' && !busy"
                    name="fa6-solid:arrow-right"
                    aria-hidden="true"
                    class="text-sm"
                  />
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
  asJpegFile,
  fullQuad,
  isUprightRectangle,
  isUsableQuad,
  encodePage,
  filtered,
  loadWorkingCopy,
  renderPage,
  rotate,
  type Filter,
  type Quad,
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

// In the order the outline runs: clockwise from the top left
const corners = [
  { label: "top left" },
  { label: "top right" },
  { label: "bottom right" },
  { label: "bottom left" },
] as const;

type Handle = "move" | number;

/** Longest side of the on-screen preview */
const PREVIEW_MAX_SIDE = 1400;
/** How much the loupe magnifies */
const LOUPE_ZOOM = 3;
/** Loupe diameter in CSS pixels (h-24) */
const LOUPE_SIZE = 96;

const working = shallowRef<HTMLCanvasElement | null>(null);
const rotation = ref<Rotation>(0);
const quad = ref<Quad>(fullQuad());
const filter = ref<Filter>("original");
const previewUrl = ref<string | null>(null);
const busy = ref(false);
const step = ref<"adjust" | "review">("adjust");
// The straightened page, made once on Next so switching filters is instant
const page = shallowRef<HTMLCanvasElement | null>(null);
const resultUrl = ref<string | null>(null);
const primaryButton = ref<HTMLButtonElement | null>(null);
const failed = ref(false);
const stage = ref<HTMLElement | null>(null);
const dragging = ref<number | null>(null);
const stageSize = ref({ width: 0, height: 0 });

const outlinePath = computed(
  () => `M${quad.value.map((p) => `${p.x} ${p.y}`).join("L")}Z`,
);

// Shown above the corner being dragged, or below it near the top edge
const loupe = computed(() => {
  if (dragging.value === null || !previewUrl.value) return null;
  const { width, height } = stageSize.value;
  const point = quad.value[dragging.value];
  const px = point.x * width;
  const py = point.y * height;
  const below = py < LOUPE_SIZE + 40;
  return {
    style: {
      left: `${px}px`,
      top: below ? `${py + 36}px` : `${py - LOUPE_SIZE - 36}px`,
      backgroundImage: `url(${previewUrl.value})`,
      backgroundSize: `${width * LOUPE_ZOOM}px ${height * LOUPE_ZOOM}px`,
      backgroundPosition: `${LOUPE_SIZE / 2 - px * LOUPE_ZOOM}px ${LOUPE_SIZE / 2 - py * LOUPE_ZOOM}px`,
      backgroundRepeat: "no-repeat",
    },
  };
});

onMounted(async () => {
  try {
    working.value = await loadWorkingCopy(props.file);
  } catch {
    failed.value = true;
  }
});

const toUrl = async (canvas: HTMLCanvasElement) => {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );
  return blob ? URL.createObjectURL(blob) : null;
};

// Redraw the photo being outlined whenever it turns
watch(
  [working, rotation],
  async () => {
    if (!working.value) return;
    const url = await toUrl(rotate(working.value, rotation.value, PREVIEW_MAX_SIDE));
    if (!url) return;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = url;
  },
  { immediate: true },
);

// Redraw the result whenever the page or its filter changes
watch([page, filter], async () => {
  const url = page.value ? await toUrl(filtered(page.value, filter.value)) : null;
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
  resultUrl.value = url;
});

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
});

// Straightening takes a moment on a phone; let the spinner show first
const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

async function next() {
  if (!working.value) return;
  busy.value = true;
  await nextFrame();
  try {
    page.value = renderPage(working.value, {
      rotation: rotation.value,
      quad: quad.value,
    });
    step.value = "review";
    // The button pressed is now Use photo; keep focus on it
    await nextTick();
    primaryButton.value?.focus();
  } catch {
    failed.value = true;
  } finally {
    busy.value = false;
  }
}

async function back() {
  step.value = "adjust";
  await nextTick();
  stage.value?.focus();
}

function turn(degrees: 90 | -90) {
  rotation.value = (((rotation.value + degrees) % 360) + 360) % 360 as Rotation;
  // An outline drawn on the old orientation wouldn't fit the new one
  quad.value = fullQuad();
}

function reset() {
  rotation.value = 0;
  quad.value = fullQuad();
  filter.value = "original";
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Moves the whole outline, or one corner, by a fraction of the image. A
 * corner stays on the photo, and a move that would fold the outline over
 * itself is refused, leaving the corner where it was
 */
function adjust(handle: Handle, from: Quad, dx: number, dy: number): Quad {
  if (handle === "move") {
    const xs = from.map((p) => p.x);
    const ys = from.map((p) => p.y);
    const mx = clamp(dx, -Math.min(...xs), 1 - Math.max(...xs));
    const my = clamp(dy, -Math.min(...ys), 1 - Math.max(...ys));
    return from.map((p) => ({ x: p.x + mx, y: p.y + my })) as Quad;
  }

  const next = from.map((p) => ({ ...p })) as Quad;
  next[handle] = {
    x: clamp(from[handle].x + dx, 0, 1),
    y: clamp(from[handle].y + dy, 0, 1),
  };
  return isUsableQuad(next) ? next : from;
}

function startDrag(handle: Handle, event: PointerEvent) {
  const rect = stage.value?.getBoundingClientRect();
  if (!rect) return;
  event.preventDefault();
  stageSize.value = { width: rect.width, height: rect.height };
  if (handle !== "move") dragging.value = handle;
  const start = { x: event.clientX, y: event.clientY, quad: quad.value };

  // Measured from where the drag began, so the corner stays under the
  // finger. A position that would fold the outline leaves the last good one
  const move = (e: PointerEvent) => {
    const dx = (e.clientX - start.x) / rect.width;
    const dy = (e.clientY - start.y) / rect.height;
    const next = adjust(handle, start.quad, dx, dy);
    if (next !== start.quad) quad.value = next;
  };
  const end = () => {
    dragging.value = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

/** Arrow keys move the outline or a corner by 1% (5% with Shift) */
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
  quad.value = adjust(handle, quad.value, delta[0], delta[1]);
}

const unchanged = computed(() => {
  const [tl, , br] = quad.value;
  return (
    rotation.value === 0 &&
    filter.value === "original" &&
    isUprightRectangle(quad.value) &&
    tl.x === 0 &&
    tl.y === 0 &&
    br.x === 1 &&
    br.y === 1
  );
});

async function apply() {
  if (!page.value) return;
  // Nothing to change: keep the photo already chosen rather than encoding
  // another copy of it
  if (unchanged.value) {
    emit("close");
    return;
  }
  busy.value = true;
  try {
    emit("apply", asJpegFile(await encodePage(page.value, filter.value), props.file.name));
  } catch {
    failed.value = true;
  } finally {
    busy.value = false;
  }
}
</script>
