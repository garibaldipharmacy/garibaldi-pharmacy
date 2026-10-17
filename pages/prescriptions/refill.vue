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

      <FormSection :step="3" title="Your refill">
        <FormField
          id="medications"
          label="Medications to refill"
          hint="List them by the most recent prescription number, or give the name or description of the medication."
          :error="fieldError('medications')"
          class="sm:col-span-2"
          v-slot="{ field }"
        >
          <!-- Previously optional, so a refill could be submitted listing nothing. -->
          <textarea
            v-bind="field"
            v-model="medications"
            name="medications"
            rows="4"
            class="form-input"
            required
          ></textarea>
        </FormField>

        <FormChoice
          v-model="retrievalMethod"
          label="Medication Retrieval"
          :options="retrievalOptions"
          class="sm:col-span-2"
        />
      </FormSection>

      <FormSection :step="4" title="Anything else?">
        <FormField
          id="special-instructions"
          label="Special Instructions"
          hint="Please add any extra details that you think we may need to know when filling your prescription."
          optional
          :error="fieldError('specialInstructions')"
          class="sm:col-span-2"
          v-slot="{ field }"
        >
          <textarea
            v-bind="field"
            v-model="specialInstructions"
            name="special-instructions"
            rows="4"
            class="form-input"
          ></textarea>
        </FormField>
      </FormSection>

      <FormSubmit
        label="Send Refill Request"
        :pending="pending"
        icon="fa6-solid:prescription-bottle"
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
import { RETRIEVAL_METHODS } from "~~/shared/forms";

useSeoMeta({
  title: "Refill Prescriptions in Squamish | Garibaldi Pharmacy",
  description:
    "Refill your prescriptions quickly at Garibaldi Pharmacy in Squamish. Our expert pharmacists ensure your medications are ready when you need them.",
  ogTitle: "Refill Prescriptions in Squamish | Garibaldi Pharmacy",
  ogDescription:
    "Refill your prescriptions quickly at Garibaldi Pharmacy in Squamish. Our expert pharmacists ensure your medications are ready when you need them.",
  ...shareImages.dog,
  twitterTitle: "Refill Prescriptions in Squamish | Garibaldi Pharmacy",
  twitterDescription:
    "Refill your prescriptions quickly at Garibaldi Pharmacy in Squamish. Our expert pharmacists ensure your medications are ready when you need them.",
});

// Canonical and ogUrl are generated from `site.url` by nuxt-site-config. They used
// to be hardcoded to the production domain, which made staging advertise the live
// site as its own canonical.
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" }],
});

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

// Short titles, with the original wording kept as each option's description.
// The key (pickup or delivery) is what gets submitted
const retrievalOptions = [
  {
    value: "pickup",
    label: "Pickup",
    icon: "fa6-solid:store",
    description: RETRIEVAL_METHODS.pickup,
  },
  {
    value: "delivery",
    label: "Delivery",
    icon: "fa6-solid:truck",
    description: RETRIEVAL_METHODS.delivery,
  },
];
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
