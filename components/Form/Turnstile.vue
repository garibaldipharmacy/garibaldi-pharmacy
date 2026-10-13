<template>
  <!--
    Cloudflare Turnstile, replacing the Netlify reCAPTCHA widget.

    Renders nothing when no site key is configured, so local development and the
    test suite work without Cloudflare. The server skips verification in exactly
    the same circumstance, and the deploy checklist confirms both are set in
    production.

    Turnstile injects a hidden `cf-turnstile-response` input, which is what
    useRequestForm reads at submit time.
  -->
  <div v-if="siteKey">
    <div
      ref="container"
      class="cf-turnstile"
      :data-sitekey="siteKey"
      data-theme="light"
    />
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
            src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
            async: true,
            defer: true,
          },
        ],
      }
    : {},
);
</script>
