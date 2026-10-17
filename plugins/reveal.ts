// v-reveal: fades an element up the first time it scrolls into view. Pass a
// number to stagger it, e.g. v-reveal="index * 100" delays it by that many ms.
// Elements stay fully visible when JavaScript doesn't run or the visitor
// prefers reduced motion, since the hidden state is only added on the client
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, number | undefined>("reveal", {
    mounted(el, binding) {
      if (
        !("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      el.style.setProperty("--reveal-delay", `${binding.value ?? 0}ms`);
      el.classList.add("reveal");

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.classList.add("is-revealed");
          observer.disconnect();
        },
        // The huge top margin counts anything above the screen as seen, so
        // jumping past an element (e.g. to the bottom of the page) still
        // reveals it rather than leaving it hidden. The bottom margin waits
        // until it's a little way into view
        { rootMargin: "100000px 0px -10% 0px" }
      );
      observer.observe(el);
    },
    getSSRProps: () => ({}),
  });
});
