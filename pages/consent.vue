<template>
  <div class="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:pt-14 lg:pb-24">
    <!-- The prescription forms' header (PrescriptionHeader), for a page that
         isn't one of them -->
    <header class="text-primary-900">
      <h1
        class="motion-rise flex items-center gap-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
      >
        <span
          aria-hidden="true"
          class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-100 text-xl text-secondary-900 sm:h-14 sm:w-14 sm:text-2xl"
        >
          <Icon name="fa6-solid:syringe" />
        </span>
        Vaccine Consent
      </h1>
      <p
        class="motion-rise mt-5 text-lg font-light text-slate-600 [animation-delay:150ms]"
      >
        Fill this in before your appointment so your pharmacist can review it
        ahead of time. They'll go over it with you before anything is given.
      </p>
    </header>

    <form
      class="mt-10 space-y-8 rounded-3xl bg-primary-50 p-6 sm:p-10"
      novalidate
      @submit.prevent="onSubmit"
    >
      <FormErrorSummary ref="summary" :message="error" :errors="summaryErrors" />

      <p class="text-sm font-light text-slate-600">
        All fields are required unless marked optional.
      </p>

      <FormSection :step="1" title="About you">
        <FormChoice
          id="for_whom"
          v-model="form.forWhom"
          label="Who is getting the vaccine?"
          :options="forWhomOptions"
          :error="fieldError('forWhom')"
          class="sm:col-span-2"
        />

        <FormField
          id="first_name"
          label="Legal First Name"
          :error="fieldError('patient.firstName')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="form.patient.firstName"
            type="text"
            name="first_name"
            class="form-input"
            :autocomplete="forMe ? 'given-name' : 'off'"
            maxlength="100"
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
            v-model="form.patient.lastName"
            type="text"
            name="last_name"
            class="form-input"
            :autocomplete="forMe ? 'family-name' : 'off'"
            maxlength="100"
            required
          />
        </FormField>

        <FormField
          id="date_of_birth"
          label="Date of Birth"
          hint="Year, month, day: YYYY-MM-DD"
          :error="fieldError('patient.dateOfBirth')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="form.patient.dateOfBirth"
            v-maska
            data-maska="####-##-##"
            type="text"
            inputmode="numeric"
            name="date_of_birth"
            placeholder="YYYY-MM-DD"
            class="form-input"
            :autocomplete="forMe ? 'bday' : 'off'"
            required
          />
        </FormField>

        <FormField
          id="phn"
          label="Personal Health Number"
          hint="The 10-digit number on your BC Services Card. Numbers only."
          :error="phnError"
          v-slot="{ field }"
        >
          <!-- No maxlength: it would cut a pasted "9123 456 789" short before
               the spaces are stripped -->
          <input
            v-bind="field"
            :value="form.patient.phn"
            type="text"
            inputmode="numeric"
            name="phn"
            class="form-input"
            placeholder="9123456789"
            autocomplete="off"
            required
            @input="onPhn"
            @blur="phnTouched = true"
          />
        </FormField>

        <FormChoice
          id="sex"
          v-model="form.patient.sex"
          label="Sex at Birth"
          :options="sexOptions"
          :error="fieldError('patient.sex')"
        />

        <FormField
          v-if="!forMe"
          id="weight"
          label="Weight"
          hint="Some doses depend on weight for children."
          :error="fieldError('patient.weight')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="form.patient.weight"
            type="text"
            name="weight"
            class="form-input"
            placeholder="e.g. 24 kg"
            maxlength="40"
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
            v-model="form.patient.phone"
            v-maska:[PHONE_MASK_OPTIONS]
            type="tel"
            name="cell_phone_number"
            class="form-input"
            placeholder="(604) 123-4567"
            autocomplete="tel"
            required
          />
        </FormField>

        <FormField
          id="email"
          label="Email"
          optional
          :error="fieldError('patient.email')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="form.patient.email"
            type="email"
            name="email"
            class="form-input"
            autocomplete="email"
            maxlength="200"
          />
        </FormField>

        <FormField
          id="ec_name"
          label="Emergency Contact Name"
          :error="fieldError('emergencyContact.name')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="form.emergencyContact.name"
            type="text"
            name="ec_name"
            class="form-input"
            autocomplete="off"
            maxlength="100"
            required
          />
        </FormField>

        <FormField
          id="ec_phone"
          label="Emergency Contact Phone"
          :error="fieldError('emergencyContact.phone')"
          v-slot="{ field }"
        >
          <input
            v-bind="field"
            v-model="form.emergencyContact.phone"
            v-maska:[PHONE_MASK_OPTIONS]
            type="tel"
            name="ec_phone"
            class="form-input"
            placeholder="(604) 123-4567"
            autocomplete="off"
            required
          />
        </FormField>
      </FormSection>

      <FormSection
        :step="3"
        title="A few health questions"
        description="Answering yes won't stop you from getting vaccinated. Your pharmacist will talk it through with you."
      >
        <template v-for="q in shownQuestions" :key="q.key">
          <div class="sm:col-span-2">
            <FormChoice
              :id="q.key"
              v-model="form.screening[q.key]"
              :label="q.text"
              :options="yesNoOptions"
              :error="fieldError(`screening.${q.key}`)"
            />
          </div>
          <FormField
            v-if="q.more && form.screening[q.key] === 'yes'"
            :id="`${q.key}_detail`"
            :label="q.more"
            :error="fieldError(`screening.${q.key}Detail`)"
            class="-mt-2 sm:col-span-2"
            v-slot="{ field }"
          >
            <textarea
              v-bind="field"
              v-model="form.screening[`${q.key}Detail`]"
              :name="`${q.key}_detail`"
              rows="2"
              :maxlength="MAX_DETAIL"
              class="form-input"
              required
            ></textarea>
          </FormField>
        </template>
      </FormSection>

      <FormSection
        :step="4"
        title="Your vaccines"
        :description="`Choose each vaccine or injection you'd like. You can list up to ${MAX_ITEMS}.`"
      >
        <fieldset class="min-w-0 sm:col-span-2">
          <legend class="sr-only">Vaccines</legend>
          <ul class="space-y-3">
            <li
              v-for="(item, i) in form.items"
              :key="item.key"
              class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-900/10 sm:p-5"
            >
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-semibold text-primary-900">Vaccine {{ i + 1 }}</span>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-light text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  @click="removeItem(i)"
                >
                  <Icon name="fa6-solid:xmark" aria-hidden="true" />
                  Remove<span class="sr-only"> vaccine {{ i + 1 }}</span>
                </button>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <FormField
                  :id="`vaccine_${i}`"
                  label="Vaccine or injection"
                  :error="fieldError(`items.${i}.vaccine`)"
                  class="min-w-0"
                  v-slot="{ field }"
                >
                  <select
                    v-bind="field"
                    v-model="item.vaccine"
                    :name="`vaccine_${i}`"
                    class="form-input"
                    required
                    @change="onVaccine(item)"
                  >
                    <option value="" disabled>Choose one…</option>
                    <option v-for="v in CONSENT_VACCINES" :key="v.id" :value="v.id">
                      {{ v.label }}
                    </option>
                  </select>
                </FormField>

                <FormField
                  :id="`reason_${i}`"
                  label="Reason"
                  :error="fieldError(`items.${i}.reason`)"
                  class="min-w-0"
                  v-slot="{ field }"
                >
                  <input
                    v-bind="field"
                    v-model="item.reason"
                    type="text"
                    :name="`reason_${i}`"
                    :maxlength="MAX_REASON"
                    class="form-input"
                  />
                </FormField>

                <FormField
                  v-if="item.vaccine === 'other'"
                  :id="`other_${i}`"
                  label="Which vaccine or injection?"
                  :error="fieldError(`items.${i}.otherText`)"
                  class="min-w-0 sm:col-span-2"
                  v-slot="{ field }"
                >
                  <input
                    v-bind="field"
                    v-model="item.otherText"
                    type="text"
                    :name="`other_${i}`"
                    maxlength="60"
                    class="form-input"
                    required
                  />
                </FormField>

                <FormField
                  v-if="asksDose(item.vaccine)"
                  :id="`dose_${i}`"
                  label="Which dose is this?"
                  :error="fieldError(`items.${i}.dose`)"
                  class="min-w-0"
                  v-slot="{ field }"
                >
                  <select
                    v-bind="field"
                    v-model="item.dose"
                    :name="`dose_${i}`"
                    class="form-input"
                  >
                    <option v-for="dose in DOSE_CHOICES" :key="dose" :value="dose">
                      {{ DOSE_LABELS[dose] }}
                    </option>
                  </select>
                </FormField>

                <FormField
                  v-if="asksDose(item.vaccine) && asksLastDose(item.dose)"
                  :id="`last_dose_${i}`"
                  label="Date of your last dose"
                  optional
                  :error="fieldError(`items.${i}.lastDoseDate`)"
                  class="min-w-0"
                  v-slot="{ field }"
                >
                  <input
                    v-bind="field"
                    v-model="item.lastDoseDate"
                    v-maska
                    data-maska="####-##-##"
                    type="text"
                    inputmode="numeric"
                    :name="`last_dose_${i}`"
                    placeholder="YYYY-MM-DD, if you know it"
                    class="form-input"
                    autocomplete="off"
                  />
                </FormField>
              </div>

              <!-- For reference only: nothing on the form depends on it -->
              <a
                v-if="HEALTHLINK_URLS[item.vaccine]"
                :href="HEALTHLINK_URLS[item.vaccine]"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 inline-flex items-center gap-2 text-sm font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
              >
                <Icon name="fa6-solid:circle-info" aria-hidden="true" class="text-primary-400" />
                About this vaccine on HealthLinkBC
                <span class="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <div class="mt-3">
            <button
              type="button"
              :disabled="form.items.length >= MAX_ITEMS"
              class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-primary-900 shadow-sm ring-1 ring-primary-900/20 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              @click="addItem"
            >
              <Icon name="fa6-solid:plus" aria-hidden="true" />
              Add another vaccine
            </button>
          </div>
        </fieldset>
      </FormSection>

      <FormSection :step="5" title="Your consent">
        <div class="space-y-5 sm:col-span-2">
          <p
            class="rounded-2xl bg-white p-5 text-sm font-light leading-relaxed text-slate-600 shadow-sm ring-1 ring-primary-900/10"
          >
            I have read, or had explained to me, information about the vaccine(s)
            listed above, including their benefits and risks. I have had the chance
            to ask questions and have them answered. I agree to wait in the pharmacy
            for 15 minutes (or as long as the pharmacist advises) afterwards. I
            understand I can withdraw this consent at any time before the vaccine is
            given.
          </p>

          <div>
            <label
              for="agreed"
              :class="[
                'flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 shadow-sm',
                fieldError('acknowledgement.agreed') ? 'ring-2 ring-red-400' : 'ring-1 ring-primary-900/20',
              ]"
            >
              <input
                id="agreed"
                v-model="form.agreed"
                type="checkbox"
                name="agreed"
                class="mt-0.5 h-5 w-5 shrink-0 accent-primary-900"
                :aria-invalid="fieldError('acknowledgement.agreed') ? 'true' : undefined"
                :aria-describedby="fieldError('acknowledgement.agreed') ? 'agreed-error' : undefined"
                required
              />
              <span class="font-medium text-primary-900">
                I want to receive the vaccine(s) listed above.
              </span>
            </label>
            <FieldError id="agreed-error" :message="fieldError('acknowledgement.agreed')" />
          </div>

          <!-- Only asked when signing for someone else; otherwise it's "self" -->
          <FormChoice
            v-if="!forMe"
            id="relationship"
            v-model="form.relationship"
            label="How are you related to them?"
            :options="relationshipOptions"
            :error="fieldError('acknowledgement.relationship')"
          />

          <FormField
            id="signer_name"
            label="Your Full Name (as you sign)"
            :error="fieldError('acknowledgement.signerName')"
            v-slot="{ field }"
          >
            <input
              v-bind="field"
              v-model="form.signerName"
              type="text"
              name="signer_name"
              class="form-input"
              autocomplete="name"
              maxlength="100"
              required
            />
          </FormField>

          <FormSignaturePad
            id="signature"
            ref="pad"
            v-model:signed="signed"
            :max-bytes="SIGNATURE_MAX_BYTES"
            :error="fieldError('signature')"
          />
        </div>
      </FormSection>

      <FormSubmit label="Send Consent Form" :pending="pending" icon="fa6-solid:syringe">
        <template #note>
          Your pharmacist will review this before your appointment and go over it
          with you in person. Questions? Call
          <a
            :href="`tel:${phone}`"
            class="font-normal text-primary-700 underline underline-offset-4 hover:no-underline"
            >{{ phone }}</a
          >.
        </template>
      </FormSubmit>

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
import { computed, nextTick, reactive, ref, watch } from "vue";
import { businessInfo } from "~/constants/business";
import { CONSENT_VACCINES, DOSE_CHOICES, MAX_DETAIL, MAX_ITEMS, MAX_REASON } from "~~/shared/consent";
import {
  DOSE_LABELS,
  HEALTHLINK_URLS,
  PHN_ERROR,
  SIGNATURE_MAX_BYTES,
  SIGNATURE_PART,
  asksDose,
  asksLastDose,
  asksPregnancy,
  buildConsentPayload,
  cleanPhn,
  emptyConsentForm,
  emptyConsentItem,
  validateConsentForm,
  vaccineFor,
} from "~~/shared/consentForm";
import { PHONE_MASK_OPTIONS } from "~~/shared/forms";

