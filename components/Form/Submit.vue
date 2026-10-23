<template>
  <!-- The end of every prescription form: what to expect, the spam check, and
       the send button -->
  <div class="space-y-5 border-t border-primary-900/10 pt-8">
    <p class="flex items-start gap-3 text-sm font-light text-slate-600">
      <Icon
        name="fa6-solid:circle-info"
        aria-hidden="true"
        class="mt-0.5 shrink-0 text-primary-400"
      />
      <span>
        We'll contact you by e-mail or phone within one business day. If you
        haven't heard from us by then, please call
        <a
          :href="`tel:${phone}`"
          class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
          >{{ phone }}</a
        >.
      </span>
    </p>

    <FormTurnstile />

    <button
      type="submit"
      :disabled="pending"
      class="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary-900 px-6 py-4 text-lg font-medium text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <!-- v-show rather than v-if: after a successful send the form clears
           its pending state as the page is already leaving, and swapping
           elements in a page mid-teardown breaks the navigation -->
      <Icon
        v-show="pending"
        name="fa6-solid:spinner"
        aria-hidden="true"
        class="animate-spin motion-reduce:animate-none"
      />
      <span
        v-if="icon"
        v-show="!pending"
        :class="['inline-flex overflow-hidden', iconMotion(icon)]"
      >
        <Icon :name="icon" aria-hidden="true" />
      </span>
      {{ pending ? pendingLabel : label }}
    </button>

    <p
      class="flex items-center justify-center gap-2 text-sm font-light text-slate-600"
    >
      <Icon name="fa6-solid:lock" aria-hidden="true" class="text-xs" />
      Sent securely over an encrypted connection
    </p>
  </div>
</template>

<script setup lang="ts">
import { businessInfo } from "~/constants/business";
import { iconMotion } from "~/constants/iconMotions";

withDefaults(
  defineProps<{
    label: string;
    pending: boolean;
    pendingLabel?: string;
    icon?: string;
  }>(),
  { pendingLabel: "Sending..." },
);

const phone = businessInfo.contact.phone.main;
</script>
