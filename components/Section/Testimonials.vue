<template>
  <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div
      v-reveal
      class="group grid gap-10 overflow-hidden rounded-3xl bg-primary-50 px-6 py-10 sm:px-12 sm:py-12 lg:grid-cols-[2fr_3fr] lg:gap-16 lg:py-14"
    >
      <div class="relative text-primary-900">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Trusted by the Squamish Community
        </h2>
        <p class="mt-4 text-lg font-light text-slate-600">
          See what our patients have to say about their experience with
          Garibaldi Pharmacy
        </p>

        <NuxtLink
          :to="businessInfo.links.google_reviews"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-8 inline-flex items-center gap-2 text-sm font-light text-slate-600 transition-colors hover:text-primary-900"
        >
          Read more reviews on Google
          <Icon name="fa6-solid:arrow-up-right-from-square" class="text-xs" />
          <span class="sr-only">(opens in a new tab)</span>
        </NuxtLink>

        <!-- Grows up from the panel's bottom edge into the space under the
             rating, on wide screens where that space exists -->
        <LeafSprig
          class="absolute -bottom-14 right-6 hidden h-40 w-32 lg:block"
        />
      </div>

      <!-- On phones the reviewer chips sit above the review, so switching never
           means scrolling past the space the longest review reserves -->
      <div class="flex flex-col">
        <!-- Every review is stacked in the same spot and all stay in the
             page for search engines; only the chosen one is shown. Stacking
             also keeps the panel the height of the longest review, so it
             doesn't jump when switching -->
        <div class="grid">
          <figure
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            :aria-hidden="index !== active"
            :class="[
              'col-start-1 row-start-1 transition-[opacity,visibility] duration-500',
              index === active ? 'opacity-100' : 'invisible opacity-0',
            ]"
          >
            <Icon
              name="fa6-solid:quote-left"
              aria-hidden="true"
              class="text-2xl text-primary-300"
            />
            <blockquote
              class="mt-4 space-y-4 text-lg font-light leading-relaxed text-primary-900"
            >
              <p v-for="paragraph in testimonial.review" :key="paragraph">
                {{ paragraph }}
              </p>
            </blockquote>
            <figcaption class="mt-5 text-sm font-medium text-primary-900">
              {{ testimonial.name }}
            </figcaption>
          </figure>
        </div>

        <div
          role="group"
          aria-label="Choose a review"
          class="order-first mb-6 flex flex-wrap gap-2 lg:order-none lg:mb-0 lg:mt-8"
        >
          <button
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            type="button"
            :aria-pressed="index === active"
            :class="[
              'flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm transition',
              index === active
                ? 'bg-white text-primary-900 shadow'
                : 'text-slate-600 hover:bg-white/70 hover:text-primary-900',
            ]"
            @click="active = index"
          >
            <span
              aria-hidden="true"
              class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-900 text-xs font-medium text-white"
            >
              {{ testimonial.name.charAt(0) }}
            </span>
            {{ testimonial.name }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { businessInfo } from "~/constants/business";

const active = ref(0);

// Hand-picked Google reviews, quoted as written. Each entry in review is a
// paragraph
const testimonials = [
  {
    name: "Jennie G.",
    review: [
      "A few weeks ago Dean caught a dosing error on a prescription from an ER resident for my toddler and promptly followed up with the doctor to confirm and correct it. Since then, I've needed the compounding services among other prescriptions, and each time we have been in he has followed up with me or my partner to see how our daughter is doing. He is absolutely lovely.",
      "I never knew I would have a favourite pharmacist, but we're sold and won't be going anywhere else from now on. Highly recommend!",
    ],
  },
  {
    name: "Muzzamil S.",
    review: [
      "If you're in the Squamish area, this is the pharmacy to go to. Dean displayed amazing customer service and went above and beyond to answer any questions and concerns. I encourage anyone in the area to visit this pharmacy due to the amazing service, knowledge, and customer satisfaction that it strives towards.",
    ],
  },
  {
    // Starts at its third sentence: the first two ("the best ... in
    // Squamish", "the most caring Pharmacist you'll ever find") compare the
    // pharmacy with others, which the College's marketing bylaws don't allow
    // (HPOA bylaws, Schedule D.4, s. 3(2)(d))
    name: "Jane C.",
    review: [
      "Efficient. Knowledgeable. Experienced.",
      "Conveniently located at the beautiful Wilfred Building on Dowad and Tantalus (entry on Tantalus)",
      "Garibaldi Pharmacy is attaches to the Terra Nova Medical Clinic (their patients can walk out of their appointment WITH their prescription filled!)",
      "Quickest route from your Doctor’s office is on Highway 99 north to the Dowad exit, take a right on Tantalus and you’re there",
      "+ I highly recommend you transfer your prescription from your current pharmacy! Dean will take care of it.",
    ],
  },
  {
    name: "Christina N.",
    review: [
      "Dean is an amazing Pharmacist! His dedication to his patients is amazing, always looking out for them and trying to be as cost effective as possible. He helped my husband with a compound he made and it was honestly the best anti-inflammatory cream he ever had. I highly recommend him!",
    ],
  },
];
</script>
