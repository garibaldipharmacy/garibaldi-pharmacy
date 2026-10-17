<template>
  <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div
      v-reveal
      class="group grid overflow-hidden rounded-3xl bg-primary-900 md:grid-cols-2"
    >
      <div
        class="relative isolate flex flex-col justify-center p-8 pb-32 text-white sm:p-12 sm:pb-36"
      >
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Why Us?</h2>
        <p class="mt-6 text-lg font-light leading-relaxed sm:text-xl">
          Since we are not a big-box pharmacy, our pharmacists can put patients
          first and strive to provide the best pharmaceutical and healthcare
          experience possible.
        </p>
        <p class="mt-5 font-light leading-relaxed text-white/70">
          We recognized the need for Squamish's growing population to have
          access to a primary healthcare provider who can follow their health
          journey. Our partnership with
          <NuxtLink
            to="https://www.terranovamedical.ca/"
            class="text-white underline underline-offset-4 hover:no-underline"
            >Terra Nova Medical Clinics</NuxtLink
          >
          aims to satisfy that need.
        </p>

        <!-- Layered mountain ridges, echoing the peaks in the logo -->
        <svg
          aria-hidden="true"
          viewBox="0 0 600 120"
          preserveAspectRatio="none"
          class="absolute inset-x-0 bottom-0 -z-10 h-28 w-full text-white"
        >
          <path
            class="why-us-ridge"
            d="M0 120V72l58-26 46 16 62-44 58 38 52-20 60 34 58-42 70 32 58-20 78 30v52z"
            fill="currentColor"
            fill-opacity="0.04"
          />
          <path
            class="why-us-ridge [transition-delay:150ms]"
            d="M0 120V96l78-26 58 18 72-30 60 28 62-14 58 20 66-26 68 22 78-12v64z"
            fill="currentColor"
            fill-opacity="0.07"
          />
        </svg>
      </div>
      <div class="overflow-hidden">
        <img
          src="@/assets/images/doctor-patient-consultation-squamish-720.webp"
          srcset="
            @/assets/images/doctor-patient-consultation-squamish-480.webp 480w,
            @/assets/images/doctor-patient-consultation-squamish-720.webp 720w
          "
          sizes="(min-width: 768px) 50vw, 100vw"
          width="720"
          height="639"
          loading="lazy"
          alt="A doctor going over notes with a patient during a consultation in an exam room"
          class="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
    </div>
  </section>
</template>
