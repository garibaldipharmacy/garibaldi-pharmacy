<template>
  <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
    <div
      class="group relative isolate overflow-hidden rounded-3xl bg-primary-50 px-6 py-12 text-center text-primary-900 sm:px-12 sm:py-16"
    >
      <LeafSprig
        class="absolute -bottom-2 right-6 -z-10 hidden h-32 w-24 sm:block"
      />
      <span
        aria-hidden="true"
        class="motion-rise-in mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary-700 text-2xl text-white shadow-md"
      >
        <Icon name="fa6-solid:check" />
      </span>
      <h2 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        {{ title }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-lg font-light text-slate-600">
        <slot />
      </p>

      <!-- The reference the server issued, for the patient to quote if they
           call. Only shown when it has the server's format, so an edited link
           can't put other text on the page -->
      <p
        v-if="reference"
        class="mx-auto mt-8 inline-flex flex-col items-center rounded-2xl bg-white px-6 py-3 shadow-sm ring-1 ring-primary-900/10"
      >
        <span class="text-sm font-light text-slate-600">Your reference number</span>
        <span class="font-mono text-xl font-semibold tracking-widest">{{
          reference
        }}</span>
      </p>

      <p
        class="mx-auto mt-8 flex max-w-xl items-start justify-center gap-3 text-left text-sm font-light text-slate-600"
      >
        <Icon
          name="fa6-solid:circle-info"
          aria-hidden="true"
          class="mt-0.5 shrink-0 text-primary-400"
        />
        <span>
          Note: If you do not receive an automated e-mail message or phone call
          within 24-hours to confirm your {{ confirming }}, please call
          <a
            :href="`tel:${phone}`"
            class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
            >{{ phone }}</a
          >
          for assistance.
        </span>
      </p>

      <NuxtLink
        to="/"
        class="mt-10 inline-flex items-center gap-2 rounded-full bg-primary-900 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
      >
        Back to home
        <Icon name="fa6-solid:arrow-right" aria-hidden="true" class="text-sm" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { businessInfo } from "~/constants/business";

defineProps<{
  title: string;
  // Completes "...to confirm your ___", e.g. "refill request"
  confirming: string;
}>();

const phone = businessInfo.contact.phone.main;

const route = useRoute();
const reference = computed(() => {
  const ref = route.query.ref;
  return typeof ref === "string" && /^[A-F0-9]{8}$/.test(ref) ? ref : null;
});
</script>
