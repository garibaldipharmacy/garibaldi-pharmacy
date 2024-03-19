<template>
  <nav class="flex items-center ml-auto text-sm sm:text-base">
    <ul class="header-links ml-auto font-light text-primary-900 flex gap-5">
      <li v-for="link in links" :key="link.title">
        <div
          @mouseenter="showCard(link)"
          @mouseleave="hideCard"
          class="-mb-5 pb-5 group"
        >
          <NuxtLink
            :to="link.link"
            class="group-hover:opacity-60 transition-opacity relative inline-block"
          >
            <span>{{ link.title }}</span>
            <Icon
              v-if="link.children"
              name="flowbite:angle-down-solid"
              class="ml-2"
            />
          </NuxtLink>
          <Transition
            enter-from-class="opacity-0"
            enter-leave-class="opacity-100"
            enter-active-class="transition-opacity duration-300 ease-out"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            leave-active-class="transition-opacity duration-200 ease-in"
          >
            <div
              v-if="showingCard && link === hoveredLink"
              class="-mx-5 mt-3 absolute bg-white p-5 rounded-md shadow-[0_0_43px_-12px_rgba(0,0,0,0.25)] top-14 card"
            >
              <ul class="flex flex-col gap-5">
                <li v-for="child in link.children" :key="child.title">
                  <NuxtLink
                    :to="child.link"
                    class="pr-10 hover:opacity-60 transition-opacity"
                    ><Icon
                      :name="child.icon"
                      v-if="child.icon"
                      class="mr-2"
                    />{{ child.title }}</NuxtLink
                  >
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </li>
    </ul>

    <div class="ml-5">
      <NuxtLink
        to="/contact"
        class="p-3 px-5 rounded-full text-white font-normal bg-primary-900 hover:opacity-90 transition-all hover:scale-105 block"
        >Contact</NuxtLink
      >
    </div>
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

const showingCard = ref(false);
const hoveredLink = ref<HeaderNavLink | null>(null);

const showCard = (link: HeaderNavLink) => {
  if (link.children && link.children.length > 0) {
    hoveredLink.value = link;
    showingCard.value = true;
  }
};

const hideCard = () => {
  showingCard.value = false;
};
</script>

<style></style>