const DESCRIPTION =
  "Fill in your vaccine consent form before your appointment at Garibaldi Pharmacy in Squamish, so your pharmacist can review it ahead of time.";

useSeoMeta({
  title: "Vaccine Consent Form | Garibaldi Pharmacy",
  description: DESCRIPTION,
  ogTitle: "Vaccine Consent Form | Garibaldi Pharmacy",
  ogDescription: DESCRIPTION,
  ...shareImages.dog,
  twitterTitle: "Vaccine Consent Form | Garibaldi Pharmacy",
  twitterDescription: DESCRIPTION,
});

// Canonical and ogUrl come from `site.url`, as on the prescription forms
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" }],
});

const phone = businessInfo.contact.phone.main;

const { pending, error, errors, errorRegion, botField, fieldError, submit } =
  useRequestForm("/success/consent");
const summary = ref(null);
const pad = ref(null);
const signed = ref(false);

// Each card keeps a key of its own, so removing one doesn't move another's
// answers into it
let nextKey = 0;
const newItem = () => ({ ...emptyConsentItem(), key: nextKey++ });

const form = reactive({ ...emptyConsentForm(), items: [newItem()] });
const forMe = computed(() => form.forWhom === "me");

const forWhomOptions = [
  { value: "me", label: "Me" },
  { value: "child", label: "Someone in my care" },
];
const sexOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
const relationshipOptions = [
  { value: "parent", label: "Parent or guardian" },
  { value: "rep", label: "Representative" },
];

