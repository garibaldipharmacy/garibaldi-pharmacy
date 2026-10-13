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

        <FormErrorSummary ref="summary" :message="error" :errors="errors" />

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

        <!-- Sex -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label for="sex" class="block mb-2 text-sm font-medium text-gray-900"
            >Sex</label
          >
          <select
            id="sex"
            v-model="patient.sex"
            name="sex"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
          >
            <option :value="undefined" disabled>Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <FieldError :message="fieldError('patient.sex')" />
        </div>

        <!-- Date of Birth -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="date_of_birth"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Date of Birth
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
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

        <!-- Personal Health Number -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="personal_health_number"
            class="block mb-2 text-sm font-medium text-gray-900"
            >Personal Health Number</label
          >
          <input
            id="personal_health_number"
            v-model="patient.phn"
            v-maska
            type="text"
            name="personal_health_number"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="9123-456-789"
            data-maska="####-###-###"
          />
          <FieldError :message="fieldError('patient.phn')" />
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

        <!-- Pharmacy Name -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="pharmacy_name"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Pharmacy Name
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            id="pharmacy_name"
            v-model="fromPharmacyName"
            type="text"
            name="pharmacy_name"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="ABC Pharmacy"
            required
          />
          <FieldError :message="fieldError('fromPharmacyName')" />
        </div>

        <!-- Pharmacy Phone Number -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label
            for="pharmacy_phone_number"
            class="flex mb-2 text-sm font-medium text-gray-900"
            >Pharmacy Phone Number
            <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
          /></label>
          <input
            id="pharmacy_phone_number"
            v-model="fromPharmacyPhone"
            v-maska
            type="tel"
            name="pharmacy_phone_number"
            class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
            placeholder="(604) 123-4567"
            data-maska="(###) ###-####"
            required
          />
          <FieldError :message="fieldError('fromPharmacyPhone')" />
        </div>

        <!-- Transfer all eligible prescriptions? -->
        <div>
          <RadioGroup v-model="transferAll" class="col-span-2 px-5 sm:col-span-1">
            <RadioGroupLabel as="span">
              Transfer all eligible prescriptions?
            </RadioGroupLabel>
            <RadioGroupOption
              v-for="option in transferOptions"
              :key="String(option.value)"
              v-slot="{ checked }"
              :value="option.value"
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
                {{ option.label }}
              </span>
            </RadioGroupOption>
          </RadioGroup>

          <!-- Only needed when the patient is not transferring everything. -->
          <div v-if="!transferAll" class="col-span-2 px-5 sm:col-span-1 mt-5">
            <label
              for="medications"
              class="flex mb-2 text-sm font-medium text-gray-900"
            >
              <span
                >Please list medications you would like transferred by name and
                strength. For example: Ramipril 10mg capsules</span
              >
              <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1" />
            </label>
            <textarea
              id="medications"
              v-model="medications"
              placeholder="Ramipril 10mg capsules"
              name="medications"
              cols="30"
              rows="10"
              class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm"
            ></textarea>
            <FieldError :message="fieldError('medications')" />
          </div>
        </div>

        <!-- Notes for the Pharmacist -->
        <div class="col-span-2 px-5 sm:col-span-1">
          <label for="notes" class="block mb-2 text-sm font-medium text-gray-900"
            >Notes for the Pharmacist</label
          >
          <textarea
            id="notes"
            v-model="notes"
            placeholder="Enter notes here..."
            name="notes"
            cols="30"
            rows="10"
            class="border border-gray-300 bg-gray-50 rounded w-full font-light p-3 text-sm"
          ></textarea>
          <FieldError :message="fieldError('notes')" />
        </div>

        <div class="mx-5 col-span-2 bg-slate-200 flex-100 font-light p-5 rounded">
          <p>
            Note: If you do not receive a confirmation e-mail within 24 hours, please
            call {{ phoneMain }} for assistance.
          </p>
        </div>

        <div class="px-5 col-span-2">
          <FormTurnstile />
        </div>

        <div class="col-span-2 px-5 sm:col-span-2">
          <button
            type="submit"
            :disabled="pending"
            class="bg-primary-900 text-white rounded py-2 px-5 hover:bg-primary-800 transition-colors w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ pending ? "Sending..." : "Send Transfer Request" }}
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

useSeoMeta({
  title: "Transfer Prescriptions in Squamish | Garibaldi Pharmacy",
  description:
    "Easily transfer your prescriptions to Garibaldi Pharmacy in Squamish. Our pharmacists handle the process quickly and safely, ensuring your medications are ready when you need them.",
  ogTitle: "Transfer Prescriptions in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Easily transfer your prescriptions to Garibaldi Pharmacy in Squamish. Our pharmacists handle the process quickly and safely, ensuring your medications are ready when you need them.",
  ogImage: "/favicon/android-chrome-512x512.png",
  twitterTitle: "Transfer Prescriptions in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Easily transfer your prescriptions to Garibaldi Pharmacy in Squamish. Our pharmacists handle the process quickly and safely, ensuring your medications are ready when you need them.",
  twitterImage: "/favicon/android-chrome-512x512.png",
  twitterCard: "summary",
});

// Canonical and ogUrl come from `site.url` via nuxt-site-config rather than being
// hardcoded to production, which used to make staging claim the live canonical.
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" }],
});

const phoneMain = businessInfo.contact.phone.main;

const { pending, error, errors, errorRegion, botField, fieldError, submit } =
  useRequestForm("/success/transfer");
const summary = ref(null);

// Was the strings "Yes" and "No" in the submitted payload. Now a boolean, so the
// stored value cannot drift when the UI copy is edited.
const transferOptions = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const patient = reactive({
  firstName: "",
  lastName: "",
  sex: undefined,
  dateOfBirth: "",
  phn: "",
  phone: "",
  email: "",
});

const fromPharmacyName = ref("");
const fromPharmacyPhone = ref("");
const transferAll = ref(true);
const medications = ref("");
const notes = ref("");

watchEffect(() => {
  errorRegion.value = summary.value?.region ?? null;
});

async function onSubmit() {
  await submit({
    kind: "transfer",
    patient: { ...patient },
    fromPharmacyName: fromPharmacyName.value,
    fromPharmacyPhone: fromPharmacyPhone.value,
    transferAll: transferAll.value,
    medications: medications.value,
    notes: notes.value,
  });
}
</script>
