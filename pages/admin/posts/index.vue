<template>
  <div class="container mx-auto my-10 max-w-5xl px-4">
    <h1 class="mb-6 text-3xl font-bold">Blog posts</h1>
    <AdminNav />

    <template v-if="ready">
      <p
        v-if="shownNotice"
        role="status"
        class="mb-4 flex items-center gap-2 rounded-xl bg-secondary-50 px-4 py-3 text-sm text-secondary-950 ring-1 ring-secondary-200"
      >
        <Icon name="fa6-solid:circle-check" class="shrink-0 text-secondary-800" />
        {{ shownNotice }}
      </p>

      <div class="mb-4 flex justify-end">
        <NuxtLink
          to="/admin/posts/new/"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-800"
        >
          <Icon name="fa6-solid:plus" class="text-xs" />
          New post
        </NuxtLink>
      </div>

      <!-- Filters live in the address, so the back button returns to the
           same filtered list after editing a post -->
      <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label for="posts-search" class="mb-1 block text-sm font-medium text-gray-900"
            >Search</label
          >
          <input
            id="posts-search"
            v-model="typed"
            type="search"
            autocomplete="off"
            :maxlength="SEARCH_MAX"
            placeholder="Title or words in the post"
            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm font-light text-gray-900"
          />
        </div>
        <div>
          <label for="posts-status" class="mb-1 block text-sm font-medium text-gray-900"
            >Show</label
          >
          <select
            id="posts-status"
            :value="status"
            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
            @change="setFilter('status', ($event.target as HTMLSelectElement).value)"
          >
            <option value="all">All posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>
        <div>
          <label for="posts-category" class="mb-1 block text-sm font-medium text-gray-900"
            >Category</label
          >
          <select
            id="posts-category"
            :value="category"
            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
            @change="setFilter('category', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">All categories</option>
            <option v-for="c in POST_CATEGORIES" :key="c.slug" :value="c.slug">
              {{ c.label }}
            </option>
          </select>
        </div>
      </div>

      <p class="mb-4 text-sm font-light text-gray-600" role="status" aria-live="polite">
        {{ result?.total ?? 0 }} {{ result?.total === 1 ? "post" : "posts" }}
        <template v-if="filtered">
          ·
          <NuxtLink to="/admin/posts/" class="text-primary-900 hover:underline"
            >Clear filters</NuxtLink
          >
        </template>
      </p>

      <p v-if="loadError" role="alert" class="text-sm text-red-700">{{ loadError }}</p>
      <p v-else-if="result && !result.posts.length" class="font-light text-gray-600">
        {{ filtered ? "No posts match." : "No posts yet. Write the first one with New post." }}
      </p>

      <ul
        v-else-if="result"
        class="divide-y divide-primary-100 rounded border border-primary-100"
      >
        <li v-for="post in result.posts" :key="post.id">
          <NuxtLink
            :to="`/admin/posts/${post.id}/`"
            class="block p-4 transition-colors hover:bg-primary-50"
          >
            <span class="font-medium">{{ post.title }}</span>
            <span class="mt-1 flex flex-wrap items-center gap-2 text-sm font-light">
              <span
                :class="[
                  'rounded px-2 py-0.5 text-xs',
                  post.status === 'published'
                    ? 'bg-secondary-100 text-secondary-950'
                    : 'bg-gray-100 text-gray-700',
                ]"
                >{{ post.status === "published" ? "Published" : "Draft" }}</span
              >
              <span class="text-gray-600">{{ categoryLabel(post.category) }}</span>
              <span class="text-gray-600">·</span>
              <span class="text-gray-600">
                {{
                  post.publishedAt
                    ? formatPharmacyDate(post.publishedAt)
                    : `Edited ${formatPharmacyDate(post.updatedAt)}`
                }}
              </span>
              <span
                v-if="post.announcement"
                class="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900"
              >
                {{ announcementLabel(post.announcement) }}
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>

      <Pagination
        v-if="result"
        class="mt-8"
        :page="page"
        :page-count="result.pageCount"
        :to="(n) => ({ query: { ...route.query, page: n > 1 ? String(n) : undefined } })"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  POST_CATEGORIES,
  SEARCH_MAX,
  categoryLabel,
  type PostPage,
  type PostSummaryDTO,
} from "~~/shared/posts";
import { formatPharmacyDate, formatPharmacyDateTime } from "~~/shared/pharmacyTime";

useHead({ meta: [{ name: "robots", content: "noindex, nofollow" }] });
useSeoMeta({ title: "Blog posts | Garibaldi Pharmacy" });

const route = useRoute();
const router = useRouter();
const ready = useAdminGate();

// Shown once, then cleared so it doesn't reappear on the next visit
const notice = useAdminNotice();
const shownNotice = notice.value;
notice.value = null;

const one = (value: unknown) => (typeof value === "string" ? value : "");
const page = computed(() => Number(one(route.query.page)) || 1);
const status = computed(() => one(route.query.status) || "all");
const category = computed(() => one(route.query.category));
const search = computed(() => one(route.query.q).trim());
const filtered = computed(
  () => status.value !== "all" || !!category.value || !!search.value,
);

const result = ref<PostPage<PostSummaryDTO> | null>(null);
const loadError = ref<string | null>(null);

// Only the newest request may fill the list, so a slow reply for an old
// search can't land after the current one
let request = 0;
async function load() {
  const current = ++request;
  loadError.value = null;
  try {
    const found = await $fetch<PostPage<PostSummaryDTO>>("/api/admin/posts", {
      query: {
        page: page.value > 1 ? page.value : undefined,
        status: status.value,
        category: category.value || undefined,
        q: search.value || undefined,
      },
    });
    if (current === request) result.value = found;
  } catch {
    if (current === request) loadError.value = "Could not load posts. Try refreshing.";
  }
}

watch(
  [ready, () => route.query],
  ([isReady]) => isReady && load(),
  { deep: true },
);

/** Changes one filter, back to page 1 */
function setFilter(key: "status" | "category" | "q", value: string) {
  const query = { ...route.query, page: undefined, [key]: value || undefined };
  if (key === "status" && value === "all") query.status = undefined;
  router.replace({ query });
}

// Searches once typing pauses
const typed = ref(search.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(typed, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (value.trim() !== search.value) setFilter("q", value.trim());
  }, 300);
});
onBeforeUnmount(() => clearTimeout(searchTimer));

function announcementLabel(a: NonNullable<PostSummaryDTO["announcement"]>): string {
  if (a.state === "scheduled") return `Announcement from ${formatPharmacyDateTime(a.startsAt)}`;
  if (a.state === "active") return `Announcement until ${formatPharmacyDateTime(a.endsAt)}`;
  return "Announcement ended";
}
</script>
