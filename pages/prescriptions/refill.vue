<template>
  <PrescriptionFormSelector />
  <PrescriptionHeader />
  <div class="container mx-auto mt-10 mb-10">
    <form class="mt-10" novalidate @submit.prevent="onSubmit">
      <div
        class="grid gap-6 mb-6 md:grid-cols-2 shadow-lg border border-primary-100 rounded py-5 px-2"
      >
        <!-- Honeypot. Hidden from people, irresistible to bots. -->
        <div class="hidden" aria-hidden="true">
          <label for="bot-field">Do not fill this in</label>
          <input
            id="bot-field"
            v-model="botField"
            type="text"
            name="bot-field"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <FormErrorSummary
          ref="summary"
          :message="error"
          :errors="errors"
        />

        <!-- Legal First Name -->
        <div class="col-span-2 px-5 sm:col-auto">
          <label for="first_name" class="flex mb-2 text-sm font-medium text-gray-900"
            >Legal First Name
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            id="first_name"
            v-model="patient.firstName"
            type="text"
            name="first_name"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="Johnathon"
            autocomplete="given-name"
            required
          />
          <FieldError :message="fieldError('patient.firstName')" />
        </div>

        <!-- Legal Last Name -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label for="last_name" class="flex mb-2 text-sm font-medium text-gray-900"
            >Legal Last Name
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            id="last_name"
            v-model="patient.lastName"
            type="text"
            name="last_name"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="Doe"
            autocomplete="family-name"
            required
          />
          <FieldError :message="fieldError('patient.lastName')" />
        </div>

        <div class="flex gap-5 w-full items-center col-span-2 px-5 sm:col-span-1">
          <!-- Date of Birth -->
          <div class="w-full">
            <label
              for="date_of_birth"
              class="flex mb-2 text-sm font-medium text-gray-900"
              >Date of Birth
              <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
            /></label>
            <!-- Previously showed a required asterisk with no `required` attribute. -->
            <input
              id="date_of_birth"
              v-model="patient.dateOfBirth"
              type="date"
              name="date_of_birth"
              class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
              placeholder="Select date"
              autocomplete="bday"
              required
            />
            <FieldError :message="fieldError('patient.dateOfBirth')" />
          </div>
        </div>

        <!-- Cell Phone Number -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="cell_phone_number"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Cell Phone Number
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            id="cell_phone_number"
            v-model="patient.phone"
            v-maska
            type="tel"
            name="cell_phone_number"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="(604) 123-4567"
            data-maska="(###) ###-####"
            autocomplete="tel"
            required
          />
          <FieldError :message="fieldError('patient.phone')" />
        </div>

        <!-- Email -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label for="email" class="flex mb-2 text-sm font-medium text-gray-900"
            >Email
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            id="email"
            v-model="patient.email"
            type="email"
            name="email"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="john@example.com"
            autocomplete="email"
            required
          />
          <FieldError :message="fieldError('patient.email')" />
        </div>

        <!-- Medications to be refilled -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="medications"
            class="flex mb-2 text-sm font-medium text-gray-900"
          >
            <span
              >Please list the medications you would like refilled by the most recent
              prescription number <strong>OR</strong> provide the name or description
              of the medication.</span
            >
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1" />
          </label>
          <!-- Previously optional, so a refill could be submitted listing nothing. -->
          <textarea
            id="medications"
            v-model="medications"
            placeholder="Enter medications here..."
            name="medications"
            cols="30"
            rows="10"
            class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm"
            required
          ></textarea>
          <FieldError :message="fieldError('medications')" />
        </div>

        <!-- Pickup or delivery -->
        <div>
          <RadioGroup
            v-model="retrievalMethod"
            class="col-span-2 px-5 sm:col-span-1"
          >
            <RadioGroupLabel as="span">Medication Retrieval</RadioGroupLabel>
            <RadioGroupOption
              v-for="(label, value) in RETRIEVAL_METHODS"
              :key="value"
              v-slot="{ checked }"
              :value="value"
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
                {{ label }}
              </span>
            </RadioGroupOption>
          </RadioGroup>
        </div>

        <!-- Special Instructions -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="special-instructions"
            class="block mb-3 text-sm font-medium text-gray-900"
            >Special Instructions</label
          >
          <span class="text-sm font-light"
            >Please add any extra details that you think we may need to know when
            filling your prescription.</span
          >
          <textarea
            id="special-instructions"
            v-model="specialInstructions"
            placeholder="Enter notes here..."
            name="special-instructions"
            cols="30"
            rows="10"
            class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm mt-3"
          ></textarea>
          <FieldError :message="fieldError('specialInstructions')" />
        </div>

        <div class="mx-5 col-span-2 bg-slate-200 flex-100 font-light p-5 rounded">
          <p>
            Note: If you do not receive a confirmation e-mail within 24 hours, please
            call {{ phoneMain }} for assistance.
          </p>
        </div>

        <!-- Cloudflare Turnstile replaces Netlify's reCAPTCHA. -->
        <div class="px-5 col-span-2">
          <FormTurnstile />
        </div>

        <div class="col-span-2 px-5 sm:col-span-2">
          <button
            type="submit"
            :disabled="pending"
            class="bg-primary-900 text-white rounded py-2 px-5 hover:bg-primary-800 transition-colors w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ pending ? "Sending..." : "Send Refill Request" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
// Registered here rather than globally so only the form pages load it
import { vMaska } from "maska";
import { reactive, ref } from "vue";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { businessInfo } from "~/constants/business";
import { RETRIEVAL_METHODS } from "~~/shared/forms";

useSeoMeta({
  title: "Refill Prescriptions in Squamish | Garibaldi Pharmacy",
  description:
    "Refill your prescriptions quickly at Garibaldi Pharmacy in Squamish. Our expert pharmacists ensure your medications are ready when you need them.",
  ogTitle: "Refill Prescriptions in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Refill your prescriptions quickly at Garibaldi Pharmacy in Squamish. Our expert pharmacists ensure your medications are ready when you need them.",
  ogImage: "/favicon/android-chrome-512x512.png",
  twitterTitle: "Refill Prescriptions in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Refill your prescriptions quickly at Garibaldi Pharmacy in Squamish. Our expert pharmacists ensure your medications are ready when you need them.",
  twitterImage: "/favicon/android-chrome-512x512.png",
  twitterCard: "summary",
});

// Canonical and ogUrl are generated from `site.url` by nuxt-site-config. They used
// to be hardcoded to the production domain, which made staging advertise the live
// site as its own canonical.
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" }],
});

const phoneMain = businessInfo.contact.phone.main;

const { pending, error, errors, errorRegion, botField, fieldError, submit } =
  useRequestForm("/success/refill");
const summary = ref(null);

const patient = reactive({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
});
const medications = ref("");
const retrievalMethod = ref("pickup");
const specialInstructions = ref("");

// Point the composable at the summary so a failed submit moves focus there.
watchEffect(() => {
  errorRegion.value = summary.value?.region ?? null;
});

async function onSubmit() {
  await submit({
    kind: "refill",
    patient: { ...patient },
    medications: medications.value,
    retrievalMethod: retrievalMethod.value,
    specialInstructions: specialInstructions.value,
  });
}
</script>
