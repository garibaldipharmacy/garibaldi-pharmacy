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

        <div class="mx-5 col-span-2 bg-slate-200 flex-100 font-light p-5 rounded">
          <p>
            Note: If you have previously submitted your insurance plan cards, the
            pharmacy will already have this in our system. You will only need to take
            a photo of your insurance plan cards if the information has changed.
          </p>
        </div>

        <!--
          Previously two hardcoded prescription inputs and two hardcoded insurance
          card pairs, because Netlify Forms required statically known field names.
          Now repeaters with an add button.
        -->
        <FormFileRepeater
          v-model="prescriptions"
          legend="Prescriptions"
          hint="Take a clear photo of the whole prescription, or attach a PDF."
          item-label="Prescription"
          plural-label="prescriptions"
          add-label="Add another prescription"
          error-prefix="prescriptions"
          :errors="errors"
          :fields="prescriptionFields"
          :max="LIMITS.maxPrescriptions"
          required
        />

        <FormFileRepeater
          v-model="insurance"
          legend="Insurance plan cards"
          hint="Optional. Only needed if your coverage is new or has changed."
          item-label="Insurance card"
          plural-label="insurance cards"
          add-label="Add another insurance card"
          error-prefix="insurance"
          :errors="errors"
          :fields="insuranceFields"
          :max="LIMITS.maxInsuranceCards"
          :min-rows="0"
        />

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
            {{ pending ? uploadLabel : "Send Prescription" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
// Registered here rather than globally so only the form pages load it
import { vMaska } from "maska";
import { computed, reactive, ref } from "vue";
import { businessInfo } from "~/constants/business";
import { LIMITS } from "~~/shared/forms";

useSeoMeta({
  title: "Send Prescriptions in Squamish | Garibaldi Pharmacy",
  description:
    "Send your prescription to Garibaldi Pharmacy in Squamish with ease. Our pharmacists provide fast, safe, and personalized medication services.",
  ogTitle: "Send Prescriptions in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Send your prescription to Garibaldi Pharmacy in Squamish with ease. Our pharmacists provide fast, safe, and personalized medication services.",
  ogImage: "/favicon/android-chrome-512x512.png",
  twitterTitle: "Send Prescriptions in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Send your prescription to Garibaldi Pharmacy in Squamish with ease. Our pharmacists provide fast, safe, and personalized medication services.",
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

const { pending, progress, error, errors, errorRegion, botField, fieldError, submit } =
  useRequestForm("/success/send");
const summary = ref(null);

const prescriptionFields = [{ key: "file", label: "Prescription", required: true }];
const insuranceFields = [
  { key: "front", label: "Front of card", required: true },
  {
    key: "back",
    label: "Back of card",
    hint: "Optional. Some cards have nothing on the back.",
  },
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

const prescriptions = ref([{ file: null }]);
const insurance = ref([]);

const uploadLabel = computed(() =>
  progress.value > 0 && progress.value < 100
    ? `Uploading ${progress.value}%`
    : "Sending...",
);

watchEffect(() => {
  errorRegion.value = summary.value?.region ?? null;
});

async function onSubmit() {
  // Build the multipart part names the server will look for. Keys are boring and
  // machine-generated; the patient's filename never becomes a lookup key or a path.
  const files = [];

  const chosenPrescriptions = prescriptions.value
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.file);

  for (const { row, index } of chosenPrescriptions) {
    const key = `rx_${index}`;
    files.push({ key, file: row.file });
  }

  const insurancePayload = [];
  insurance.value.forEach((row, index) => {
    if (!row.front) return;
    const frontKey = `ins_${index}_front`;
    files.push({ key: frontKey, file: row.front });

    const card = { front: { key: frontKey } };
    if (row.back) {
      const backKey = `ins_${index}_back`;
      files.push({ key: backKey, file: row.back });
      card.back = { key: backKey };
    }
    insurancePayload.push(card);
  });

  await submit(
    {
      kind: "send",
      patient: { ...patient },
      prescriptions: chosenPrescriptions.map(({ index }) => ({ key: `rx_${index}` })),
      insurance: insurancePayload,
    },
    files,
  );
}
</script>
