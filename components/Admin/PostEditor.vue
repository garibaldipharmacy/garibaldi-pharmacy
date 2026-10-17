<template>
  <form novalidate class="space-y-8" @submit.prevent>
    <p
      v-if="formError"
      role="alert"
      class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
    >
      {{ formError }}
    </p>

    <!-- Title and address -->
    <div>
      <label for="post-title" class="form-label">Title</label>
      <input
        id="post-title"
        v-model="form.title"
        type="text"
        :maxlength="POST_LIMITS.title"
        class="form-input text-lg"
        :aria-invalid="!!errors.title"
        aria-describedby="post-title-error"
      />
      <FieldError id="post-title-error" :message="errors.title" />
    </div>

    <div>
      <label for="post-slug" class="form-label">Web address</label>
      <p id="post-slug-hint" class="form-hint">
        Made from the title. Changing it after publishing breaks links people
        have already shared.
      </p>
      <div class="flex items-center gap-1 text-sm font-light text-slate-600">
        <span class="shrink-0">garibaldipharmacy.com/blog/</span>
        <input
          id="post-slug"
          :value="form.slug"
          type="text"
          :maxlength="POST_LIMITS.slug"
          class="form-input py-2 text-sm"
          :aria-invalid="!!errors.slug"
          aria-describedby="post-slug-hint post-slug-error"
          @input="onSlugInput"
        />
      </div>
      <FieldError id="post-slug-error" :message="errors.slug" />
    </div>

    <div>
      <label for="post-category" class="form-label">Category</label>
      <p id="post-category-hint" class="form-hint">
        Visitors can filter the blog by category.
      </p>
      <select
        id="post-category"
        v-model="form.category"
        class="form-input sm:max-w-xs"
        :aria-invalid="!!errors.category"
        aria-describedby="post-category-hint post-category-error"
      >
        <option v-for="c in POST_CATEGORIES" :key="c.slug" :value="c.slug">
          {{ c.label }}
        </option>
      </select>
      <FieldError id="post-category-error" :message="errors.category" />
    </div>

    <!-- Cover picture -->
    <div>
      <p class="form-label">Cover picture</p>
      <p class="form-hint">
        Optional. Shown at the top of the post, on its card in the blog, and
        when the post is shared.
      </p>
      <div v-if="form.coverImage" class="flex flex-wrap items-start gap-4">
        <img
          :src="form.coverImage"
          alt=""
          class="aspect-[16/9] w-64 rounded-xl object-cover ring-1 ring-primary-900/10"
        />
        <div class="min-w-64 flex-1">
          <label for="post-cover-alt" class="form-label">Describe the picture</label>
          <input
            id="post-cover-alt"
            v-model="form.coverAlt"
            type="text"
            :maxlength="POST_LIMITS.coverAlt"
            placeholder="e.g. Our pharmacist giving a flu shot"
            class="form-input"
            :aria-invalid="!!errors.coverAlt"
            aria-describedby="post-cover-alt-error"
          />
          <FieldError id="post-cover-alt-error" :message="errors.coverAlt" />
          <button
            type="button"
            class="mt-2 text-sm text-gray-600 hover:underline"
            @click="form.coverImage = null"
          >
            Remove picture
          </button>
        </div>
      </div>
      <button
        v-else
        type="button"
        :disabled="coverUploading"
        class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm text-primary-900 shadow-sm ring-1 ring-primary-900/20 hover:bg-primary-50 disabled:opacity-60"
        @click="coverInput?.click()"
      >
        <Icon name="fa6-solid:image" />
        {{ coverUploading ? "Uploading…" : "Choose a picture" }}
      </button>
      <input
        ref="coverInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        class="hidden"
        @change="onCoverChosen"
      />
      <FieldError :message="coverError ?? errors.coverImage" />
    </div>

    <!-- Body -->
    <div>
      <p id="post-body-label" class="form-label">Post</p>
      <AdminRichTextEditor
        v-model="form.body"
        :invalid="!!errors.body"
        labelled-by="post-body-label"
      />
      <FieldError :message="errors.body" />
    </div>

    <div>
      <label for="post-excerpt" class="form-label">Summary</label>
      <p id="post-excerpt-hint" class="form-hint">
        Optional. A sentence or two for the post’s card and for search results.
        Left empty, the start of the post is used.
      </p>
      <textarea
        id="post-excerpt"
        v-model="form.excerpt"
        :maxlength="POST_LIMITS.excerpt"
        rows="2"
        class="form-input"
        :aria-invalid="!!errors.excerpt"
        aria-describedby="post-excerpt-hint post-excerpt-error"
      />
      <FieldError id="post-excerpt-error" :message="errors.excerpt" />
    </div>

    <!-- Homepage announcement -->
    <fieldset class="rounded-2xl bg-secondary-50 p-5 ring-1 ring-secondary-200 sm:p-6">
      <legend class="sr-only">Homepage announcement</legend>
      <label class="flex items-start gap-3">
        <input
          v-model="form.announce"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-primary-900/30 text-primary-900"
        />
        <span>
          <span class="block font-medium text-primary-900"
            >Feature as an announcement</span
          >
          <span class="block text-sm font-light text-slate-600">
            Shows a short line linking to this post at the top of the homepage
            and above the heading on other pages, between the times you choose.
          </span>
        </span>
      </label>

      <div v-if="form.announce" class="mt-6 space-y-6">
        <p
          v-if="otherAnnouncement"
          class="rounded-xl bg-amber-50 px-4 py-3 text-sm font-light text-amber-900 ring-1 ring-amber-200"
        >
          “{{ otherAnnouncement.title }}” is the announcement now. Saving this
          post will replace it, as only one post can be the announcement.
        </p>
        <p
          v-if="form.status === 'draft'"
          class="text-sm font-light text-slate-600"
        >
          It will only show once this post is published.
        </p>

        <div>
          <div class="flex items-baseline justify-between gap-4">
            <label for="post-snippet" class="form-label">Line to show</label>
            <span
              class="text-xs font-light"
              :class="
                form.snippet.length > POST_LIMITS.snippet
                  ? 'text-red-700'
                  : 'text-slate-600'
              "
              >{{ form.snippet.length }} / {{ POST_LIMITS.snippet }}</span
            >
          </div>
          <input
            id="post-snippet"
            v-model="form.snippet"
            type="text"
            :maxlength="POST_LIMITS.snippet"
            placeholder="e.g. Closed Monday, Feb 16 for Family Day"
            class="form-input"
            :aria-invalid="!!errors.snippet"
            aria-describedby="post-snippet-error"
          />
          <FieldError id="post-snippet-error" :message="errors.snippet" />

          <!-- How it will look over the homepage photo -->
          <div
            aria-hidden="true"
            class="mt-3 rounded-xl bg-gradient-to-r from-primary-900 to-primary-700 p-4"
          >
            <span
              class="inline-flex max-w-xl items-center gap-3 rounded-2xl bg-white/15 py-1.5 pl-1.5 pr-4 text-sm font-light text-white ring-1 ring-white/25 sm:rounded-full"
            >
              <span
                class="shrink-0 rounded-full bg-secondary-900 px-2.5 py-1 text-xs font-medium"
                >New</span
              >
              <span>{{ form.snippet || "Your line here" }}</span>
              <Icon name="fa6-solid:arrow-right" class="shrink-0 text-xs" />
            </span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="post-starts" class="form-label">Starts</label>
            <input
              id="post-starts"
              v-model="form.startsLocal"
              type="datetime-local"
              class="form-input"
              :aria-invalid="!!errors.startsAt"
              aria-describedby="post-window-hint post-starts-error"
            />
            <FieldError id="post-starts-error" :message="errors.startsAt" />
          </div>
          <div>
            <label for="post-ends" class="form-label">Ends</label>
            <input
              id="post-ends"
              v-model="form.endsLocal"
              type="datetime-local"
              class="form-input"
              :aria-invalid="!!errors.endsAt"
              aria-describedby="post-window-hint post-ends-error"
            />
            <FieldError id="post-ends-error" :message="errors.endsAt" />
          </div>
        </div>
        <p id="post-window-hint" class="-mt-3 text-sm font-light text-slate-600">
          Squamish time. Afterwards the post stays on the blog.
        </p>
      </div>
    </fieldset>

    <!-- Actions -->
    <div
      class="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-primary-100 bg-white/95 px-4 py-4 backdrop-blur"
    >
      <template v-if="form.status === 'published'">
        <button type="button" :disabled="saving" :class="primaryButton" @click="save('published')">
          {{ saving ? "Saving…" : "Update" }}
        </button>
        <button type="button" :disabled="saving" :class="secondaryButton" @click="save('draft')">
          Unpublish
        </button>
      </template>
      <template v-else>
        <button type="button" :disabled="saving" :class="primaryButton" @click="save('published')">
          {{ saving ? "Saving…" : "Publish" }}
        </button>
        <button type="button" :disabled="saving" :class="secondaryButton" @click="save('draft')">
          Save draft
        </button>
      </template>

      <a
        v-if="savedSlug"
        :href="`/blog/${savedSlug}/?preview=1`"
        target="_blank"
        class="text-sm text-primary-900 hover:underline"
      >
        {{ form.status === "published" ? "View post" : "Preview" }}
        <span class="sr-only">(opens in a new tab)</span>
      </a>
      <span
        role="status"
        aria-live="polite"
        class="text-sm font-light text-slate-600"
        >{{ dirty ? "Unsaved changes" : savedMessage }}</span
      >

      <button
        v-if="post"
        type="button"
        class="ml-auto text-sm text-red-700 hover:underline"
        @click="remove"
      >
        Delete post
      </button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import {
  POST_CATEGORIES,
  POST_LIMITS,
  slugify,
  type PostCategory,
  type PostDTO,
  type PostStatus,
  type PostSummaryDTO,
} from "~~/shared/posts";
import type { DocNode } from "~~/shared/postDoc";
import { isoToPharmacyLocal, pharmacyLocalToIso } from "~~/shared/pharmacyTime";

