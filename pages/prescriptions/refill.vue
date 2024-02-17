<template>
  <PrescriptionFormSelector />
  <PrescriptionHeader />
  <div class="container mx-auto mt-10 mb-10">
    <form
      name="refill-prescription"
      method="post"
      class="mt-10"
      netlify-honeypot="bot-field"
      data-netlify="true"
      enctype="multipart/form-data"
    >
      <input type="hidden" name="form-name" value="refill-prescription" />
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
          class="flex gap-5 w-full items-center col-span-2 px-5 sm:col-span-1"
        >
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
            >Email<Icon
              name="fa6-solid:asterisk"
              class="text-red-600 text-xs ml-1"
            />
          </label>
          <input
            type="email"
            name="email"
            id="email"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="john@example.com"
            required
          />
        </div>

        <!-- Prescriptions to be refilled -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="pharmacist-notes"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Please list the medications you would like refilled by the most
            recent prescription number <strong>OR</strong> provide the name or
            description of the medication.</label
          >
          <textarea
            placeholder="Enter medications here..."
            name="pharmacist-notes"
            id="pharmacist-notes"
            cols="30"
            rows="10"
            class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm"
          ></textarea>
        </div>

        <!-- Pickup or delivery radio buttons -->
        <div>
          <RadioGroup
            v-model="selected"
            name="options"
            class="col-span-2 px-5 sm:col-span-1"
          >
            <RadioGroupLabel> Medication Retrieval </RadioGroupLabel>
            <RadioGroupOption
              v-for="option in options"
              :key="option"
              :value="option"
              class=""
              v-slot="{ active, checked }"
            >
              <span
                class="font-light cursor-pointer hover:text-secondary-900 transition-colors"
              >
                <Icon
                  v-if="checked"
                  name="fa6-solid:circle-check"
                  class="text-secondary-900 mr-3"
                />
                <Icon v-else name="fa6-regular:circle" class="mr-3" />
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
        <!-- Special Instructions -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="special-instructions"
            class="block mb-3 text-sm font-medium text-gray-900"
            >Special Instructions</label
          >
          <span class="text-sm font-light"
            >Please add any extra details that you think we may need to know
            when filling your prescription.</span
          >
          <textarea
            placeholder="Enter notes here..."
            name="special-instructions"
            id="special-instructions"
            cols="30"
            rows="10"
            class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm mt-3"
          ></textarea>
        </div>

        <div
          class="mx-5 col-span-2 bg-slate-200 flex-100 font-light p-5 rounded"
        >
          <p>
            Note: If you do not receive an automated e-mail message or phone
            call within 24-hours to confirm your refill request, please call
            {{ phoneMain }} for assistance.
          </p>
        </div>

        <!-- Recapcha -->
        <div class="px-5" data-netlify-recaptcha="true"></div>

        <div class="col-span-2 px-5 sm:col-span-2">
          <button
            type="submit"
            class="bg-primary-900 text-white rounded py-2 px-5 hover:bg-primary-800 transition-colors w-full sm:w-auto"
          >
            Send Refill Request
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { businessInfo } from "~/constants/business";

useSeoMeta({
  title: "Garibaldi Pharmacy | Refill Prescription",
  description:
    "By completing the form below, the information will be provided to our pharmacy staff to confirm and refill your prescription.",
  ogTitle: "Garibaldi Pharmacy | Refill Prescription",
  ogDescription:
    "By completing the form below, the information will be provided to our pharmacy staff to confirm and refill your prescription.",
  ogImage: "/favicon/android-chrome-512x512.png",
  ogUrl: "https://garibaldipharmacy.com/prescriptions/refill",
  twitterTitle: "Garibaldi Pharmacy | Refill Prescription",
  twitterDescription:
    "By completing the form below, the information will be provided to our pharmacy staff to confirm and refill your prescription.",
  twitterImage: "/favicon/android-chrome-512x512.png",
  twitterCard: "summary",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "canonical",
      href: "https://garibaldipharmacy.com/prescriptions/refill",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon/favicon-32x32.png",
    },
  ],
});

const phoneMain = businessInfo.contact.phone.main;

const options = [
  "I will pickup my prescription",
  "I would like my prescription delivered (may be a reasonable delivery charge)",
];
const selected = ref(options[0]);
</script>
