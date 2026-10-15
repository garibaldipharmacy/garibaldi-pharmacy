<template>
  <div class="container mx-auto my-10 px-4 max-w-5xl">
    <!-- Generic until signed in: an anonymous visitor should not learn what
         this page holds, only that it needs a password. -->
    <h1 class="text-3xl font-bold mb-6">{{ heading }}</h1>

    <!-- Not configured: say so plainly rather than failing in a confusing way. -->
    <div
      v-if="session && !session.configured"
      class="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p class="font-medium">This area is not available.</p>
      <!-- The setup hint is useful to whoever is configuring the box and useless
           to everyone else, so it only appears in development. -->
      <p v-if="isDev" class="mt-1 font-light">
        Set <code>ADMIN_PASSWORD_HASH</code> in <code>.env</code>, then restart.
        Generate one with <code>node scripts/hash-admin-password.mjs</code>.
      </p>
    </div>

    <!-- Sign in -->
    <form
      v-else-if="session && !session.authenticated"
      class="max-w-sm rounded border border-primary-100 p-6 shadow"
      novalidate
      @submit.prevent="signIn"
    >
      <label for="password" class="block mb-2 text-sm font-medium text-gray-900">
        Password
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
        required
      />
      <p
        v-if="loginError"
        role="status"
        aria-live="polite"
        class="mt-2 text-sm text-red-700"
      >
        {{ loginError }}
      </p>
      <button
        type="submit"
        :disabled="signingIn"
        class="mt-4 bg-primary-900 text-white rounded py-2 px-5 hover:bg-primary-800 transition-colors disabled:opacity-60"
      >
        {{ signingIn ? "Signing in..." : "Sign in" }}
      </button>
    </form>

    <!-- Signed in -->
    <div v-else-if="session">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-light text-gray-600" role="status" aria-live="polite">
          {{ submissions.length }}
          {{ submissions.length === 1 ? "submission" : "submissions" }}
          <template v-if="searchedFor">matching “{{ searchedFor }}”</template>
        </p>
        <div class="flex gap-4">
          <button
            type="button"
            class="text-sm text-primary-900 hover:underline"
            @click="refresh"
          >
            Refresh
          </button>
          <button
            type="button"
            class="text-sm text-gray-600 hover:underline"
            @click="signOut"
          >
            Sign out
          </button>
        </div>
      </div>

      <!-- Searches every stored submission, not just the ones listed -->
      <div class="mb-4">
        <label for="admin-search" class="mb-1 block text-sm font-medium text-gray-900">
          Search
        </label>
        <input
          id="admin-search"
          v-model="search"
          type="search"
          autocomplete="off"
          placeholder="Reference, name, phone, email, medication…"
          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm font-light text-gray-900"
        />
      </div>

      <p v-if="listError" role="status" class="mb-4 text-sm text-red-700">
        {{ listError }}
      </p>

      <p v-if="!submissions.length" class="font-light text-gray-600">
        {{ searchedFor ? "No submissions match that search." : "Nothing here yet." }}
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="item in submissions"
          :key="item.id"
          class="rounded border border-primary-100"
        >
          <button
            type="button"
            class="w-full text-left p-4 hover:bg-primary-50 transition-colors"
            :aria-expanded="expanded === item.id"
            @click="toggle(item.id)"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-medium">
                {{ KIND_LABELS[item.kind] ?? item.kind }} &middot;
                {{ item.patientName }}
              </span>
              <span class="text-sm font-light text-gray-600">
                {{ formatWhen(item.receivedAt) }}
              </span>
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-sm font-light">
              <span class="text-gray-600">Ref {{ item.reference }}</span>
              <span v-if="item.fileCount" class="text-gray-600">
                &middot; {{ item.fileCount }}
                {{ item.fileCount === 1 ? "attachment" : "attachments" }}
              </span>
              <!-- Flags mark for attention. They never hide anything. -->
              <span
                v-for="flag in item.flags"
                :key="flag"
                class="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900"
              >
                {{ FLAG_LABELS[flag] ?? flag }}
              </span>
            </div>
          </button>

          <div v-if="expanded === item.id" class="border-t border-primary-100 p-4">
            <p v-if="detailError" role="status" class="text-sm text-red-700">
              {{ detailError }}
            </p>
            <p v-else-if="!detail" class="text-sm font-light text-gray-600">
              Loading...
            </p>
            <AdminSubmissionDetail v-else :detail="detail" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAG_LABELS, KIND_LABELS } from "~~/shared/submissions";
import type { SubmissionDetailDTO, SubmissionSummaryDTO } from "~~/shared/submissions";

// Never let this area be indexed, and never render it on the server: patient
// data should only ever arrive via an authenticated fetch.
definePageMeta({ layout: "default" });
useHead({ meta: [{ name: "robots", content: "noindex, nofollow" }] });

interface Session {
  configured: boolean;
  authenticated: boolean;
}

const isDev = import.meta.dev;

const session = ref<Session | null>(null);
const submissions = ref<SubmissionSummaryDTO[]>([]);
const expanded = ref<string | null>(null);
const detail = ref<SubmissionDetailDTO | null>(null);

const password = ref("");
const signingIn = ref(false);
const loginError = ref<string | null>(null);
const listError = ref<string | null>(null);
const detailError = ref<string | null>(null);

async function loadSession() {
  session.value = await $fetch<Session>("/api/admin/session");
  if (session.value.authenticated) await refresh();
}

const search = ref("");
// The search the list currently shows, which lags the box while typing
const searchedFor = ref("");

// Only the newest list request may update the list, so results for an old
// search can't land after the current one
let listRequest = 0;

async function refresh() {
  const request = ++listRequest;
  const query = search.value.trim();
  listError.value = null;
  try {
    const results = await $fetch<SubmissionSummaryDTO[]>("/api/admin/submissions", {
      query: query ? { q: query } : {},
    });
    if (request !== listRequest) return;
    submissions.value = results;
    searchedFor.value = query;
  } catch {
    if (request === listRequest) {
      listError.value = "Could not load submissions. Try refreshing.";
    }
  }
}

// Searches once typing pauses
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(refresh, 300);
});
onBeforeUnmount(() => clearTimeout(searchTimer));

async function signIn() {
  signingIn.value = true;
  loginError.value = null;
  try {
    await $fetch("/api/admin/login", {
      method: "POST",
      body: { password: password.value },
    });
    password.value = "";
    await loadSession();
  } catch (err) {
    loginError.value =
      (err as { statusMessage?: string })?.statusMessage ?? "Could not sign in.";
  } finally {
    signingIn.value = false;
  }
}

async function signOut() {
  await $fetch("/api/admin/logout", { method: "POST" });
  submissions.value = [];
  expanded.value = null;
  detail.value = null;
  await loadSession();
}

async function toggle(id: string) {
  if (expanded.value === id) {
    expanded.value = null;
    return;
  }
  expanded.value = id;
  detail.value = null;
  detailError.value = null;
  // A slower reply for a row opened earlier must never fill this one, or
  // staff would see one patient's details under another's name
  try {
    const result = await $fetch<SubmissionDetailDTO>(`/api/admin/submissions/${id}`);
    if (expanded.value === id) detail.value = result;
  } catch {
    if (expanded.value === id) detailError.value = "Could not load that submission.";
  }
}

// Nothing in the document gives away what this page is for until there is a
// session. The title is reactive, so it changes only after signing in.
const heading = computed(() =>
  session.value?.authenticated ? "Prescription submissions" : "Staff sign in",
);
useSeoMeta({ title: () => `${heading.value} | Garibaldi Pharmacy` });

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

onMounted(loadSession);
</script>