const props = defineProps<{
  post: PostDTO | null;
  /** The post holding the announcement, to warn before replacing it */
  announcementHolder: PostSummaryDTO | null;
}>();
const emit = defineEmits<{
  // `wentLive` is true when this save published a draft or new post
  saved: [id: string, saved: { wentLive: boolean; title: string }];
  deleted: [];
}>();

const primaryButton =
  "rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:opacity-60";
const secondaryButton =
  "rounded-xl bg-white px-5 py-2.5 text-sm text-primary-900 ring-1 ring-primary-900/20 transition-colors hover:bg-primary-50 disabled:opacity-60";

// A new announcement runs from now for a week, on the hour
function defaultWindow() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 7 * 24 * 3600_000);
  return {
    startsLocal: isoToPharmacyLocal(start.toISOString()),
    endsLocal: isoToPharmacyLocal(end.toISOString()),
  };
}

function fromPost(post: PostDTO | null) {
  const window = post?.announcement
    ? {
        startsLocal: isoToPharmacyLocal(post.announcement.startsAt),
        endsLocal: isoToPharmacyLocal(post.announcement.endsAt),
      }
    : defaultWindow();
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    // A saved post's address is never changed by editing its title
    slugEdited: !!post,
    excerpt: post?.excerpt ?? "",
    coverImage: post?.coverImage ?? null,
    coverAlt: post?.coverAlt ?? "",
    category: (post?.category ?? "news") as PostCategory,
    body: post?.body ?? ({ type: "doc" } as DocNode),
    status: (post?.status ?? "draft") as PostStatus,
    announce: !!post?.announcement,
    snippet: post?.announcement?.snippet ?? "",
    ...window,
  };
}

