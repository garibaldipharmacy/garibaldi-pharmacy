<template>
  <nav
    ref="navEl"
    class="relative ml-auto flex items-center text-sm sm:text-base"
    aria-label="Main"
  >
    <ul class="header-links flex items-center gap-1 text-primary-900">
      <li
        v-for="link in desktopLinks"
        :key="link.title"
        @mouseenter="link.children && openMenu(link, true)"
        @mouseleave="link.children && scheduleClose()"
        @focusout="link.children && onFocusOut($event)"
        @keydown.esc="link.children && closeMenu(true)"
      >
        <template v-if="link.children">
          <button
            :ref="(el) => (triggers[link.title] = el as HTMLElement)"
            type="button"
            :class="itemClass(isSectionActive(link))"
            :aria-expanded="openLink === link"
            :aria-controls="`nav-panel-${slug(link.title)}`"
            @click="toggleMenu(link)"
          >
            {{ link.title }}
            <Icon
              name="flowbite:angle-down-solid"
              :class="[
                'ml-1 text-primary-400 transition-transform duration-200',
                { 'rotate-180': openLink === link },
              ]"
            />
          </button>

          <Transition
            enter-from-class="opacity-0 -translate-y-1"
            enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
            leave-to-class="opacity-0 -translate-y-1"
            leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
          >
            <!-- v-show keeps the service links in the server-rendered HTML for
                 crawlers. Positioned against the nav (the list items aren't
                 positioned) and right-aligned so it never runs off the screen.
                 The top padding bridges the gap to the trigger so the panel
                 stays open while the pointer moves down into it -->
            <div
              v-show="openLink === link"
              :id="`nav-panel-${slug(link.title)}`"
              class="absolute right-0 top-full z-50 pt-5"
            >
              <div
                class="w-[40rem] overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_-12px_rgba(20,30,57,0.35)] ring-1 ring-primary-900/5"
              >
                <ul class="grid grid-cols-2 gap-1 p-3">
                  <li v-for="child in link.children" :key="child.title">
                    <NuxtLink
                      :to="child.link"
                      @click="closeMenu()"
                      :class="[
                        'group flex gap-3 rounded-lg p-3 transition-colors hover:bg-primary-50',
                        { 'bg-primary-50': isActive(child.link) },
                      ]"
                    >
                      <CircleIcon
                        v-if="child.icon"
                        :icon="child.icon"
                        class="shrink-0"
                      />
                      <span>
                        <span class="block text-primary-900">{{ child.title }}</span>
                        <span
                          v-if="child.description"
                          class="mt-0.5 block text-sm font-light leading-snug text-primary-600"
                        >
                          {{ child.description }}
                        </span>
                      </span>
                    </NuxtLink>
                  </li>
                </ul>

                <div
                  v-if="link.cta"
                  class="flex items-center justify-between gap-4 bg-primary-50 px-6 py-4 text-sm"
                >
                  <span class="font-light text-primary-700">
                    {{ link.cta.text }}
                  </span>
                  <NuxtLink
                    :to="link.cta.link"
                    @click="closeMenu()"
                    class="group inline-flex items-center gap-2 text-secondary-900 hover:text-secondary-800"
                  >
                    {{ link.cta.linkText }}
                    <Icon
                      name="fa6-solid:angle-right"
                      class="text-xs transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </Transition>
        </template>

        <NuxtLink
          v-else
          :to="link.link"
          :class="itemClass(isActive(link.link))"
        >
          {{ link.title }}
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink
      v-for="button in buttonLinks"
      :key="button.title"
      :to="button.link"
      class="group ml-4 inline-flex items-center gap-2 rounded-full bg-primary-900 px-5 py-3 font-normal text-white transition-colors hover:bg-primary-800"
    >
      {{ button.title }}
      <Icon
        name="fa6-solid:angle-right"
        class="text-xs transition-transform duration-200 group-hover:translate-x-1"
      />
    </NuxtLink>
  </nav>
</template>

<script lang="ts" setup>
import type { HeaderNavLink } from "~/types/HeaderNavLink.interface";

const props = defineProps({
  links: {
    type: Array as PropType<HeaderNavLink[]>,
    required: true,
  },
});

const route = useRoute();

const desktopLinks = computed(() =>
  props.links.filter((l) => !l.mobileOnly && l.variant !== "button")
);

const buttonLinks = computed(() =>
  props.links.filter((l) => l.variant === "button")
);

const navEl = ref<HTMLElement | null>(null);
const triggers: Record<string, HTMLElement> = {};

const openLink = ref<HeaderNavLink | null>(null);
// A click on a menu that hover just opened should keep it open, not close it
const openedByHover = ref(false);

let closeTimer: ReturnType<typeof setTimeout> | undefined;

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const isActive = (link?: string) => {
  if (!link) return false;
  return link === "/" ? route.path === "/" : route.path.startsWith(link);
};

const isSectionActive = (link: HeaderNavLink) =>
  !!link.children?.some((child) => isActive(child.link));

const itemClass = (active: boolean) => [
  "flex items-center rounded-full px-3 py-2 transition-colors hover:bg-primary-50",
  active ? "font-normal" : "font-light",
];

const cancelClose = () => clearTimeout(closeTimer);

const openMenu = (link: HeaderNavLink, viaHover = false) => {
  cancelClose();
  if (openLink.value !== link) {
    openedByHover.value = viaHover;
  }
  openLink.value = link;
};

const closeMenu = (returnFocus = false) => {
  cancelClose();
  const link = openLink.value;
  openLink.value = null;
  if (!link) return;

  const trigger = triggers[link.title];
  // The panel is hidden with v-show, so if focus was inside it (e.g. the
  // pointer drifted away mid-Tab) move it back to the trigger rather than
  // letting it fall to the top of the page
  const focusInPanel =
    trigger?.parentElement?.contains(document.activeElement) &&
    document.activeElement !== trigger;
  if (returnFocus || focusInPanel) {
    trigger?.focus();
  }
};

const scheduleClose = () => {
  cancelClose();
  closeTimer = setTimeout(() => closeMenu(), 150);
};

const toggleMenu = (link: HeaderNavLink) => {
  if (openLink.value === link && !openedByHover.value) {
    closeMenu();
  } else {
    openMenu(link);
    openedByHover.value = false;
  }
};

// Close when keyboard focus moves to something outside the menu item (its
// trigger and panel). No relatedTarget means a click on non-focusable content,
// such as text inside the panel, which shouldn't close it
const onFocusOut = (event: FocusEvent) => {
  const next = event.relatedTarget as Node | null;
  const item = event.currentTarget as HTMLElement;
  if (!next || item.contains(next)) return;
  closeMenu();
};

const onDocumentClick = (event: MouseEvent) => {
  if (openLink.value && !navEl.value?.contains(event.target as Node)) {
    closeMenu();
  }
};

watch(
  () => route.fullPath,
  () => closeMenu()
);

onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  cancelClose();
});
</script>
