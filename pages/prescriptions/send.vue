<template>
  <div class="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:pt-14 lg:pb-24">
    <PrescriptionFormSelector />
    <PrescriptionHeader />

    <form
      class="mt-10 space-y-8 rounded-3xl bg-primary-50 p-6 sm:p-10"
      novalidate
      @submit.prevent="onSubmit"
    >
      <FormErrorSummary ref="summary" :message="error" :errors="errors" />

      <p class="text-sm font-light text-slate-600">
        All fields are required unless marked optional.
      </p>

      <FormSection :step="1" title="About you">
        <FormField
          id="first_name"
          label="Legal First Name"
          :error="fieldError('patient.firstName')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="patient.firstName"
            type="text"
            name="first_name"
            class="form-input"
            autocomplete="given-name"
            required
          />
        </FormField>

        <FormField
          id="last_name"
          label="Legal Last Name"
          :error="fieldError('patient.lastName')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="patient.lastName"
            type="text"
            name="last_name"
            class="form-input"
            autocomplete="family-name"
            required
          />
        </FormField>

        <FormField
          id="date_of_birth"
          label="Date of Birth"
          :error="fieldError('patient.dateOfBirth')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="patient.dateOfBirth"
            type="date"
            name="date_of_birth"
            class="form-input"
            autocomplete="bday"
            required
          />
        </FormField>

        <FormField
          id="sex"
          label="Sex"
          optional
          :error="fieldError('patient.sex')"
          v-slot="{ field }"
        >
          <select
            v-bind="field"
            v-model="patient.sex"
            name="sex"
            class="form-input"
          >
            <option :value="undefined" disabled>Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </FormField>

        <FormField
          id="personal_health_number"
          label="Personal Health Number"
          hint="On the back of your BC Services Card, driver's licence or CareCard."
          optional
          :error="fieldError('patient.phn')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="patient.phn"
            v-maska
            type="text"
            name="personal_health_number"
            class="form-input"
            placeholder="9123-456-789"
            data-maska="####-###-###"
          />
        </FormField>
      </FormSection>

      <FormSection :step="2" title="How we can reach you">
        <FormField
          id="cell_phone_number"
          label="Cell Phone Number"
          :error="fieldError('patient.phone')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="patient.phone"
            v-maska
            type="tel"
            name="cell_phone_number"
            class="form-input"
            placeholder="(604) 123-4567"
            data-maska="(###) ###-####"
            autocomplete="tel"
            required
          />
        </FormField>

        <FormField
          id="email"
          label="Email"
          :error="fieldError('patient.email')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="patient.email"
            type="email"
            name="email"
            class="form-input"
            autocomplete="email"
            required
          />
        </FormField>
      </FormSection>

      <!--
        Previously two hardcoded prescription inputs and two hardcoded insurance
        card pairs, because Netlify Forms required statically known field names.
        Now repeaters with an add button.
      -->
      <FormSection :step="3" title="Your prescription">
        <FormFileRepeater
          v-model="prescriptions"
          legend="Prescriptions"
          hide-legend
          hint="Take a clear photo of the whole prescription, or attach a PDF."
          item-label="Prescription"
          plural-label="prescriptions"
          add-label="Add another prescription"
          editor-note="Make sure the whole prescription, including the prescriber's signature, is visible."
          error-prefix="prescriptions"
          :errors="errors"
          :fields="prescriptionFields"
          :max="LIMITS.maxPrescriptions"
          required
        />
      </FormSection>

      <FormSection
        :step="4"
        title="Insurance plan cards (optional)"
        description="If you have previously submitted your insurance plan cards, the pharmacy will already have this in our system. You will only need to take a photo of your insurance plan cards if the information has changed."
      >
        <FormFileRepeater
          v-model="insurance"
          legend="Insurance plan cards (optional)"
          hide-legend
          hint="Only if you have coverage and it is new or has changed. Having insurance is not required to send us a prescription."
          item-label="Insurance card"
          plural-label="insurance cards"
          add-label="Add an insurance card"
          editor-note="Make sure the whole card is visible, including your name and plan details."
          error-prefix="insurance"
          :errors="errors"
          :fields="insuranceFields"
          :max="LIMITS.maxInsuranceCards"
          :min-rows="0"
        />
      </FormSection>

      <FormSubmit
        label="Send Prescription"
        :pending-label="uploadLabel"
        :pending="pending"
        icon="fa6-solid:prescription"
      />

      <!-- Honeypot. Hidden from people, irresistible to bots. Last in the form so
           its hidden box adds no spacing above anything -->
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
    </form>
  </div>
</template>

<script setup>
// Registered here rather than globally so only the form pages load it
import { vMaska } from "maska";
import { computed, reactive, ref } from "vue";
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

const { pending, progress, error, errors, errorRegion, botField, fieldError, submit } =
  useRequestForm("/success/send");
const summary = ref(null);

const prescriptionFields = [{ key: "file", label: "Prescription", required: true }];
const insuranceFields = [
  { key: "front", label: "Front of card" },
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