const form = reactive(fromPost(props.post));
const savedSlug = ref(props.post?.slug ?? null);

watch(
  () => form.title,
  (title) => {
    if (!form.slugEdited) form.slug = slugify(title);
  },
);

function onSlugInput(event: Event) {
  form.slugEdited = true;
  form.slug = (event.target as HTMLInputElement).value;
}

const otherAnnouncement = computed(() => {
  const holder = props.announcementHolder;
  return holder &&
    holder.id !== props.post?.id &&
    holder.announcement?.state !== "ended"
    ? holder
    : null;
});

// Unsaved changes, so leaving doesn't silently lose them
const snapshot = ref(JSON.stringify(form));
const dirty = computed(() => JSON.stringify(form) !== snapshot.value);
const savedMessage = ref("");

function warnBeforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) event.preventDefault();
}
onMounted(() => window.addEventListener("beforeunload", warnBeforeUnload));
onBeforeUnmount(() => window.removeEventListener("beforeunload", warnBeforeUnload));
onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm("Leave without saving your changes?")) return false;
});

// Cover picture
const coverInput = ref<HTMLInputElement | null>(null);
const coverUploading = ref(false);
const coverError = ref<string | null>(null);

async function onCoverChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  coverUploading.value = true;
  coverError.value = null;
  try {
    form.coverImage = (await uploadBlogImage(file)).url;
  } catch (err) {
    coverError.value = (err as Error).message;
  } finally {
    coverUploading.value = false;
  }
}

