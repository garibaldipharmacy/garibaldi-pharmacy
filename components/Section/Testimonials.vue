<template>
  <section class="container mx-auto my-16 px-4">
    <TitleSection
      title="Trusted by the Squamish Community"
      description="See what our patients have to say about their experience with Garibaldi Pharmacy"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      <TestimonialCard
        name="Jennie M."
        review="A few weeks ago Dean caught a dosing error on a prescription from an ER resident for my toddler and promptly followed up with the doctor to confirm and correct it. Since then, I've needed the compounding services among other prescriptions, and each time we have been in he has followed up with me or my partner to see how our daughter is doing. He is absolutely lovely.

I never knew I would have a favourite pharmacist, but we're sold and won't be going anywhere else from now on. Highly recommend!"
      />
      <TestimonialCard
        name="Michelle S."
        review="I recently switched to Garibaldi Pharmacy, and I couldn't be happier with my decision. After dealing with multiple mistakes, long wait times, and impersonal service at the big chain pharmacies, I was ready for a change. That's when I found Dean at Garibaldi Pharmacy, and it's been a game-changer! Dean is extremely knowledgeable, thorough, and genuinely cares about his patients. He even calls to remind me when my prescriptions are due and has them ready, so there's no more waiting. My prescriptions are always filled within minutes—such a relief compared to my previous experiences with long lines and delays. I've since moved all of my prescriptions to Garibaldi Pharmacy, and I know I'm in great hands. Thank you, Dean, for your outstanding service!"
      />
      <TestimonialCard
        name="Muzzamil K."
        review="If you're in the Squamish area, this is the pharmacy to go to. Dean displayed amazing customer service and went above and beyond to answer any questions and concerns. I encourage anyone in the area to visit this pharmacy due to the amazing service, knowledge, and customer satisfaction that it strives towards."
      />
      <TestimonialCard
        name="Christina T."
        review="Dean is an amazing Pharmacist! His dedication to his patients is amazing, always looking out for them and trying to be as cost effective as possible. He helped my husband with a compound he made and it was honestly the best anti-inflammatory cream he ever had. I highly recommend him!"
      />
    </div>

    <!-- Link to Google Reviews -->
    <div class="text-center mt-10">
      <NuxtLink
        to="https://www.google.com/maps/place/Garibaldi+Pharmacy+%26+Compounding+Lab/@49.7534509,-123.1341054,17z/data=!4m8!3m7!1s0x5486f9aba5d1b65d:0xbf08346d48a7b8a6!8m2!3d49.7534509!4d-123.1341054!9m1!1b1!16s%2Fg%2F11vb7t_0bv"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-light text-sm"
      >
        <span>Read more reviews on Google</span>
        <Icon name="fa6-solid:arrow-up-right-from-square" class="text-xs" />
      </NuxtLink>
    </div>
  </section>
</template>

<script lang="ts" setup></script>

<style></style>
