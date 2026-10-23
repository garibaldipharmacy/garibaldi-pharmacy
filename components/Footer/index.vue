<template>
  <footer class="text-white">
    <!-- Mountain ridges rising out of the footer, echoing the peaks in the
         logo and the Why Us panel. It sits on whatever the page above ends
         with, so it never overlaps page content -->
    <svg
      v-reveal
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      class="-mb-px block h-20 w-full sm:h-32"
    >
      <path
        d="M0 120V70l90-18 80 14 90-36 80 28 80-14 100 34 90-42 90-24 90 34 80-12 90 30 90-24 100 30 90-32 100 22 100-16v76z"
        class="ridge fill-primary-800"
      />
      <path
        d="M700 12L672 19.5 683 23 692 19.5 701 25 711 20.5 720 24 728 22.6z"
        class="ridge fill-white/70"
      />
      <path
        d="M0 120V96l110-18 90 14 110-26 100 22 90-8 100 18 120-28 110 20 100-14 110 20 110-22 110 16 100-10 80 8v32z"
        class="ridge ridge--front fill-primary-900"
      />
    </svg>

    <div class="bg-primary-900">
      <div class="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:px-6 lg:pt-14">
        <div class="grid gap-12 lg:grid-cols-[1.4fr_1fr_auto]">
          <FooterInfo />
          <FooterLinks />
          <FooterHours />
        </div>
        <p class="mt-12 max-w-2xl text-xs font-light text-primary-300">
          Garibaldi Pharmacy is licensed by the College of Pharmacists of
          British Columbia. The college registrant who is the manager of the
          record is Dean George. All pharmacy practice issues may be reported
          directly to the College of Pharmacists of BC via their
          <NuxtLink
            class="underline hover:no-underline"
            href="https://www.bcpharmacists.org/"
            >website</NuxtLink
          >.
        </p>
        <FooterLower />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
/* The back ridge lifts into place, then the front one, as the footer
   scrolls into view. Hidden only while v-reveal is waiting */
.ridge {
  transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) 150ms;
}

.ridge--front {
  transition-delay: 300ms;
}

.reveal:not(.is-revealed) .ridge {
  transform: translateY(60%);
}
</style>
