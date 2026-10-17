<template>
  <div class="container mx-auto my-10 max-w-3xl px-4">
    <h1 class="mb-6 text-3xl font-bold">{{ isNew ? "New post" : "Edit post" }}</h1>
    <AdminNav />

    <NuxtLink
      to="/admin/posts/"
      class="mb-6 inline-flex items-center gap-2 text-sm font-light text-gray-600 hover:text-primary-900"
    >
      <Icon name="fa6-solid:arrow-left" class="text-xs" />
      All posts
    </NuxtLink>

    <p v-if="loadError" role="alert" class="text-sm text-red-700">{{ loadError }}</p>
    <AdminPostEditor
      v-else-if="loaded"
      :key="post?.id ?? 'new'"
      :post="post"
      :announcement-holder="announcementHolder"
      @saved="onSaved"
      @deleted="navigateTo('/admin/posts/')"
    />
  </div>
</template>

<script lang="ts" setup>
import type { PostDTO, PostPage, PostSummaryDTO } from "~~/shared/posts";

useHead({ meta: [{ name: "robots", content: "noindex, nofollow" }] });

const route = useRoute();
const id = computed(() => String(route.params.id));
const isNew = computed(() => id.value === "new");
useSeoMeta({
  title: () => `${isNew.value ? "New post" : "Edit post"} | Garibaldi Pharmacy`,
});

const ready = useAdminGate();
const post = ref<PostDTO | null>(null);
const announcementHolder = ref<PostSummaryDTO | null>(null);

// At most one post holds the announcement
const fetchHolder = async () =>
  (
    await $fetch<PostPage<PostSummaryDTO>>("/api/admin/posts", {
      query: { status: "announcement" },
    })
  ).posts[0] ?? null;
const loaded = ref(false);
const loadError = ref<string | null>(null);

async function load() {
  loaded.value = false;
  loadError.value = null;
  try {
    const [found, holder] = await Promise.all([
      isNew.value ? null : $fetch<PostDTO>(`/api/admin/posts/${id.value}`),
      fetchHolder(),
    ]);
    post.value = found;
    announcementHolder.value = holder;
    loaded.value = true;
  } catch {
    loadError.value = "Could not load this post. It may have been deleted.";
  }
}

watch(ready, (isReady) => isReady && load());

const notice = useAdminNotice();

// Publishing is done with the post, so it's back to the list. Otherwise a
// new post gets its own address once saved, so a refresh doesn't start
// over, and saving an existing one refreshes who holds the announcement
async function onSaved(
  savedId: string,
  { wentLive, title }: { wentLive: boolean; title: string },
) {
  if (wentLive) {
    notice.value = `Published “${title}”.`;
    await navigateTo("/admin/posts/");
  } else if (isNew.value) {
    await navigateTo(`/admin/posts/${savedId}/`, { replace: true });
    await load();
  } else {
    announcementHolder.value = await fetchHolder();
  }
}
</script>