const questions = [
  { key: "sick", short: "Sick today", text: "Are you sick today, with a fever above 38°C, trouble breathing or an active infection?" },
  { key: "allergy", short: "Allergies", text: "Are you allergic to any medications, vaccines or vaccine ingredients (such as eggs, latex, neomycin or polysorbate 80)?", more: "Which allergies, and what happens?" },
  { key: "pregnant", short: "Pregnant", text: "Are you pregnant, or could you be?" },
  { key: "reaction", short: "Fainting or reactions", text: "Have you ever fainted or had a serious reaction after an injection or vaccine?", more: "What happened?" },
  { key: "neuro", short: "Neurological condition", text: "Do you have a new or changing neurological condition?" },
  { key: "bleeding", short: "Bleeding or blood thinners", text: "Do you have a bleeding condition, or take a blood thinner (such as warfarin or aspirin)?", more: "Which one?" },
];

// A male patient never sees the pregnancy question; the payload says "na"
const shownQuestions = computed(() =>
  questions.filter((q) => q.key !== "pregnant" || asksPregnancy(form.patient.sex)),
);
watch(
  () => form.patient.sex,
  (sex) => {
    if (!asksPregnancy(sex)) form.screening.pregnant = "";
  },
);

// PHN: digits only as they type or paste, never shortened
const phnTouched = ref(false);
function onPhn(e) {
  const cleaned = cleanPhn(e.target.value);
  form.patient.phn = cleaned;
  e.target.value = cleaned;
}
const phnError = computed(
  () =>
    fieldError("patient.phn") ??
    (phnTouched.value && form.patient.phn.length !== 10 ? PHN_ERROR : undefined),
);

