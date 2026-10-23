// The allowlist for a post's body.
//
// The editor saves Tiptap's JSON document. The server never trusts it: every
// node, mark and attribute is checked against this list, and anything else is
// dropped, before the document is turned into the HTML visitors see. The
// list is the editor's toolbar and nothing more, so a hand-crafted request
// can't smuggle in a script, a tracking pixel or an iframe from anywhere but
// YouTube.
//
// No Tiptap imports here, so it is cheap to load and testable in plain vitest.

export interface DocNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

/** Images in a post must be ones uploaded through the editor */
export const MEDIA_PATH = /^\/media\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/;

const MAX_DEPTH = 12;
const MAX_TEXT = 20_000;
const MAX_ALT = 300;
const MAX_HREF = 2000;

type Attrs = Record<string, unknown>;
// Returns the attributes to keep, or null to drop the whole node
type AttrRule = (attrs: Attrs) => Attrs | null;

const none: AttrRule = () => ({});

const positiveInt = (value: unknown) =>
  Number.isInteger(value) && (value as number) > 0 && (value as number) < 100_000
    ? (value as number)
    : null;

/** Web, email, phone or a page on this site. Never javascript: or data: */
export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href || href.length > MAX_HREF || /[\s<>"]/.test(href)) return null;
  if (/^\/(?!\/)/.test(href)) return href;
  if (/^(?:mailto|tel):/i.test(href)) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? href : null;
  } catch {
    return null;
  }
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
]);

export function safeYoutubeSrc(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_HREF) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && YOUTUBE_HOSTS.has(url.hostname)
      ? value
      : null;
  } catch {
    return null;
  }
}

const NODES: Record<string, AttrRule> = {
  doc: none,
  paragraph: none,
  text: none,
  heading: (a) => (a.level === 2 || a.level === 3 ? { level: a.level } : null),
  bulletList: none,
  orderedList: (a) => ({ start: positiveInt(a.start) ?? 1 }),
  listItem: none,
  blockquote: none,
  hardBreak: none,
  horizontalRule: none,
  image: (a) => {
    if (typeof a.src !== "string" || !MEDIA_PATH.test(a.src)) return null;
    return {
      src: a.src,
      alt: typeof a.alt === "string" ? a.alt.slice(0, MAX_ALT) : "",
      width: positiveInt(a.width),
      height: positiveInt(a.height),
    };
  },
  youtube: (a) => {
    const src = safeYoutubeSrc(a.src);
    return src ? { src } : null;
  },
};

const MARKS: Record<string, AttrRule> = {
  bold: none,
  italic: none,
  underline: none,
  strike: none,
  link: (a) => {
    const href = safeHref(a.href);
    return href ? { href } : null;
  },
};

function clean(node: unknown, depth: number): DocNode | null {
  if (!node || typeof node !== "object" || depth > MAX_DEPTH) return null;
  const { type, attrs, content, marks, text } = node as DocNode;
  const rule = typeof type === "string" ? NODES[type] : undefined;
  if (!rule) return null;

  const keptAttrs = rule(attrs && typeof attrs === "object" ? attrs : {});
  if (!keptAttrs) return null;

  const out: DocNode = { type };
  if (Object.keys(keptAttrs).length) out.attrs = keptAttrs;

  if (type === "text") {
    if (typeof text !== "string" || !text) return null;
    out.text = text.slice(0, MAX_TEXT);
    if (Array.isArray(marks)) {
      const kept = marks.flatMap((mark) => {
        const markRule =
          mark && typeof mark.type === "string" ? MARKS[mark.type] : undefined;
        const markAttrs = markRule?.(mark.attrs ?? {});
        if (!markAttrs) return [];
        return Object.keys(markAttrs).length
          ? [{ type: mark.type, attrs: markAttrs }]
          : [{ type: mark.type }];
      });
      if (kept.length) out.marks = kept;
    }
    return out;
  }

  if (Array.isArray(content)) {
    const kept = content
      .map((child) => clean(child, depth + 1))
      .filter((child): child is DocNode => child !== null);
    if (kept.length) out.content = kept;
  }
  return out;
}

/** The document with everything outside the allowlist removed */
export function sanitizeDoc(doc: unknown): DocNode {
  const cleaned = clean(doc, 0);
  return cleaned?.type === "doc" ? cleaned : { type: "doc" };
}

/** The document's words, for excerpts and search descriptions */
export function docText(doc: DocNode): string {
  const words: string[] = [];
  const walk = (node: DocNode) => {
    if (node.text) words.push(node.text);
    node.content?.forEach((child) => {
      walk(child);
      // Keeps paragraphs from running into each other
      if (child.type !== "text") words.push(" ");
    });
  };
  walk(doc);
  return words.join("").replace(/\s+/g, " ").trim();
}

/** Whether the document has any words, pictures or videos in it */
export function docHasContent(doc: DocNode): boolean {
  if (docText(doc)) return true;
  const walk = (node: DocNode): boolean =>
    node.type === "image" ||
    node.type === "youtube" ||
    (node.content ?? []).some(walk);
  return walk(doc);
}
