export const META_PIXEL_ID = "2262829127982880";

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let advertisingAllowed = false;
let scriptRequested = false;
let initialized = false;
let hasRevoked = false;
let pendingPageView = false;

function ensureFbq(): Fbq {
  if (window.fbq) return window.fbq;
  const fbq = function (this: Fbq, ...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod.apply(fbq, args);
    } else {
      fbq.queue.push(args);
    }
  } as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  return fbq;
}

function requestPixel() {
  if (scriptRequested || typeof document === "undefined") return;
  scriptRequested = true;
  const fbq = ensureFbq();
  if (hasRevoked) fbq("consent", "grant");
  if (!initialized) {
    fbq("init", META_PIXEL_ID, {}, { agent: "lovable" });
    initialized = true;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.dataset["vestaMetaPixel"] = "true";
  document.head.appendChild(script);
}

export function setMetaPixelPermission(allowed: boolean) {
  advertisingAllowed = allowed;
  if (typeof window === "undefined") return;
  if (!allowed) {
    pendingPageView = false;
    if (window.fbq) {
      window.fbq("consent", "revoke");
      hasRevoked = true;
    }
    return;
  }
  requestPixel();
  if (pendingPageView) {
    pendingPageView = false;
    window.fbq?.("track", "PageView");
  }
}

function emit(...args: unknown[]) {
  if (typeof window === "undefined" || !advertisingAllowed || !window.fbq) return;
  window.fbq(...args);
}

export function trackPageView(permitted: boolean) {
  if (typeof window === "undefined" || !permitted) return;
  pendingPageView = true;
  if (!advertisingAllowed || !window.fbq) return;
  pendingPageView = false;
  emit("track", "PageView");
}

export function trackViewContent(title: string, id: string, price: number, currency = "BRL") {
  emit("track", "ViewContent", {
    content_name: title,
    content_ids: [id],
    content_type: "product",
    value: price,
    currency,
  });
}

export function trackAddToCart(title: string, id: string, price: number, currency = "BRL") {
  emit("track", "AddToCart", {
    content_name: title,
    content_ids: [id],
    content_type: "product",
    value: price,
    currency,
  });
}

export function trackInitiateCheckout(numItems: number, value: number, currency = "BRL") {
  emit("track", "InitiateCheckout", {
    num_items: numItems,
    value,
    currency,
  });
}
