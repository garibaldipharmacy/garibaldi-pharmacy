<template>
  <!-- Why a local compounding pharmacy matters: a photo beside the story of
       the Sea to Sky's first compounding pharmacy. Used on the About page and
       the Squamish landing page -->
  <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div
      v-reveal
      class="group grid overflow-hidden rounded-3xl bg-primary-50 md:grid-cols-2"
    >
      <div class="overflow-hidden">
        <img
          class="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 motion-reduce:transition-none"
          src="@/assets/images/squamish-pharmacist-medicine-to-patient-1440.webp"
          srcset="
            @/assets/images/squamish-pharmacist-medicine-to-patient-800.webp   800w,
            @/assets/images/squamish-pharmacist-medicine-to-patient-1440.webp 1440w,
            @/assets/images/squamish-pharmacist-medicine-to-patient-2400.webp 2400w
          "
          sizes="(min-width: 768px) 50vw, 100vw"
          width="1440"
          height="960"
          loading="lazy"
          alt="A pharmacist explaining a box of medication to a customer at the pharmacy counter"
        />
      </div>
      <div
        class="relative isolate flex flex-col justify-center p-8 pb-24 text-primary-900 sm:p-12 sm:pb-28"
      >
        <!-- Grows from the panel's bottom edge, under the text -->
        <LeafSprig class="absolute bottom-0 right-8 -z-10 h-28 w-24" />
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Local Experts
        </h2>
        <div class="mt-6 space-y-5 font-light leading-relaxed text-slate-600">
          <p class="text-lg text-primary-900">
            When you are issued a prescription by your doctor that calls for a
            medication or dosage form that is not commercially available, in
            many cases this must be outsourced to a compounding pharmacy in the
            Lower Mainland. Turnaround can usually take several days.
          </p>
          <p>
            Garibaldi Pharmacy is the Sea to Sky’s first compounding pharmacy.
            With our state-of-the-art clean room that is built to the latest
            regulatory standards, we can produce your customized medication
            in-house.
            <NuxtLink
              to="/services/compounding/"
              class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
              >Learn more about our compounding services.</NuxtLink
            >
          </p>
          <p>
            As local business owners, we want to serve the best interests of
            Squamish residents and be trusted professionals in the community.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
