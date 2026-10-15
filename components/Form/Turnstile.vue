<template>
  <!--
    Cloudflare Turnstile, replacing the Netlify reCAPTCHA widget.

    Renders nothing when no site key is configured, so local development and the
    test suite work without Cloudflare. The server skips verification in exactly
    the same circumstance, and the deploy checklist confirms both are set in
    production.

    Rendered explicitly on mount rather than by Turnstile scanning the page
    for .cf-turnstile, which it only does once, when its script first loads.
    Moving to another form within the site would otherwise leave no widget.
    Turnstile injects a hidden `cf-turnstile-response` input, which is what
    useRequestForm reads at submit time.
  -->
  <div v-if="siteKey">
    <div ref="container" />
    <noscript>
      <p class="text-sm text-red-700">
        JavaScript is required to submit this form. Please call us at 604-848-7059
        instead.
      </p>
    </noscript>
  </div>
</template>

<script setup lang="ts">
const siteKey = useRuntimeConfig().public.turnstileSiteKey as string | undefined;
const container = ref<HTMLElement | null>(null);

useHead(
  siteKey
    ? {
        script: [
          {
            src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
            async: true,
            defer: true,
          },
        ],
      }
    : {},
);

let widgetId: string | undefined;
let waiting: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (!siteKey) return;
  // The script may still be loading on a first visit
  const render = () => {
    if (!window.turnstile || !container.value) return false;
    widgetId = window.turnstile.render(container.value, {
      sitekey: siteKey,
      theme: "light",
    });
    return true;
  };
  if (render()) return;
  waiting = setInterval(() => {
    if (render()) clearInterval(waiting);
  }, 100);
});

onBeforeUnmount(() => {
  clearInterval(waiting);
  if (widgetId !== undefined) window.turnstile?.remove(widgetId);
});
</script>
