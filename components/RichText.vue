<template>
  <!-- Copy with inline links, written as a list of parts: plain strings, and
       { text, to } for a link. Kept as data rather than HTML so the same copy
       can also go into structured data as plain text --><template
    v-for="(part, index) in parts"
    :key="index"
    ><template v-if="typeof part === 'string'">{{ part }}</template
    ><NuxtLink v-else :to="part.to" :class="linkClass">{{
      part.text
    }}</NuxtLink></template
  >
</template>

<script lang="ts" setup>
defineProps<{
  parts: (string | { text: string; to: string })[];
  linkClass?: string;
}>();
</script>
