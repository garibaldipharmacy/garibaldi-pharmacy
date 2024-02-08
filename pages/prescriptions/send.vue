<template>
  <PrescriptionFormSelector />
  <PrescriptionHeader />
  <div class="container mx-auto mt-10 mb-10">
    <div class="flex flex-wrap gap-y-5 md:w-2/3 px-5">
      <p>
        <strong
          >The prescription MUST be provided to the pharmacist at the time of
          pickup.</strong
        >
      </p>
      <p>
        <strong
          >By completing this form, you consent to allow the collection and use
          of your personal information for the purpose of filling my
          prescription at Garibaldi Pharmacy and understand that all personal
          information will reside at Garibaldi Pharmacy.</strong
        >
      </p>
      <p class="font-light">
        A pharmacy staff member will contact you to when your prescription is
        ready.
      </p>
    </div>
    <form
      name="send-prescription"
      method="post"
      class="mt-10"
      netlify-honeypot="bot-field"
      data-netlify="true"
      enctype="multipart/form-data"
    >
      <input type="hidden" name="form-name" value="send-prescription" />
      <div
        class="grid gap-6 mb-6 md:grid-cols-2 shadow-lg border border-primary-100 rounded py-5 px-2"
      >
        <!-- Legal First Name -->
        <div class="col-span-2 px-5 sm:col-auto">
          <label
            for="first_name"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Legal First Name
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="Johnathon"
            required
          />
        </div>
        <!-- Legal Last Name -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="last_name"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Legal Last Name
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="Doe"
            required
          />
        </div>

        <div
          class="flex gap-5 w-full items-center col-span-2 px-5 sm:col-span-1 flex-wrap md:flex-nowrap"
        >
          <!-- Sex -->
          <div class="w-full">
            <label for="sex" class="flex mb-2 text-sm font-medium text-gray-900"
              >Sex
              <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
            /></label>
            <select
              name="sex"
              id="sex"
              class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            >
              <option selected disabled>Select Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <!-- Date of Birth -->
          <div class="w-full">
            <label
              for="date_of_birth"
              class="block mb-2 text-sm font-medium text-gray-900"
              >Date of Birth
              <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
            /></label>
            <input
              type="date"
              name="date_of_birth"
              id="date_of_birth"
              class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
              placeholder="Select date"
            />
          </div>
        </div>

        <!-- Personal Health Number -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="personal_health_number"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Personal Health Number
          </label>
          <input
            name="personal_health_number"
            type="text"
            id="personal_health_number"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="9123-456-789"
            pattern="9\d{3}-\d{3}-\d{3}"
            v-maska
            data-maska="####-###-###"
          />
        </div>

        <!-- Cell Phone Number -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="cell_phone_number"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Cell Phone Number
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            type="text"
            id="cell_phone_number"
            name="cell_phone_number"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="(604) 123-4567"
            v-maska
            data-maska="(###) ###-####"
            required
          />
        </div>

        <!-- Email -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Email</label
          >
          <input
            type="email"
            name="email"
            id="email"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="john@example.com"
          />
        </div>

        <div
          class="mx-5 col-span-2 bg-slate-200 flex-100 font-light p-5 rounded"
        >
          <p class="font-medium">
            Submit photos of prescription and any insurance plan cards:
          </p>
          <ul class="list-disc mt-3">
            <p>
              Please follow these instructions to ensure there are no delays in
              processing your prescription:
            </p>
            <li class="ml-5">
              Please place your prescription on a flat surface with adequate
              lighting
            </li>
            <li class="ml-5">
              Ensure you review each photo to ensure text is legible and in
              focus
            </li>
            <li class="ml-5">
              When taking photos of insurance plan cards, please take photos of
              both front and back of each card.
            </li>
          </ul>
        </div>

        <!-- Prescription Attachment -->
        <div class="w-full col-span-2 px-5 sm:col-span-1">
          <label
            for="prescription-file"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Prescription
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>

          <input
            type="file"
            name="prescription-file"
            id="prescription-file"
            accept="image/*,.pdf"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            required
          />
        </div>
        <!-- Prescription Attachment -->
        <div class="w-full col-span-2 px-5 sm:col-span-1">
          <label
            for="prescription-file-2"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Prescription
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>

          <input
            type="file"
            name="prescription-file-2"
            id="prescription-file-2"
            accept="image/*,.pdf"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
          />
        </div>
        <!-- Insurance Card -->
        <div class="w-full col-span-2 px-5 sm:col-span-1">
          <label
            for="insurance-card-front"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Insurance Card (Front)
          </label>

          <input
            type="file"
            name="insurance-card-front"
            id="insurance-card-front"
            accept="image/*,.pdf"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
          />
        </div>
        <!-- Insurance Card -->
        <div class="w-full col-span-2 px-5 sm:col-span-1">
          <label
            for="insurance-card-back"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Insurance Card (Back)
          </label>

          <input
            type="file"
            name="insurance-card-back"
            id="insurance-card-back"
            accept="image/*,.pdf"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
          />
        </div>

        <!-- Recapcha -->
        <!-- <div class="px-5" data-netlify-recaptcha="true"></div> -->

        <div class="col-span-2 px-5 sm:col-span-2">
          <button
            type="submit"
            class="bg-primary-900 text-white rounded py-2 px-5 hover:bg-primary-800 transition-colors w-full sm:w-auto"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
useSeoMeta({
  title: "Garibaldi Pharmacy | Send Prescription",
  description:
    "If you were given a paper prescription by your doctor, you may send it to us electronically so we can prepare it in advance and reduce your wait time.",
  ogTitle: "Garibaldi Pharmacy | Send Prescription",
  ogDescription:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/prescriptions/send",
  twitterTitle: "Garibaldi Pharmacy | Send Prescription",
  twitterDescription:
    "If you were given a paper prescription by your doctor, you may send it to us electronically so we can prepare it in advance and reduce your wait time.",
  twitterImage: "/favicon/android-chrome-512x512.png",
  twitterCard: "summary",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});
</script>

<style>
.uppy-Dashboard-inner {
  font-family: "Lexend", sans-serif;
}
</style>
