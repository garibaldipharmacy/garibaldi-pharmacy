// The parts of Cloudflare Turnstile's browser API the forms use
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
}

interface Turnstile {
  render(container: HTMLElement, options: TurnstileRenderOptions): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export {};
