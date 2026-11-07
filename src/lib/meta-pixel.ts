export const META_PIXEL_ID = "2262829127982880";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackPageView() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

export function trackViewContent(title: string, id: string, price: number, currency = "BRL") {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: title,
      content_ids: [id],
      content_type: "product",
      value: price,
      currency,
    });
  }
}

export function trackAddToCart(title: string, id: string, price: number, currency = "BRL") {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: title,
      content_ids: [id],
      content_type: "product",
      value: price,
      currency,
    });
  }
}

export function trackInitiateCheckout(numItems: number, value: number, currency = "BRL") {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      num_items: numItems,
      value: value,
      currency,
    });
  }
}
