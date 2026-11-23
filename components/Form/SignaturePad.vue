<template>
  <!-- A signature drawn with a finger, a mouse or a trackpad, on a plain
       canvas. Pointer events cover all three. Exported as a PNG with a
       transparent background. A tap or a dot isn't a signature: `signed` only
       turns true once the strokes add up to a real line -->
  <div>
    <div class="mb-1.5 flex items-center justify-between">
      <span :id="`${id}-label`" class="form-label mb-0">{{ label }}</span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-light text-slate-600 transition-colors hover:bg-primary-100 hover:text-primary-900"
        @click="clear"
      >
        <Icon name="fa6-solid:rotate-left" aria-hidden="true" />
        Clear<span class="sr-only"> signature</span>
      </button>
    </div>
    <p :id="`${id}-hint`" class="form-hint">{{ hint }}</p>
    <div
      :class="[
        'relative overflow-hidden rounded-xl bg-white shadow-sm',
        error ? 'ring-2 ring-red-400' : 'ring-1 ring-primary-900/20',
      ]"
    >
      <canvas
        :id="id"
        ref="canvas"
        role="img"
        :aria-label="signed ? `${label}: signed` : `${label}: not signed yet`"
        :aria-describedby="[`${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')"
        :aria-invalid="error ? 'true' : undefined"
        class="block h-40 w-full cursor-crosshair touch-none select-none"
        @pointerdown="start"
        @pointermove="move"
        @pointerup="end"
        @pointercancel="end"
        @lostpointercapture="end"
      ></canvas>
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-5 bottom-10 border-b border-primary-900/15"
      ></span>
    </div>
    <FieldError :id="`${id}-error`" :message="error" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id: string;
    label?: string;
    hint?: string;
    error?: string;
    /** Bytes the exported PNG must stay under */
    maxBytes?: number;
  }>(),
  {
    label: "Signature",
    hint: "Sign with your finger, or with your mouse or trackpad.",
    error: undefined,
    maxBytes: 300 * 1024,
  },
);

const emit = defineEmits<{ "update:signed": [boolean] }>();

/** How much line, in CSS pixels, counts as a signature rather than a tap. */
const MIN_INK = 40;
const INK = "#141E39"; // primary-900
const LINE_WIDTH = 2.2;

type Point = { x: number; y: number };
const canvas = ref<HTMLCanvasElement | null>(null);
const strokes: Point[][] = [];
let current: Point[] | null = null;
let ink = 0;
const signed = ref(false);

function scale(): number {
  return Math.min(2, Math.max(1, window.devicePixelRatio || 1));
}

function setUp(ctx: CanvasRenderingContext2D, s: number) {
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
}

function drawStroke(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, LINE_WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

/** Sizes the canvas to its box and redraws, so a rotated phone keeps the signature. */
function resize() {
  const c = canvas.value;
  if (!c) return;
  const rect = c.getBoundingClientRect();
  const s = scale();
  c.width = Math.round(rect.width * s);
  c.height = Math.round(rect.height * s);
  const ctx = c.getContext("2d");
  if (!ctx) return;
  setUp(ctx, s);
  for (const stroke of strokes) drawStroke(ctx, stroke);
}

function pointFrom(e: PointerEvent): Point {
  const rect = canvas.value!.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function setSigned(value: boolean) {
  if (signed.value === value) return;
  signed.value = value;
  emit("update:signed", value);
}

function start(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  e.preventDefault();
  canvas.value?.setPointerCapture?.(e.pointerId);
  current = [pointFrom(e)];
  strokes.push(current);
  const ctx = canvas.value?.getContext("2d");
  if (ctx) drawStroke(ctx, current);
}

function move(e: PointerEvent) {
  if (!current) return;
  e.preventDefault();
  const ctx = canvas.value?.getContext("2d");
  const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
  for (const ev of events.length ? events : [e]) {
    const p = pointFrom(ev);
    const last = current[current.length - 1];
    ink += Math.hypot(p.x - last.x, p.y - last.y);
    current.push(p);
    if (ctx) drawStroke(ctx, [last, p]);
  }
  if (ink >= MIN_INK) setSigned(true);
}

function end() {
  current = null;
}

function clear() {
  strokes.length = 0;
  current = null;
  ink = 0;
  resize();
  setSigned(false);
}

function exportAt(s: number): Promise<Blob | null> {
  const c = canvas.value!;
  const rect = c.getBoundingClientRect();
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(rect.width * s));
  out.height = Math.max(1, Math.round(rect.height * s));
  const ctx = out.getContext("2d")!;
  setUp(ctx, s);
  for (const stroke of strokes) drawStroke(ctx, stroke);
  return new Promise((resolve) => out.toBlob(resolve, "image/png"));
}

/**
 * The signature as a transparent PNG, under maxBytes. Drawn again from the
 * strokes rather than copied, at a smaller scale if the first is too big.
 */
async function toPng(): Promise<Blob | null> {
  if (!canvas.value || !signed.value) return null;
  for (const s of [scale(), 1, 0.5]) {
    const blob = await exportAt(s);
    if (blob && blob.size <= props.maxBytes) return blob;
  }
  return null;
}

let observer: ResizeObserver | undefined;
onMounted(() => {
  resize();
  observer = new ResizeObserver(() => resize());
  if (canvas.value) observer.observe(canvas.value);
});
onBeforeUnmount(() => observer?.disconnect());

defineExpose({ clear, toPng, signed });
</script>
