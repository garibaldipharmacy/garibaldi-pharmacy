<template>
  <div class="space-y-5 text-sm">
    <section>
      <h3 class="font-medium mb-2">Patient</h3>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-light">
        <div v-for="row in patientRows" :key="row.label" class="flex gap-2">
          <dt class="text-gray-600 shrink-0">{{ row.label }}:</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="requestRows.length">
      <h3 class="font-medium mb-2">Request</h3>
      <dl class="space-y-2 font-light">
        <div v-for="row in requestRows" :key="row.label">
          <dt class="text-gray-600">{{ row.label }}</dt>
          <!-- Patients type line breaks into these; preserve them. -->
          <dd class="whitespace-pre-wrap">{{ row.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="detail.files.length">
      <h3 class="font-medium mb-2">Attachments</h3>
      <ul class="space-y-1 font-light">
        <li v-for="file in detail.files" :key="file.id">
          <!-- Images open in a new tab; PDFs download, as the server sends them -->
          <a
            :href="`/api/admin/submissions/${detail.id}/files/${file.id}`"
            :target="file.mime === 'application/pdf' ? undefined : '_blank'"
            :rel="file.mime === 'application/pdf' ? undefined : 'noopener'"
            class="text-primary-900 hover:underline"
          >
            {{ FILE_ROLE_LABELS[file.role] ?? file.role }} {{ file.position + 1 }}
          </a>
          <span v-if="file.mime === 'application/pdf'" class="text-gray-600">
            &middot; PDF, downloads
          </span>
          <span class="text-gray-600"> &middot; {{ humanSize(file.bytes) }}</span>
        </li>
      </ul>
    </section>

    <p class="text-xs font-light text-gray-500">
      Ref {{ detail.reference }} &middot; received {{ formatWhen(detail.receivedAt) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { FILE_ROLE_LABELS, type SubmissionDetailDTO } from "~~/shared/submissions";
import { formatPhone, RETRIEVAL_METHODS } from "~~/shared/forms";

const props = defineProps<{ detail: SubmissionDetailDTO }>();

interface Row {
  label: string;
  value: string;
}

function push(rows: Row[], label: string, value: unknown) {
  if (value === undefined || value === null || value === "") return;
  rows.push({ label, value: String(value) });
}

const patientRows = computed<Row[]>(() => {
  const p = props.detail.payload?.patient;
  const rows: Row[] = [];
  if (!p) return rows;

  push(rows, "Name", [p.firstName, p.lastName].filter(Boolean).join(" "));
  push(rows, "Date of birth", p.dateOfBirth);
  push(rows, "Phone", p.phone ? formatPhone(p.phone) : "");
  push(rows, "Email", p.email);
  // Only present on transfer and send.
  push(rows, "Sex", (p as { sex?: string }).sex);
  push(rows, "PHN", (p as { phn?: string }).phn);
  return rows;
});

const requestRows = computed<Row[]>(() => {
  const payload = props.detail.payload as Record<string, unknown> | undefined;
  const rows: Row[] = [];
  if (!payload) return rows;

  if (payload.kind === "refill") {
    push(rows, "Medications", payload.medications);
    push(
      rows,
      "Retrieval",
      RETRIEVAL_METHODS[payload.retrievalMethod as keyof typeof RETRIEVAL_METHODS],
    );
    push(rows, "Special instructions", payload.specialInstructions);
  }

  if (payload.kind === "transfer") {
    push(rows, "Transferring from", payload.fromPharmacyName);
    push(
      rows,
      "Their phone",
      payload.fromPharmacyPhone ? formatPhone(String(payload.fromPharmacyPhone)) : "",
    );
    push(rows, "Transfer all eligible", payload.transferAll ? "Yes" : "No");
    push(rows, "Medications", payload.medications);
    push(rows, "Notes for the pharmacist", payload.notes);
  }

  return rows;
});

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
</script>