function onVaccine(item) {
  item.reason = vaccineFor(item.vaccine)?.reason ?? "";
}
function addItem() {
  if (form.items.length < MAX_ITEMS) form.items.push(newItem());
}
function removeItem(i) {
  form.items.splice(i, 1);
}

// The summary says which question or card each problem is on, as several
// share wording like "Answer yes or no"
const summaryErrors = computed(() => {
  const out = {};
  for (const [path, message] of Object.entries(errors.value)) {
    const question = questions.find((q) => path === `screening.${q.key}` || path === `screening.${q.key}Detail`);
    const card = /^items\.(\d+)\./.exec(path);
    if (question) out[path] = `${question.short}: ${message}`;
    else if (card) out[path] = `Vaccine ${Number(card[1]) + 1}: ${message}`;
    else out[path] = message;
  }
  return out;
});

// Point the composable at the summary so a failed submit moves focus there.
watchEffect(() => {
  errorRegion.value = summary.value?.region ?? null;
});

async function showErrors(found) {
  errors.value = found;
  error.value = "Please check the highlighted fields and try again.";
  await nextTick();
  errorRegion.value?.focus();
}

async function onSubmit() {
  if (pending.value) return;
  phnTouched.value = true;

  const found = validateConsentForm(form, { hasSignature: signed.value });
  if (Object.keys(found).length) return showErrors(found);

  const png = await pad.value?.toPng();
  if (!png) return showErrors({ signature: "Your signature didn't save. Please clear it and sign again." });

  await submit(buildConsentPayload(form, new Date()), [
    { key: SIGNATURE_PART, file: new File([png], "signature.png", { type: "image/png" }) },
  ]);
}
</script>
