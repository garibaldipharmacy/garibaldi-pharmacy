<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" @close="close" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 flex items-center"
              >
                <CircleIcon icon="fa6-solid:address-book" class="mr-2" /><span
                  >Contact Information</span
                >
              </DialogTitle>
              <div class="mt-4">
                <ul>
                  <li
                    v-for="option in contactOptions"
                    :key="option.title"
                    class="p-1"
                  >
                    <NuxtLink
                      :to="option.link"
                      class="text-primary-900 flex gap-2 flex-wrap"
                    >
                      <div>
                        <Icon :name="option.icon" class="mr-3" />
                        <span class="font-medium">{{ option.title }}</span>
                      </div>
                      <span
                        class="font-light w-full sm:w-auto sm:ml-auto text-sm sm:text-base"
                        >{{ option.value }}</span
                      >
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-900 focus-visible:ring-offset-2"
                  @click="close"
                >
                  Close
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
import { businessInfo } from "~/constants/business";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const { contact } = businessInfo;

const contactOptions = [
  {
    icon: "fa6-solid:phone",
    title: "Phone / Text",
    value: contact.phone.main,
    link: `tel:${contact.phone.main}`,
  },
  {
    icon: "fa6-solid:fax",
    title: "Fax",
    value: contact.phone.fax,
    link: `tel:${contact.phone.fax}`,
  },
  {
    icon: "fa6-solid:envelope",
    title: "Email",
    value: contact.email,
    link: `mailto:${contact.email}`,
  },
];

const close = () => emit("close");
</script>
