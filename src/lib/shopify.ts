import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2026-10";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "29gv1c-1r.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "3aa040a2d14c3d9543e83955162bd41d";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType?: string;
    tags?: string[];
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

export type ProductCategory = "todos" | "colares" | "pulseiras" | "brincos" | "aneis";

export function getProductCategory(product: ShopifyProduct): "colares" | "pulseiras" | "brincos" | "aneis" | "outros" {
  const title = (product.node.title || "").toLowerCase();
  const type = (product.node.productType || "").toLowerCase();
  const tags = (product.node.tags || []).map((t) => t.toLowerCase()).join(" ");
  const text = `${title} ${type} ${tags}`;

  if (text.includes("earring") || text.includes("brinco") || text.includes("argola") || text.includes("pendientes") || text.includes("hoop")) {
    return "brincos";
  }
  if (text.includes("ring") || text.includes("anel") || text.includes("anéis") || text.includes("aliança")) {
    return "aneis";
  }
  if (text.includes("bracelet") || text.includes("pulseira") || text.includes("bangle") || text.includes("bracelete") || text.includes("cuff")) {
    return "pulseiras";
  }
  if (text.includes("necklace") || text.includes("colar") || text.includes("pendant") || text.includes("choker") || text.includes("gargantilha") || text.includes("corrente")) {
    return "colares";
  }
  return "outros";
}

const CONTAIN_FIT_HANDLES = new Set([
  "square-pendants-delicate-stainless-steel-chain-pendant-necklace-for-women-necklace-3",
  "stainless-steel-bohemian-style-personalized-anklet-1",
]);

export function isContainFitProduct(handle?: string, title?: string): boolean {
  if (handle && CONTAIN_FIT_HANDLES.has(handle)) return true;
  if (!title) return false;
  const t = title.toLowerCase();
  return (t.includes("nó e pérolas") && t.includes("colar")) || t.includes("pulseiras glamour");
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.status === 402) {
      toast.error("Shopify: pagamento necessário", {
        description: "O acesso à API do Shopify exige um plano ativo. Acesse https://admin.shopify.com para atualizar o plano da loja.",
      });
      return null;
    }

    if (!response.ok) {
      console.warn(`Shopify HTTP error! status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.warn("Shopify API returned errors:", data.errors);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Shopify network request failed:", error);
    return null;
  }
}

export const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String, $after: String) {
    products(first: $first, query: $query, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          description
          handle
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

// `first` is the page size, not a total catalog limit.
export async function fetchShopifyProducts(first = 250, query?: string): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let after: string | undefined;
  do {
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query, after });
    const connection = data?.data?.products;
    if (!connection) throw new Error("Não foi possível carregar as joias. Tente novamente.");
    products.push(...(connection.edges as ShopifyProduct[]));
    if (!connection.pageInfo?.hasNextPage) break;
    const cursor = connection.pageInfo.endCursor;
    if (!cursor || cursor === after) throw new Error("Não foi possível carregar todas as joias.");
    after = cursor;
  } while (after);
  return products;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct["node"] | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return (data?.data?.product as ShopifyProduct["node"] | null) ?? null;
}

export const formatPrice = (amount: string | number, currencyCode = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode }).format(
    typeof amount === "string" ? parseFloat(amount) : amount,
  );

// ---------- Cart (Storefront API) ----------

export const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>): boolean {
  return userErrors.some(
    (e) => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"),
  );
}

export interface CartLineItem {
  variantId: string;
  quantity: number;
}

export async function createShopifyCart(item: CartLineItem): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error("Cart creation failed:", data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(
  cartId: string,
  item: CartLineItem,
): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Add line failed:", userErrors);
    return { success: false };
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find(
    (l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId,
  );
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Update line failed:", userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function removeLineFromShopifyCart(
  cartId: string,
  lineId: string,
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Remove line failed:", userErrors);
    return { success: false };
  }
  return { success: true };
}

export function getShopifyCartPermalink(items: Array<{ variantId: string; quantity: number }>): string {
  const cleanItems = items.filter((i) => i.variantId && !i.variantId.includes("anel-chama") && !i.variantId.includes("default"));
  if (cleanItems.length === 0) return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/cart`;
  const lines = cleanItems.map((i) => `${i.variantId.split("/").pop()}:${i.quantity}`).join(",");
  return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/cart/${lines}?channel=online_store`;
}

export async function createShopifyCartFromLines(
  items: Array<{ variantId: string; quantity: number }>,
): Promise<{ cartId: string; checkoutUrl: string; lineMap: Record<string, string> } | null> {
  const lines = items.map((i) => ({ quantity: i.quantity, merchandiseId: i.variantId }));
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, { input: { lines } });
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineMap: Record<string, string> = {};
  const lineEdges = cart.lines?.edges ?? [];
  lineEdges.forEach((e: { node: { id: string; merchandise: { id: string } } }) => {
    if (e.node?.merchandise?.id) {
      lineMap[e.node.merchandise.id] = e.node.id;
    }
  });
  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
    lineMap,
  };
}
