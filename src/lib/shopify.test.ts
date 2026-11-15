/// <reference types="bun" />
import { afterEach, expect, test } from "bun:test";
import { fetchShopifyProducts, getProductCategory, getShopifyImageUrl, type ShopifyProduct } from "./shopify";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("category filters include earrings beyond the first catalog page", async () => {
  const calls: Record<string, unknown>[] = [];
  globalThis.fetch = (async (_url, init) => {
    const { variables } = JSON.parse(String(init?.body));
    calls.push(variables);
    const secondPage = variables.after === "page-1";
    return Response.json({ data: { products: {
      edges: [{ node: { title: secondPage ? "Brinco Classic" : "Colar Riviera" } }],
      pageInfo: { hasNextPage: !secondPage, endCursor: secondPage ? "page-2" : "page-1" },
    } } });
  }) as typeof fetch;
  const products = await fetchShopifyProducts(50);
  expect(calls.map(call => call['after'])).toEqual([undefined, "page-1"]);
  expect(products.filter(product => getProductCategory(product) === "brincos").map(product => product.node.title)).toEqual(["Brinco Classic"]);
});

test("earring in an English title is not categorized as a ring", () => {
  expect(getProductCategory({ node: { title: "Hoop earrings" } } as ShopifyProduct)).toBe("brincos");
});

test("Shopify card images request a 600px derivative without losing the version", () => {
  const url = getShopifyImageUrl("https://cdn.shopify.com/s/files/1/example/files/colar.png?v=123", 600);
  expect(url).toBe("https://cdn.shopify.com/s/files/1/example/files/colar.png?v=123&width=600");
});

test("Shopify image sizing preserves an existing width parameter position safely", () => {
  const url = new URL(getShopifyImageUrl("https://cdn.shopify.com/s/files/1/example/files/colar.png?width=1200&v=123", 360));
  expect(url.searchParams.get("width")).toBe("360");
  expect(url.searchParams.get("v")).toBe("123");
});

test("an empty Shopify catalog stays empty", async () => {
  globalThis.fetch = (async (_url, _init) => Response.json({ data: { products: {
    edges: [], pageInfo: { hasNextPage: false, endCursor: null },
  } } })) as typeof fetch;
  expect(await fetchShopifyProducts()).toEqual([]);
});