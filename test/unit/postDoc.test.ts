import { describe, expect, it } from "vitest";
import { docHasContent, docText, safeHref, sanitizeDoc } from "~~/shared/postDoc";
import { renderBody } from "~~/server/utils/posts";

const MEDIA = "/media/0b0f8a5e-5d0c-4c47-9d0e-3f6b1f2a7c11.jpg";

const paragraph = (...content: unknown[]) => ({ type: "paragraph", content });
const text = (value: string, marks?: unknown[]) => ({ type: "text", text: value, marks });
const doc = (...content: unknown[]) => ({ type: "doc", content });

describe("safeHref", () => {
  it("allows web, email, phone and our own pages", () => {
    for (const href of [
      "https://www.healthlinkbc.ca/",
      "http://example.com",
      "mailto:pharmacist@garibaldipharmacy.com",
      "tel:604-848-7059",
      "/services/immunizations/",
    ]) {
      expect(safeHref(href)).toBe(href);
    }
  });

  it("refuses anything that could run code or leave the protocol list", () => {
    for (const href of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,<script>",
      "//evil.example",
      "vbscript:x",
      "https://ex ample.com",
    ]) {
      expect(safeHref(href)).toBeNull();
    }
  });
});

describe("sanitizeDoc", () => {
  it("keeps everything the toolbar can make", () => {
    const input = doc(
      { type: "heading", attrs: { level: 2 }, content: [text("Title")] },
      paragraph(
        text("bold", [{ type: "bold" }]),
        text("link", [{ type: "link", attrs: { href: "/contact/" } }]),
      ),
      { type: "bulletList", content: [{ type: "listItem", content: [paragraph(text("a"))] }] },
      { type: "image", attrs: { src: MEDIA, alt: "Our counter", width: 800, height: 600 } },
      { type: "youtube", attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } },
    );
    expect(sanitizeDoc(input)).toEqual(input);
  });

  it("drops unknown nodes, marks and attributes", () => {
    const cleaned = sanitizeDoc(
      doc(
        { type: "iframe", attrs: { src: "https://evil.example" } },
        paragraph(text("hi", [{ type: "fontColor" }, { type: "bold" }])),
        { type: "paragraph", attrs: { onclick: "x" }, content: [text("there")] },
      ),
    );
    expect(cleaned).toEqual(
      doc(paragraph(text("hi", [{ type: "bold" }])), paragraph(text("there"))),
    );
  });

  it("drops pictures from anywhere but our uploads, and videos from anywhere but YouTube", () => {
    const cleaned = sanitizeDoc(
      doc(
        { type: "image", attrs: { src: "https://tracker.example/pixel.gif" } },
        { type: "image", attrs: { src: "/media/../../etc/passwd" } },
        { type: "youtube", attrs: { src: "https://evil.example/embed/x" } },
      ),
    );
    expect(cleaned).toEqual({ type: "doc" });
  });

  it("drops a link mark with a dangerous address but keeps its words", () => {
    const cleaned = sanitizeDoc(
      doc(paragraph(text("click", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]))),
    );
    expect(cleaned).toEqual(doc(paragraph(text("click"))));
  });

  it("only allows the heading levels below the post title", () => {
    const cleaned = sanitizeDoc(doc({ type: "heading", attrs: { level: 1 }, content: [text("x")] }));
    expect(cleaned).toEqual({ type: "doc" });
  });

  it("turns garbage into an empty document", () => {
    expect(sanitizeDoc("<script>")).toEqual({ type: "doc" });
    expect(sanitizeDoc({ type: "paragraph" })).toEqual({ type: "doc" });
  });
});

describe("rendering", () => {
  it("escapes text and builds a privacy-friendly YouTube embed", () => {
    const html = renderBody(
      sanitizeDoc(
        doc(
          paragraph(text("<script>alert(1)</script>")),
          { type: "youtube", attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } },
        ),
      ),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("doesn't open links in new tabs or mark them nofollow", () => {
    const html = renderBody(
      sanitizeDoc(doc(paragraph(text("Contact", [{ type: "link", attrs: { href: "/contact/" } }])))),
    );
    expect(html).toBe('<p><a href="/contact/">Contact</a></p>');
  });

  it("lazy-loads pictures and reserves their space", () => {
    const html = renderBody(
      sanitizeDoc(doc({ type: "image", attrs: { src: MEDIA, alt: "Our counter", width: 800, height: 600 } })),
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="800"');
    expect(html).toContain('alt="Our counter"');
  });
});

describe("docText and docHasContent", () => {
  it("joins paragraphs with spaces", () => {
    expect(docText(sanitizeDoc(doc(paragraph(text("One.")), paragraph(text("Two.")))))).toBe(
      "One. Two.",
    );
  });

  it("counts a lone picture or video as content", () => {
    expect(docHasContent({ type: "doc" })).toBe(false);
    expect(docHasContent(sanitizeDoc(doc({ type: "image", attrs: { src: MEDIA } })))).toBe(true);
  });
});