// Saving
const saving = ref(false);
const errors = ref<Record<string, string>>({});
const formError = ref<string | null>(null);

async function save(status: PostStatus) {
  if (
    status === "draft" &&
    form.status === "published" &&
    !window.confirm("Unpublish this post? It will disappear from the blog until you publish it again.")
  ) {
    return;
  }

  saving.value = true;
  errors.value = {};
  formError.value = null;

  const announcement = form.announce
    ? {
        snippet: form.snippet,
        startsAt: pharmacyLocalToIso(form.startsLocal) ?? "",
        endsAt: pharmacyLocalToIso(form.endsLocal) ?? "",
      }
    : null;

  try {
    const { id } = await $fetch<{ id: string }>(
      props.post ? `/api/admin/posts/${props.post.id}` : "/api/admin/posts",
      {
        method: props.post ? "PUT" : "POST",
        body: {
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          coverImage: form.coverImage,
          coverAlt: form.coverAlt,
          category: form.category,
          body: form.body,
          status,
          announcement,
        },
      },
    );
    const wentLive = status === "published" && form.status !== "published";
    form.status = status;
    savedSlug.value = form.slug;
    snapshot.value = JSON.stringify(form);
    savedMessage.value = status === "published" ? "Saved" : "Draft saved";
    emit("saved", id, { wentLive, title: form.title.trim() });
  } catch (err) {
    const data = (err as { data?: { data?: { errors?: Record<string, string> } } })
      ?.data?.data;
    if (data?.errors) {
      errors.value = data.errors;
      formError.value = "Some fields need attention.";
    } else {
      formError.value =
        (err as { statusMessage?: string })?.statusMessage ??
        "The post didn’t save. Check your connection and try again.";
    }
  } finally {
    saving.value = false;
  }
}

async function remove() {
  if (!props.post) return;
  if (!window.confirm(`Delete “${props.post.title}”? This can’t be undone.`)) return;
  try {
    await $fetch(`/api/admin/posts/${props.post.id}`, { method: "DELETE" });
    snapshot.value = JSON.stringify(form);
    emit("deleted");
  } catch {
    formError.value = "The post wasn’t deleted. Try again.";
  }
}
</script>
