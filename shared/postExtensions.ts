// The Tiptap extensions a post is written and rendered with. The editor and
// the server's HTML renderer share this list, so what the owner sees while
// writing is what visitors get. The allowlist in shared/postDoc.ts must
// cover exactly these.

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

// Width and height are kept so the page reserves the picture's space before
// it loads, rather than jumping as it arrives
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
    };
  },
}).configure({
  HTMLAttributes: { loading: "lazy", decoding: "async" },
});

export const postExtensions = [
  StarterKit.configure({
    // h1 is the post's title, so the body starts at h2
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      // Links to our own pages shouldn't open new tabs, and links out
      // aren't paid placements, so no target or nofollow
      HTMLAttributes: { target: null, rel: null },
    },
  }),
  SizedImage,
  Youtube.configure({
    // youtube-nocookie.com: no tracking cookies until someone presses play
    nocookie: true,
    modestBranding: true,
    rel: 0,
    width: 640,
    height: 360,
  }),
];
