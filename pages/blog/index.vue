<template>
  <PageIntro title="Blog">
    <p>
      News from the pharmacy, and plain-language advice on medications and
      staying well in Squamish.
    </p>
  </PageIntro>

  <section
    ref="results"
    class="mx-auto max-w-6xl scroll-mt-28 px-4 pb-20 sm:px-6 lg:pb-24"
  >
    <!-- Categories and search. Both live in the address, so a filtered or
         searched list can be shared, bookmarked and gone back to -->
    <div
      class="mb-10 flex flex-col gap-5 border-b border-primary-900/10 pb-8 lg:flex-row lg:items-center lg:justify-between"
    >
      <nav v-if="data?.categories.length" aria-label="Categories">
        <ul class="flex flex-wrap gap-2">
          <li v-for="chip in chips" :key="chip.label">
            <NuxtLink
              :to="listLink({ category: chip.slug, q: search })"
              :aria-current="chip.slug === category ? 'page' : undefined"
              :class="[
                'block rounded-full px-4 py-2 text-sm transition-colors',
                chip.slug === category
                  ? 'bg-primary-900 font-medium text-white'
                  : 'bg-primary-50 text-primary-900 hover:bg-primary-100',
              ]"
              >{{ chip.label }}</NuxtLink
            >
          </li>
        </ul>
      </nav>

      <!-- A plain GET form underneath, so it searches even before the page's
           script has loaded -->
      <form
        role="search"
        action="/blog/"
        method="get"
        class="relative w-full lg:ml-auto lg:w-80"
        @submit.prevent="applySearch"
      >
        <label for="blog-search" class="sr-only">Search the blog</label>
        <Icon
          name="fa6-solid:magnifying-glass"
          aria-hidden="true"
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"
        />
        <input
          id="blog-search"
          v-model="typed"
          name="q"
          type="search"
          :maxlength="SEARCH_MAX"
          placeholder="Search posts"
          autocomplete="off"
          class="form-input rounded-full !pl-11"
        />
        <input v-if="category" type="hidden" name="category" :value="category" />
      </form>
    </div>

    <p
      v-if="search"
      role="status"
      class="-mt-4 mb-8 flex flex-wrap items-baseline gap-x-3 text-slate-600"
    >
      <span>
        {{ total }} {{ total === 1 ? "post" : "posts" }} matching
        <strong class="font-medium text-primary-900">“{{ search }}”</strong>
        <template v-if="category"> in {{ categoryLabel(category) }}</template>
      </span>
      <NuxtLink
        :to="listLink({ category })"
        class="text-sm text-primary-900 underline underline-offset-4 hover:no-underline"
        >Clear search</NuxtLink
      >
    </p>

    <div
      v-if="!posts.length"
      class="rounded-3xl bg-secondary-50 px-6 py-14 text-center ring-1 ring-secondary-200"
    >
      <p class="text-lg text-primary-900">
        {{
          search
            ? "No posts match that search."
            : "There aren’t any posts yet. Check back soon."
        }}
      </p>
      <p v-if="search" class="mt-2 font-light text-slate-600">
        Try fewer or different words, or
        <NuxtLink
          to="/blog/"
          class="text-primary-900 underline underline-offset-4 hover:no-underline"
          >see every post</NuxtLink
        >.
      </p>
    </div>

    <ul
      v-else
      aria-label="Posts"
      class="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li
        v-for="(post, index) in posts"
        :key="post.slug"
        v-reveal="(index % 3) * 120"
      >
        <BlogPostCard :post="post" />
      </li>
    </ul>

    <Pagination
      class="mt-16"
      :page="page"
      :page-count="data?.pageCount ?? 1"
      :to="(n) => listLink({ category, q: search, page: n })"
    />
  </section>
</template>

<script lang="ts" setup>
import {
  SEARCH_MAX,
  categoryLabel,
  type BlogPageDTO,
} from "~~/shared/posts";

const route = useRoute();
const router = useRouter();

const one = (value: unknown) => (typeof value === "string" ? value : "");
const page = computed(() => Number(one(route.query.page)) || 1);
const category = computed(() => one(route.query.category) || null);
const search = computed(() => one(route.query.q).trim());

const { data, error } = await useFetch<BlogPageDTO>("/api/posts", {
  query: computed(() => ({
    page: one(route.query.page) || undefined,
    category: category.value ?? undefined,
    q: search.value || undefined,
  })),
});

// A page past the end, or a category that doesn't exist
function notFound() {
  return createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}
if (error.value) throw notFound();
watch(error, (err) => err && showError(notFound()));

const posts = computed(() => data.value?.posts ?? []);
const total = computed(() => data.value?.total ?? 0);

const chips = computed(() => [
  { slug: null, label: "All posts" },
  ...(data.value?.categories ?? []),
]);

/** The blog's address with these filters. Page 1 and empty values are left
 * out, so every list has exactly one address */
function listLink(params: { category?: string | null; q?: string; page?: number }) {
  const query: Record<string, string> = {};
  if (params.category) query.category = params.category;
  if (params.q) query.q = params.q;
  if (params.page && params.page > 1) query.page = String(params.page);
  return { path: "/blog/", query };
}

// Searches as you type, once you pause. Replaces the history entry rather
// than adding one per keystroke
const typed = ref(search.value);
// Anything typed before the page's script loaded would otherwise be wiped
// when it takes over the box, so keep it
onBeforeMount(() => {
  const box = document.getElementById("blog-search") as HTMLInputElement | null;
  if (box?.value && box.value !== typed.value) typed.value = box.value;
});
watch(search, (value) => {
  if (value !== typed.value.trim()) typed.value = value;
});

let searchTimer: ReturnType<typeof setTimeout> | undefined;
function applySearch() {
  clearTimeout(searchTimer);
  const q = typed.value.trim();
  if (q === search.value) return;
  router.replace(listLink({ category: category.value, q }));
}
watch(typed, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applySearch, 350);
});
onBeforeUnmount(() => clearTimeout(searchTimer));

// Changing page brings the list back into view. Searching and filtering
// don't, as the search box and chips are already where you're looking
const results = ref<HTMLElement | null>(null);
watch(page, () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  results.value?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
});

// Each category page and numbered page is its own address for search
// engines. Search results aren't worth indexing, but their links are
const siteUrl = useSiteConfig().url;
const canonical = computed(() => {
  const url = new URL("/blog/", siteUrl);
  if (category.value) url.searchParams.set("category", category.value);
  if (page.value > 1) url.searchParams.set("page", String(page.value));
  return url.href;
});
const title = computed(() => {
  const parts = ["Blog"];
  if (category.value) parts.push(categoryLabel(category.value));
  if (page.value > 1) parts.push(`Page ${page.value}`);
  return `${parts.join(" – ")} | Garibaldi Pharmacy in Squamish`;
});
const description =
  "News from Garibaldi Pharmacy, and plain-language advice on medications and staying well in Squamish.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ...shareImages.dog,
  ogUrl: canonical,
  twitterTitle: title,
  twitterDescription: description,
  robots: () => (search.value ? "noindex, follow" : undefined),
});

useHead({
  htmlAttrs: { lang: "en" },
  link: [
    { rel: "canonical", href: canonical },
    { rel: "icon", type: "image/png", href: "/favicon/favicon-32x32.png" },
  ],
});
</script>
