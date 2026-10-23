<template>
  <!-- A growing sprig echoing the leaves in the logo, as the mountains echo
       its peaks. As it scrolls into view the stem draws upward and the
       leaves unfurl from their bases in turn; hovering the panel it sits in
       (a .group) sways it a little. With reduced motion, or before the page
       is interactive, it simply shows fully grown -->
  <svg
    v-reveal
    aria-hidden="true"
    viewBox="0 0 120 160"
    fill="none"
    :class="[
      'leaf-sprig pointer-events-none text-brand-green',
      { '-scale-x-100': flip },
    ]"
  >
    <g class="leaf-sprig-sway">
      <path
        class="leaf-sprig-stem"
        pathLength="1"
        d="M58 160C56 128 68 104 62 50"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <!-- Each leaf is drawn with its base at its own origin, so it grows
           out from the stem -->
      <g
        v-for="(leaf, index) in leaves"
        :key="index"
        :transform="leaf.transform"
      >
        <g class="leaf-sprig-leaf" :style="{ '--leaf-delay': `${index * 180}ms` }">
          <path
            d="M0 0C6-14 22-24 40-22C34-8 18 2 0 0Z"
            fill="currentColor"
            :fill-opacity="leaf.opacity"
          />
          <path
            d="M2-1C14-7 26-14 36-20"
            stroke="white"
            stroke-opacity="0.55"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script lang="ts" setup>
defineProps({
  // Mirror it, e.g. for a left-hand corner
  flip: Boolean,
});

// Alternating leaves up the stem, then the logo's pair at the top
const leaves = [
  { transform: "translate(59 132) rotate(-12)", opacity: 0.75 },
  { transform: "translate(62 104) rotate(192) scale(1 -1)", opacity: 0.75 },
  { transform: "translate(63 52) rotate(-28) scale(1.25)", opacity: 1 },
  { transform: "translate(62 54) rotate(208) scale(1.2 -1.2)", opacity: 1 },
];
</script>
