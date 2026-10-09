<template>
  <TransitionRoot as="template" :show="open" appear>
    <Dialog
      as="div"
      class="relative z-50"
      :initialFocus="closeButton"
      @close="close"
    >
      <TransitionChild
        as="template"
        enter="transition-opacity ease-out duration-300 motion-reduce:transition-none"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-in duration-200 motion-reduce:transition-none"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <DialogPanel class="fixed inset-0 flex w-full flex-col bg-white">
          <DialogTitle class="sr-only">Menu</DialogTitle>
          <!-- Mirrors the page header so the menu appears to open beneath it.
               The close button lives inside the panel so tapping it can't
               also register as an outside click and reopen the menu. -->
          <div
            class="flex flex-wrap items-center gap-5 p-5 shadow-lg shrink-0"
          >
            <div class="logo w-1/3 sm:w-auto">
              <NuxtLink to="/" @click="close">
                <img
                  src="@/assets/images/logostyles/logo-wide.svg"
                  alt="Garibaldi Pharmacy and Compounding Lab logo"
                  width="172"
                  height="50"
                />
              </NuxtLink>
            </div>
            <button
              ref="closeButton"
              @click="close"
              class="ml-auto flex items-center text-primary-900"
              aria-label="Close menu"
            >
              <div class="tham tham-e-spin tham-w-6 tham-active">
                <div class="tham-box">
                  <div class="tham-inner bg-primary-900" />
                </div>
              </div>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto overscroll-contain">
            <nav class="px-5 pt-2 pb-6" aria-label="Main">
              <ul class="divide-y divide-primary-100">
                <li
                  v-for="(link, index) in links"
                  :key="link.title"
                  class="nav-item"
                  :style="{ animationDelay: `${60 + index * 40}ms` }"
                >
                  <template v-if="link.children">
                    <button
                      @click="toggleChild(link)"
                      class="flex w-full items-center justify-between py-4 text-xl text-primary-900"
                      :aria-expanded="isExpanded(link)"
                    >
                      <span>{{ link.title }}</span>
                      <Icon
                        name="flowbite:angle-down-solid"
                        :class="[
                          'text-primary-400 transition-transform duration-300',
                          { 'rotate-180': isExpanded(link) },
                        ]"
                      />
                    </button>
                    <Transition name="expand">
                      <ul
                        v-if="isExpanded(link)"
                        class="mb-4 grid gap-1 rounded-lg bg-primary-50 p-2"
                      >
                        <li v-for="child in link.children" :key="child.title">
                          <NuxtLink
                            :to="child.link"
                            @click="close"
                            class="flex items-center gap-4 rounded-md px-3 py-3 text-primary-900 transition-colors hover:bg-primary-100"
                          >
                            <CircleIcon
                              v-if="child.icon"
                              :icon="child.icon"
                              bgColor="bg-white"
                              :iconColor="iconColor(child)"
                              class="shrink-0"
                            />
                            {{ child.title }}
                          </NuxtLink>
                        </li>
                      </ul>
                    </Transition>
                  </template>

                  <NuxtLink
                    v-else
                    :to="link.link"
                    @click="close"
                    class="block py-4 text-xl text-primary-900 transition-opacity hover:opacity-60"
                  >
                    {{ link.title }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>

          <ul
            class="flex shrink-0 flex-col gap-3 bg-primary-50 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-sm font-light text-primary-900"
          >
            <li>
              <a
                :href="`tel:${phoneMain}`"
                class="flex items-center hover:opacity-75"
              >
                <Icon name="fa6-solid:phone" class="mr-3 shrink-0" />
                {{ phoneMain }}
              </a>
            </li>
            <li class="flex items-center">
              <Icon name="fa6-solid:clock" class="mr-3 shrink-0" />
              {{ hours }}
            </li>
            <li>
              <a :href="mapsLink" class="flex items-center hover:opacity-75">
                <Icon name="fa6-solid:location-dot" class="mr-3 shrink-0" />
                {{ location }}
              </a>
            </li>
          </ul>
        </DialogPanel>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts" setup>
import type { HeaderNavLink } from "~/types/HeaderNavLink.interface";
import { ref } from "vue";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

import { businessInfo } from "~/constants/business";

const phoneMain = businessInfo.contact.phone.main;
const hours = businessInfo.business_hours.short;
const location = businessInfo.address.short;
const mapsLink = businessInfo.links.google_maps;

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  links: {
    type: Array as PropType<HeaderNavLink[]>,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const closeButton = ref<HTMLElement | null>(null);

// Track expanded sections locally so the shared links prop isn't mutated
const expanded = ref(
  new Set(props.links.filter((l) => l.expanded).map((l) => l.title))
);

// White circles stand out against the grey submenu, so the theme colour
// goes on the icon itself
const iconColor = (link: HeaderNavLink) =>
  link.theme === "secondary" ? "text-secondary-900" : "text-primary-900";

const isExpanded = (link: HeaderNavLink) => expanded.value.has(link.title);

const toggleChild = (link: HeaderNavLink) => {
  if (expanded.value.has(link.title)) {
    expanded.value.delete(link.title);
  } else {
    expanded.value.add(link.title);
  }
};

const close = () => emit("close");
</script>

<style scoped>
.nav-item {
  animation: nav-item-in 0.35s ease-out both;
}

@keyframes nav-item-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .nav-item {
    animation: none;
  }
}
</style>
