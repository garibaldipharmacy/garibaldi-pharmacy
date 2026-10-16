<template>
  <!-- Writing a post. The text area uses the published post's own styles,
       so it reads as it will on the site -->
  <div
    class="rounded-xl bg-white shadow-sm ring-1 transition focus-within:ring-2"
    :class="
      invalid
        ? 'ring-2 ring-red-500 focus-within:ring-red-500'
        : 'ring-primary-900/20 focus-within:ring-primary-700'
    "
  >
    <!-- Buttons don't take focus on click, so the text keeps its cursor and
         selection, and typing carries on where it was -->
    <div
      v-if="editor"
      role="toolbar"
      aria-label="Formatting"
      class="sticky top-[4.75rem] z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-primary-900/10 bg-white/95 p-1.5 backdrop-blur"
    >
      <template v-for="(group, index) in toolbar" :key="index">
        <span
          v-if="index"
          aria-hidden="true"
          class="mx-1 h-5 w-px bg-primary-900/10"
        />
        <button
          v-for="tool in group"
          :key="tool.label"
          type="button"
          :title="tool.label"
          :aria-label="tool.label"
          :aria-pressed="tool.active ? tool.active() : undefined"
          :disabled="tool.disabled?.()"
          class="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm text-primary-900 transition-colors hover:bg-primary-50 disabled:opacity-30 aria-pressed:bg-primary-900 aria-pressed:text-white"
          @mousedown.prevent
          @click="tool.run()"
        >
          <Icon v-if="tool.icon" :name="tool.icon" />
          <span v-else class="font-semibold">{{ tool.text }}</span>
        </button>
      </template>
      <span
        v-if="uploading"
        role="status"
        class="ml-auto px-2 text-sm font-light text-slate-600"
        >Uploading picture…</span
      >
    </div>

    <EditorContent :editor="editor" />

    <input
      ref="imageInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/heic"
      class="hidden"
      @change="onImageChosen"
    />
  </div>
  <p v-if="uploadError" role="alert" class="mt-2 text-sm text-red-700">
    {{ uploadError }}
  </p>
</template>

<script lang="ts" setup>
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { postExtensions } from "~~/shared/postExtensions";
import type { DocNode } from "~~/shared/postDoc";

const props = defineProps<{
  modelValue: DocNode;
  invalid?: boolean;
  labelledBy?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [DocNode] }>();

const editor = useEditor({
  extensions: postExtensions,
  content: props.modelValue,
  editorProps: {
    attributes: {
      class: "post-body min-h-[24rem] px-5 py-4 focus:outline-none",
      ...(props.labelledBy ? { "aria-labelledby": props.labelledBy } : {}),
    },
  },
  onUpdate: ({ editor }) => emit("update:modelValue", editor.getJSON() as DocNode),
});

const imageInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);

// Bare addresses like "healthlinkbc.ca" get https:// so they don't become
// links to a page on this site
function normalizeHref(input: string): string {
  const href = input.trim();
  if (/^(?:https?:|mailto:|tel:|\/)/i.test(href)) return href;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) return `mailto:${href}`;
  return `https://${href}`;
}

function editLink() {
  const chain = editor.value?.chain().focus();
  if (!chain) return;
  const current = editor.value!.getAttributes("link").href ?? "";
  const answer = window.prompt(
    "Link to (a web address, or a page here like /contact/). Leave empty to remove the link.",
    current,
  );
  if (answer === null) return;
  if (!answer.trim()) {
    chain.extendMarkRange("link").unsetLink().run();
    return;
  }
  chain.extendMarkRange("link").setLink({ href: normalizeHref(answer) }).run();
}

function addVideo() {
  const answer = window.prompt("Paste the YouTube video's link");
  if (!answer?.trim()) return;
  const added = editor.value
    ?.chain()
    .focus()
    .setYoutubeVideo({ src: answer.trim() })
    .run();
  if (!added) {
    window.alert("That doesn't look like a YouTube link. Copy it from the video's Share button.");
  }
}

async function onImageChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  uploading.value = true;
  uploadError.value = null;
  try {
    const { url, width, height } = await uploadBlogImage(file);
    const alt =
      window.prompt(
        "Describe this picture for people who can't see it, e.g. “Our pharmacist giving a flu shot”",
      ) ?? "";
    editor.value
      ?.chain()
      .focus()
      .setImage({ src: url, alt: alt.trim(), width, height } as never)
      .run();
  } catch (err) {
    uploadError.value = (err as Error).message;
  } finally {
    uploading.value = false;
  }
}

interface Tool {
  label: string;
  icon?: string;
  text?: string;
  run: () => void;
  active?: () => boolean;
  disabled?: () => boolean;
}

const run = (fn: (chain: any) => any) => () => fn(editor.value!.chain().focus()).run();
const isActive = (name: string, attrs?: object) => () =>
  editor.value?.isActive(name, attrs) ?? false;

const toolbar: Tool[][] = [
  [
    {
      label: "Heading",
      text: "H2",
      run: run((c) => c.toggleHeading({ level: 2 })),
      active: isActive("heading", { level: 2 }),
    },
    {
      label: "Smaller heading",
      text: "H3",
      run: run((c) => c.toggleHeading({ level: 3 })),
      active: isActive("heading", { level: 3 }),
    },
  ],
  [
    { label: "Bold", icon: "fa6-solid:bold", run: run((c) => c.toggleBold()), active: isActive("bold") },
    { label: "Italic", icon: "fa6-solid:italic", run: run((c) => c.toggleItalic()), active: isActive("italic") },
    {
      label: "Underline",
      icon: "fa6-solid:underline",
      run: run((c) => c.toggleUnderline()),
      active: isActive("underline"),
    },
    { label: "Link", icon: "fa6-solid:link", run: editLink, active: isActive("link") },
  ],
  [
    {
      label: "Bulleted list",
      icon: "fa6-solid:list-ul",
      run: run((c) => c.toggleBulletList()),
      active: isActive("bulletList"),
    },
    {
      label: "Numbered list",
      icon: "fa6-solid:list-ol",
      run: run((c) => c.toggleOrderedList()),
      active: isActive("orderedList"),
    },
    {
      label: "Quote",
      icon: "fa6-solid:quote-left",
      run: run((c) => c.toggleBlockquote()),
      active: isActive("blockquote"),
    },
    { label: "Divider", icon: "fa6-solid:minus", run: run((c) => c.setHorizontalRule()) },
  ],
  [
    {
      label: "Picture",
      icon: "fa6-solid:image",
      run: () => imageInput.value?.click(),
      disabled: () => uploading.value,
    },
    { label: "YouTube video", icon: "fa6-brands:youtube", run: addVideo },
  ],
  [
    {
      label: "Undo",
      icon: "fa6-solid:arrow-rotate-left",
      run: run((c) => c.undo()),
      disabled: () => !editor.value?.can().undo(),
    },
    {
      label: "Redo",
      icon: "fa6-solid:arrow-rotate-right",
      run: run((c) => c.redo()),
      disabled: () => !editor.value?.can().redo(),
    },
  ],
];
</script>
