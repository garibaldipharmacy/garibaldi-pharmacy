<template>
  <div class="ml-auto">
    <button @click="toggleOpen" class="text-primary-900">
      <div
        :class="['tham', 'tham-e-spin', 'tham-w-6', { 'tham-active': open }]"
      >
        <div class="tham-box">
          <div class="tham-inner bg-primary-900" />
        </div>
      </div>
    </button>

    <TransitionRoot as="template" :show="open">
      <Dialog as="div" class="relative z-10" @close="open = false">
        <TransitionChild
          as="template"
          enter="ease-in-out duration-500"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in-out duration-500"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div
              class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
            >
              <TransitionChild
                as="template"
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enter-from="translate-x-full"
                enter-to="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leave-from="translate-x-0"
                leave-to="translate-x-full"
              >
                <DialogPanel
                  class="pointer-events-auto relative mt-16 w-screen max-w-md"
                >
                  <div
                    class="flex h-full flex-col overflow-y-scroll bg-white pt-2 shadow-xl"
                  >
                    <div class="relative mt-4 flex-1 px-4 sm:px-6">
                      <ul>
                        <li
                          v-for="link in links"
                          :key="link.title"
                          class="py-2"
                        >
                          <div
                            @click="toggleChild(link)"
                            class="flex items-center"
                          >
                            <NuxtLink :to="link.link" @click="closeDialog">
                              <span class="text-primary-900 cursor-pointer">
                                {{ link.title }}
                              </span>
                            </NuxtLink>
                            <Icon
                              v-if="link.children"
                              class="ml-2"
                              :name="
                                link.expanded
                                  ? 'flowbite:angle-top-solid'
                                  : 'flowbite:angle-down-solid'
                              "
                            />
                          </div>
                          <Transition name="fade">
                            <ul
                              v-if="link.children && link.expanded"
                              class="pl-4 bg-primary-50 rounded py-2 my-4"
                            >
                              <li
                                v-for="child in link.children"
                                :key="child.title"
                                class="py-2"
                              >
                                <NuxtLink
                                  :to="child.link"
                                  class="text-primary-900 hover:opacity-75 transition-colors"
                                  ><Icon
                                    v-if="child.icon"
                                    :name="child.icon"
                                    class="mr-4"
                                  />{{ child.title }}</NuxtLink
                                >
                              </li>
                            </ul>
                          </Transition>
                        </li>
                      </ul>
                    </div>
                    <div class="bg-primary-200 text-primary-900 text-xs p-2">
                      <ul class="font-light flex flex-col gap-2">
                        <li>
                          <Icon name="fa6-solid:phone" class="mr-2" />{{
                            phoneMain
                          }}
                        </li>
                        <li>
                          <Icon name="fa6-solid:clock" class="mr-2" />{{
                            hours
                          }}
                        </li>
                        <li>
                          <Icon name="fa6-solid:location-dot" class="mr-2" />{{
                            location
                          }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
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

const props = defineProps({
  links: {
    type: Array as PropType<HeaderNavLink[]>,
    required: true,
  },
});

// Define the open state
const open = ref(false);

// Function to toggle the open state
const toggleOpen = () => {
  open.value = !open.value;
};

// Function to toggle child links
const toggleChild = (link: HeaderNavLink) => {
  if (link.children) {
    link.expanded = !link.expanded;
  }
};

const closeDialog = () => {
  open.value = false;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-leave,
.fade-enter-to {
  opacity: 1;
}
</style>
