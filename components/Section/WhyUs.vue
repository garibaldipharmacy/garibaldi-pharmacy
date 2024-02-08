<template>
  <section
    class="2xl:container 2xl:mx-auto flex justify-center my-10 flex-wrap"
  >
    <div
      class="md:basis-1/2 bg-primary-900 text-white p-10 flex flex-col justify-center"
    >
      <h2 class="font-bold text-2xl mb-10">Why Us?</h2>
      <div class="font-extralight">
        <p class="mb-10">
          Since we are not a big-box pharmacy, our pharmacists can put patients
          first and strive to provide the best pharmaceutical and healthcare
          experience possible.
        </p>
        <p>
          We recognized the need for Squamish's growing population to have
          access to a primary healthcare provider who can follow their health
          journey. Our partnership with
          <NuxtLink
            to="https://www.terranovamedical.ca/"
            class="underline hover:no-underline"
            >Terra Nova Medical Clinics</NuxtLink
          >
          aims to satisfy that need.
        </p>
      </div>
    </div>
    <div class="md:basis-1/2">
      <img
        src="@/assets/images/doctor-patient.jpg"
        alt="A doctor showing information on a clipboard to their patient while sitting inside an exam room."
      />
    </div>
  </section>
</template>

<script lang="ts" setup></script>

<style></style>
