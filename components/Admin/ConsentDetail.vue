<template>
  <!-- A vaccine consent, read-only, in the form's own five sections. Shown
       even when it doesn't match the contract, with a warning: an unreadable
       consent is exactly the one a pharmacist needs to see -->
  <div class="space-y-5">
    <div
      v-if="problems.length"
      role="note"
      class="rounded-md bg-amber-50 p-3 text-amber-900 ring-1 ring-amber-200"
    >
      <p class="font-medium">This consent doesn't match the expected format. Check it with the patient.</p>
      <ul class="mt-1 list-inside list-disc text-xs font-light">
        <li v-for="problem in problems" :key="problem">{{ problem }}</li>
      </ul>
    </div>

    <section v-for="section in sections" :key="section.title">
      <h3 class="font-medium mb-2">{{ section.title }}</h3>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-light">
        <div
          v-for="row in section.rows"
          :key="row.label"
          :class="['flex gap-2', row.wide && 'sm:col-span-2']"
        >
          <dt class="text-gray-600 shrink-0">{{ row.label }}:</dt>
          <!-- Patients type line breaks into the detail boxes; preserve them -->
          <dd :class="['whitespace-pre-wrap', row.flag && 'font-medium text-red-800']">{{ row.value }}</dd>
        </div>
      </dl>
    </section>

    <section>
      <h3 class="font-medium mb-2">Signature</h3>
      <img
        v-if="signature"
        :src="`/api/admin/submissions/${submissionId}/files/${signature.id}`"
        :alt="`Signature of ${signerName || 'the patient'}`"
        class="h-28 w-auto max-w-full rounded-md bg-white p-2 ring-1 ring-gray-200"
      />
      <p v-else class="font-medium text-red-800">No signature was received.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { parseConsent, type ConsentPayload } from "~~/shared/consent";
import { DOSE_LABELS, vaccineFor } from "~~/shared/consentForm";
import { formatPhone } from "~~/shared/forms";
import type { SubmissionFileDTO } from "~~/shared/submissions";

const props = defineProps<{
  submissionId: string;
  payload: unknown;
  files: SubmissionFileDTO[];
}>();

interface Row {
  label: string;
  value: string;
  wide?: boolean;
  // A yes worth the pharmacist's eye
  flag?: boolean;
}

// Read loosely: every field may be missing on a malformed payload
type Loose = Partial<{
  [K in keyof ConsentPayload]: ConsentPayload[K] extends object
    ? Partial<ConsentPayload[K]>
    : ConsentPayload[K];
}>;
const c = computed(() => (props.payload ?? {}) as Loose);

const problems = computed(() => {
  const result = parseConsent(props.payload);
  return result.ok ? [] : result.issues;
});

const signature = computed(() => props.files.find((f) => f.role === "signature"));
const signerName = computed(() => c.value.acknowledgement?.signerName ?? "");

const ANSWERS: Record<string, string> = { yes: "Yes", no: "No", na: "Not applicable" };
const answer = (v: unknown) => (typeof v === "string" ? ANSWERS[v] ?? v : "(no answer)");
const phone = (v: unknown) => (typeof v === "string" && v ? formatPhone(v) : "");

function rows(list: (Row | false)[]): Row[] {
  return list.filter((r): r is Row => Boolean(r && r.value));
}

const sections = computed(() => {
  const p = c.value.patient ?? {};
  const ec = c.value.emergencyContact ?? {};
  const s = c.value.screening ?? {};
  const ack = c.value.acknowledgement ?? {};
  const items = Array.isArray(c.value.items) ? c.value.items : [];
  const forChild = c.value.forWhom === "child";

  const question = (label: string, key: keyof typeof s, detailKey?: keyof typeof s): Row[] => [
    { label, value: answer(s[key]), flag: s[key] === "yes", wide: true },
    ...(detailKey && s[detailKey] ? [{ label: "Details", value: String(s[detailKey]), wide: true }] : []),
  ];

  return [
    {
      title: "1 · About the patient",
      rows: rows([
        { label: "Vaccine for", value: forChild ? "Someone in their care" : c.value.forWhom === "me" ? "Themselves" : "" },
        { label: "Name", value: [p.firstName, p.lastName].filter(Boolean).join(" ") },
        { label: "Date of birth", value: p.dateOfBirth ?? "" },
        { label: "PHN", value: p.phn ?? "" },
        { label: "Sex at birth", value: p.sex === "male" ? "Male" : p.sex === "female" ? "Female" : p.sex ?? "" },
        { label: "Weight", value: p.weight ?? "" },
      ]),
    },
    {
      title: "2 · Contact",
      rows: rows([
        { label: "Cell phone", value: phone(p.phone) },
        { label: "Email", value: p.email ?? "" },
        { label: "Emergency contact", value: [ec.name, phone(ec.phone)].filter(Boolean).join(", ") },
      ]),
    },
    {
      title: "3 · Health questions",
      rows: rows([
        ...question("Sick today", "sick"),
        ...question("Allergies", "allergy", "allergyDetail"),
        ...question("Pregnant, or could be", "pregnant"),
        ...question("Fainted or serious reaction before", "reaction", "reactionDetail"),
        ...question("New or changing neurological condition", "neuro"),
        ...question("Bleeding condition or blood thinner", "bleeding", "bleedingDetail"),
      ]),
    },
    {
      title: "4 · Vaccines",
      rows: rows(
        items.map((item, i) => {
          const name = item.vaccine === "other"
            ? `Something else: ${item.otherText ?? "(not named)"}`
            : vaccineFor(item.vaccine)?.label ?? String(item.vaccine ?? "(none)");
          const parts = [
            name,
            item.dose ? DOSE_LABELS[item.dose] ?? item.dose : "",
            item.lastDoseDate ? `last dose ${item.lastDoseDate}` : "",
            item.reason ? `reason: ${item.reason}` : "",
          ];
          return { label: `Vaccine ${i + 1}`, value: parts.filter(Boolean).join(" · "), wide: true };
        }),
      ),
    },
    {
      title: "5 · Consent",
      rows: rows([
        { label: "Wants the vaccine(s)", value: ack.agreed === true ? "Yes" : "No", flag: ack.agreed !== true, wide: true },
        { label: "Signed by", value: ack.signerName ?? "" },
        {
          label: "Relationship",
          value: { self: "Self", parent: "Parent or guardian", rep: "Representative" }[ack.relationship ?? ""] ?? ack.relationship ?? "",
        },
        { label: "Signed at", value: ack.signedAt ? formatWhen(ack.signedAt) : "" },
      ]),
    },
  ];
});

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-CA", { timeZone: "America/Vancouver", dateStyle: "medium", timeStyle: "short" });
}
</script>
