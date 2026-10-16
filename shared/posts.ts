// Blog posts and the homepage announcement: limits, wire format and the
// rules for what a valid post is. Shared so the editor can show the same
// limits the server enforces.

import { MEDIA_PATH, docHasContent, sanitizeDoc, type DocNode } from "./postDoc";

export const POST_LIMITS = {
  title: 120,
  slug: 80,
  // Cards and search results show about this much
  excerpt: 200,
  // Fits the announcement pill on one line on a laptop and two on a phone
  snippet: 70,
  coverAlt: 300,
  // Serialized body, as a backstop against a runaway paste
  bodyBytes: 1_000_000,
} as const;

export type PostStatus = "draft" | "published";

// What visitors can filter the blog by. Fixed here rather than editable, so
// the list stays short and tidy. The slug is what's stored and goes in the
// address; renaming a label is safe, changing a slug needs a data update
export const POST_CATEGORIES = [
  { slug: "news", label: "Pharmacy news" },
  { slug: "health-tips", label: "Health tips" },
  { slug: "medications", label: "Medications" },
  { slug: "vaccines", label: "Vaccines" },
  { slug: "compounding", label: "Compounding" },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]["slug"];

export function isPostCategory(value: unknown): value is PostCategory {
  return POST_CATEGORIES.some((c) => c.slug === value);
}

export function categoryLabel(slug: string): string {
  return POST_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/** Posts per page on the public blog: four rows of three */
export const BLOG_PAGE_SIZE = 12;
/** Posts per page in the admin list */
export const ADMIN_PAGE_SIZE = 25;
/** Longest search accepted, in characters */
export const SEARCH_MAX = 100;

export interface PostAnnouncement {
  snippet: string;
  /** UTC ISO strings. Shown from startsAt, until endsAt */
  startsAt: string;
  endsAt: string;
}

export type AnnouncementState = "scheduled" | "active" | "ended";

export interface PostInput {
  title: string;
  slug: string;
  /** Empty means "use the start of the post" */
  excerpt: string;
  coverImage: string | null;
  coverAlt: string;
  category: PostCategory;
  body: DocNode;
  status: PostStatus;
  announcement: PostAnnouncement | null;
}

/** A post as the editor sees it */
export interface PostDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  coverImage: string | null;
  coverAlt: string;
  body: DocNode;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  announcement: (PostAnnouncement & { state: AnnouncementState }) | null;
}

export type PostSummaryDTO = Omit<PostDTO, "body">;

/** A published post as visitors see it */
export interface PublicPostSummaryDTO {
  slug: string;
  title: string;
  /** The excerpt, or the start of the post when there isn't one */
  summary: string;
  coverImage: string | null;
  coverAlt: string;
  category: PostCategory;
  publishedAt: string;
  /** Currently featured on the homepage */
  isAnnouncement: boolean;
}

/** One page of a post list, with what's needed to draw its page links */
export interface PostPage<T> {
  posts: T[];
  total: number;
  page: number;
  pageCount: number;
}

/** The public blog's list, plus which categories have any posts */
export interface BlogPageDTO extends PostPage<PublicPostSummaryDTO> {
  categories: { slug: PostCategory; label: string }[];
}

export type AdminStatusFilter = "all" | "published" | "draft" | "announcement";

export interface PublicPostDTO extends PublicPostSummaryDTO {
  html: string;
  updatedAt: string;
  /** Only ever true for a signed-in preview */
  isDraft: boolean;
}

export interface CurrentAnnouncementDTO {
  snippet: string;
  slug: string;
}

export interface AnnouncementResponse {
  announcement: CurrentAnnouncementDTO | null;
}

/** "Why is Ozempic useful?" → "why-is-ozempic-useful" */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, POST_LIMITS.slug)
    .replace(/-+$/, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function announcementState(
  { startsAt, endsAt }: Pick<PostAnnouncement, "startsAt" | "endsAt">,
  now = Date.now(),
): AnnouncementState {
  if (now < Date.parse(startsAt)) return "scheduled";
  if (now < Date.parse(endsAt)) return "active";
  return "ended";
}

export type ValidationResult =
  | { ok: true; value: PostInput }
  | { ok: false; errors: Record<string, string> };

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Checks and normalizes a post from the editor. Errors are keyed by field */
export function validatePostInput(raw: unknown): ValidationResult {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const title = str(input.title);
  if (!title) errors.title = "Add a title.";
  else if (title.length > POST_LIMITS.title)
    errors.title = `Keep the title under ${POST_LIMITS.title} characters.`;

  const slug = str(input.slug) || slugify(title);
  if (!slug) errors.slug = "Add a web address for the post.";
  else if (slug.length > POST_LIMITS.slug || !SLUG_PATTERN.test(slug))
    errors.slug = "Use lowercase letters, numbers and dashes only.";

  const excerpt = str(input.excerpt);
  if (excerpt.length > POST_LIMITS.excerpt)
    errors.excerpt = `Keep the summary under ${POST_LIMITS.excerpt} characters.`;

  const coverImage = str(input.coverImage) || null;
  if (coverImage && !MEDIA_PATH.test(coverImage))
    errors.coverImage = "Upload the cover picture again.";
  const coverAlt = str(input.coverAlt).slice(0, POST_LIMITS.coverAlt);
  if (coverImage && !coverAlt)
    errors.coverAlt = "Describe the picture for people who can't see it.";

  const status: PostStatus = input.status === "published" ? "published" : "draft";

  const category = input.category ?? "news";
  if (!isPostCategory(category)) errors.category = "Choose a category.";

  let body: DocNode = { type: "doc" };
  if (JSON.stringify(input.body ?? null).length > POST_LIMITS.bodyBytes) {
    errors.body = "This post is too long to save.";
  } else {
    body = sanitizeDoc(input.body);
    if (status === "published" && !docHasContent(body))
      errors.body = "Write something before publishing.";
  }

  let announcement: PostAnnouncement | null = null;
  const rawAnnouncement = input.announcement as Record<string, unknown> | null;
  if (rawAnnouncement && typeof rawAnnouncement === "object") {
    const snippet = str(rawAnnouncement.snippet).replace(/\s+/g, " ");
    const startsAt = str(rawAnnouncement.startsAt);
    const endsAt = str(rawAnnouncement.endsAt);
    const starts = Date.parse(startsAt);
    const ends = Date.parse(endsAt);

    if (!snippet) errors.snippet = "Add the line shown on the homepage.";
    else if (snippet.length > POST_LIMITS.snippet)
      errors.snippet = `Keep it to ${POST_LIMITS.snippet} characters so it fits on phones.`;
    if (Number.isNaN(starts)) errors.startsAt = "Choose when it starts.";
    if (Number.isNaN(ends)) errors.endsAt = "Choose when it ends.";
    else if (!Number.isNaN(starts) && ends <= starts)
      errors.endsAt = "The end has to be after the start.";

    if (!errors.snippet && !errors.startsAt && !errors.endsAt) {
      announcement = {
        snippet,
        startsAt: new Date(starts).toISOString(),
        endsAt: new Date(ends).toISOString(),
      };
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title,
      slug,
      excerpt,
      coverImage,
      coverAlt,
      category: category as PostCategory,
      body,
      status,
      announcement,
    },
  };
}
