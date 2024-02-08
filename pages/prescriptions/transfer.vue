<template>
  <PrescriptionFormSelector />
  <PrescriptionHeader />
  <div class="container mx-auto mt-10 mb-10">
    <form
      name="transfer-prescription"
      method="post"
      class="mt-10"
      netlify-honeypot="bot-field"
      data-netlify-recaptcha="true"
      data-netlify="true"
      enctype="multipart/form-data"
    >
      <input type="hidden" name="form-name" value="transfer-prescription" />
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

        <!-- Pharmacy Name -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="pharmacy_name"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Pharmacy Name
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            type="text"
            id="pharmacy_name"
            name="pharmacy_name"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="ABC Pharmacy"
            required
          />
        </div>

        <!-- Pharmacy Phone Number -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="pharmacy_phone_number"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Pharmacy Phone Number
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            type="text"
            id="pharmacy_phone_number"
            name="pharmacy_phone_number"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="(604) 123-4567"
            v-maska
            data-maska="(###) ###-####"
            required
          />
        </div>

        <!-- Transfer all eligible prescriptions? -->
        <div>
          <RadioGroup
            v-model="selected"
            name="options"
            class="col-span-2 px-5 sm:col-span-1"
          >
            <RadioGroupLabel>
              Transfer all eligible prescriptions?
            </RadioGroupLabel>
            <RadioGroupOption
              v-for="option in options"
              :key="option"
              :value="option"
              v-slot="{ active, checked }"
            >
              <span
                class="font-light cursor-pointer hover:text-secondary-900 flex items-center gap-2 transition-colors"
              >
                <Icon
                  v-if="checked"
                  name="fa6-solid:circle-check"
                  class="text-secondary-900"
                />
                <Icon v-else name="fa6-regular:circle" class="" />
                {{ option }}
              </span>
            </RadioGroupOption>
          </RadioGroup>

          <div
            v-if="selected === `No`"
            class="col-span-2 px-5 sm:col-span-1 mt-5"
          >
            <label
              for="prescription-list"
              class="block mb-2 text-sm font-medium text-gray-900"
              >Please list medications you would like transferred by name and
              strength. For example: Ramipril 10mg capsules</label
            >
            <textarea
              placeholder="Ramipril 10mg capsules"
              name="prescription-list"
              id="prescription-list"
              cols="30"
              rows="10"
              class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm"
            ></textarea>
          </div>
        </div>
        <!-- Notes for Pharmacist -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="pharmacist-notes"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Notes for the Pharmacist</label
          >
          <textarea
            placeholder="Enter notes here..."
            name="pharmacist-notes"
            id="pharmacist-notes"
            cols="30"
            rows="10"
            class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm"
          ></textarea>
        </div>

        <!-- Recapcha -->
        <recaptcha class="px-5" />

        <div class="col-span-2 px-5 sm:col-span-2">
          <button
            type="submit"
            class="bg-primary-900 text-white rounded py-2 px-5 hover:bg-primary-800 transition-colors w-full sm:w-auto"
          >
            Request Transfer
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

useSeoMeta({
  title: "Garibaldi Pharmacy | Transfer Prescription",
  description:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  ogTitle: "Garibaldi Pharmacy | Transfer Prescription",
  ogDescription:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/prescriptions/transfer",
  twitterTitle: "Garibaldi Pharmacy | Transfer Prescription",
  twitterDescription:
    "By completing this form, you consent to allow our pharmacy staff to contact your current pharmacy for a transfer of your medication.",
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
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";

const options = ["Yes", "No"];
const selected = ref(options[0]);
</script>
