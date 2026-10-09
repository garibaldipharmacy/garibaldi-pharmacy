<template>
  <div class="ml-auto">
    <button
      @click="openDialog"
      class="text-primary-900 flex items-center"
      aria-label="Open menu"
      :aria-expanded="open"
    >
      <div
        :class="['tham', 'tham-e-spin', 'tham-w-6', { 'tham-active': open }]"
      >
        <div class="tham-box">
          <div class="tham-inner bg-primary-900" />
        </div>
      </div>
    </button>

    <!-- The menu and its dialog code load on the first tap rather than with
         every page, then stay mounted so later opens and closes animate -->
    <LazyNavMobileMenu
      v-if="menuRequested"
      :open="open"
      :links="links"
      @close="closeDialog"
    />
  </div>
</template>

<script lang="ts" setup>
import type { HeaderNavLink } from "~/types/HeaderNavLink.interface";
import { ref } from "vue";

defineProps({
  links: {
    type: Array as PropType<HeaderNavLink[]>,
    required: true,
  },
});

const open = ref(false);
const menuRequested = ref(false);

const openDialog = () => {
  menuRequested.value = true;
  open.value = true;
};

const closeDialog = () => {
  open.value = false;
};
</script>
