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

      <FormSection :step="3" title="Your current pharmacy">
        <FormField
          id="pharmacy_name"
          label="Pharmacy Name"
          :error="fieldError('fromPharmacyName')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="fromPharmacyName"
            type="text"
            name="pharmacy_name"
            class="form-input"
            autocomplete="organization"
            required
          />
        </FormField>

        <FormField
          id="pharmacy_phone_number"
          label="Pharmacy Phone Number"
          :error="fieldError('fromPharmacyPhone')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="fromPharmacyPhone"
            v-maska
            type="tel"
            name="pharmacy_phone_number"
            class="form-input"
            placeholder="(604) 123-4567"
            data-maska="(###) ###-####"
            required
          />
        </FormField>

        <FormChoice
          v-model="transferAll"
          label="Transfer all eligible prescriptions?"
          :options="transferOptions"
          class="sm:col-span-2"
        />

        <!-- Only needed when the patient is not transferring everything. -->
        <FormField
          v-if="!transferAll"
          id="medications"
          label="Medications to transfer"
          hint="List each by name and strength. For example: Ramipril 10mg capsules"
          :error="fieldError('medications')"
          class="sm:col-span-2"
          v-slot="{ field }"
        >
          <textarea
            v-bind="field"
            v-model="medications"
            name="medications"
            rows="4"
            class="form-input"
            required
          ></textarea>
        </FormField>
      </FormSection>

      <FormSection :step="4" title="Anything else?">
        <FormField
          id="notes"
          label="Notes for the Pharmacist"
          optional
          :error="fieldError('notes')"
          class="sm:col-span-2"
          v-slot="{ field }"
        >
          <textarea
            v-bind="field"
            v-model="notes"
            name="notes"
            rows="4"
            class="form-input"
          ></textarea>
        </FormField>
      </FormSection>

      <FormSubmit
        label="Send Transfer Request"
        :pending="pending"
        icon="fa6-solid:paper-plane"
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
import { reactive, ref } from "vue";

useSeoMeta({
  title: "Transfer Prescriptions in Squamish | Garibaldi Pharmacy",
  description:
    "Easily transfer your prescriptions to Garibaldi Pharmacy in Squamish. Our pharmacists handle the process quickly and safely, ensuring your medications are ready when you need them.",
  ogTitle: "Transfer Prescriptions in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Easily transfer your prescriptions to Garibaldi Pharmacy in Squamish. Our pharmacists handle the process quickly and safely, ensuring your medications are ready when you need them.",
  ...shareImages.dog,
  twitterTitle: "Transfer Prescriptions in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Easily transfer your prescriptions to Garibaldi Pharmacy in Squamish. Our pharmacists handle the process quickly and safely, ensuring your medications are ready when you need them.",
});

// Canonical and ogUrl come from `site.url` via nuxt-site-config rather than being
// hardcoded to production, which used to make staging claim the live canonical.
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" }],
});

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
