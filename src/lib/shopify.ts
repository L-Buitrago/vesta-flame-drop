import { toast } from "sonner";
import anelChama from "@/assets/anel-chama.jpg";
import brincosOliva from "@/assets/brincos-oliva.jpg";
import colarEmber from "@/assets/colar-ember.jpg";
import pulseiraHestia from "@/assets/pulseira-hestia.jpg";

export const SHOPIFY_API_VERSION = "2025-07";
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

  if (text.includes("ring") || text.includes("anel") || text.includes("anéis") || text.includes("aliança")) {
    return "aneis";
  }
  if (text.includes("earring") || text.includes("brinco") || text.includes("argola") || text.includes("pendientes") || text.includes("hoop")) {
    return "brincos";
  }
  if (text.includes("bracelet") || text.includes("pulseira") || text.includes("bangle") || text.includes("bracelete") || text.includes("cuff")) {
    return "pulseiras";
  }
  if (text.includes("necklace") || text.includes("colar") || text.includes("pendant") || text.includes("choker") || text.includes("gargantilha") || text.includes("corrente")) {
    return "colares";
  }
  return "outros";
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
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
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

export const FALLBACK_PRODUCTS: ShopifyProduct[] = [
  {
    node: {
      id: "gid://shopify/Product/anel-chama",
      title: "Anel Chama",
      description: "Uma chama esculpida em ouro 18k, polida à mão para capturar e devolver a luz.",
      handle: "anel-chama",
      priceRange: { minVariantPrice: { amount: "1890.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: anelChama, altText: "Anel Chama em ouro 18k" } },
          { node: { url: pulseiraHestia, altText: "Anel Chama vista aproximada" } },
        ],
      },
      variants: {
        edges: [12, 14, 16, 18, 20].map((size) => ({
          node: {
            id: `gid://shopify/ProductVariant/anel-chama-${size}`,
            title: `Aro ${size}`,
            price: { amount: "1890.00", currencyCode: "BRL" },
            availableForSale: true,
            selectedOptions: [{ name: "Tamanho", value: `Aro ${size}` }],
          },
        })),
      },
      options: [{ name: "Tamanho", values: ["Aro 12", "Aro 14", "Aro 16", "Aro 18", "Aro 20"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/brincos-oliva",
      title: "Brincos Oliva",
      description: "Folhas de oliveira em ouro 18k, símbolo de permanência e serenidade.",
      handle: "brincos-oliva",
      priceRange: { minVariantPrice: { amount: "1490.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: brincosOliva, altText: "Brincos Oliva em ouro 18k" } },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/brincos-oliva-default",
              title: "Tamanho único",
              price: { amount: "1490.00", currencyCode: "BRL" },
              availableForSale: true,
              selectedOptions: [{ name: "Title", value: "Tamanho único" }],
            },
          },
        ],
      },
      options: [{ name: "Title", values: ["Tamanho único"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/colar-ember",
      title: "Colar Ember",
      description: "Uma centelha delicada suspensa por corrente fina em ouro 18k.",
      handle: "colar-ember",
      priceRange: { minVariantPrice: { amount: "2190.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: colarEmber, altText: "Colar Ember em ouro 18k" } },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/colar-ember-default",
              title: "45cm",
              price: { amount: "2190.00", currencyCode: "BRL" },
              availableForSale: true,
              selectedOptions: [{ name: "Comprimento", value: "45cm" }],
            },
          },
        ],
      },
      options: [{ name: "Comprimento", values: ["45cm"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/pulseira-hestia",
      title: "Pulseira Héstia",
      description: "Bracelete em ouro 18k gravado com o movimento contínuo do fogo.",
      handle: "pulseira-hestia",
      priceRange: { minVariantPrice: { amount: "3900.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: pulseiraHestia, altText: "Pulseira Héstia em ouro 18k" } },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/pulseira-hestia-default",
              title: "Tamanho único",
              price: { amount: "3900.00", currencyCode: "BRL" },
              availableForSale: false,
              selectedOptions: [{ name: "Title", value: "Tamanho único" }],
            },
          },
        ],
      },
      options: [{ name: "Title", values: ["Tamanho único"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/brinco-alento",
      title: "Brinco Alento",
      description: "Um traço de ouro leve como o primeiro sopro que acende a chama.",
      handle: "brinco-alento",
      priceRange: { minVariantPrice: { amount: "890.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: brincosOliva, altText: "Brinco Alento em ouro 18k" } },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/brinco-alento-default",
              title: "Tamanho único",
              price: { amount: "890.00", currencyCode: "BRL" },
              availableForSale: true,
              selectedOptions: [{ name: "Title", value: "Tamanho único" }],
            },
          },
        ],
      },
      options: [{ name: "Title", values: ["Tamanho único"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/gargantilha-ignea",
      title: "Gargantilha Ígnea",
      description: "O calor do ouro desenhado rente à pele em uma linha essencial.",
      handle: "gargantilha-ignea",
      priceRange: { minVariantPrice: { amount: "2890.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: colarEmber, altText: "Gargantilha Ígnea em ouro 18k" } },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/gargantilha-ignea-default",
              title: "40cm",
              price: { amount: "2890.00", currencyCode: "BRL" },
              availableForSale: true,
              selectedOptions: [{ name: "Comprimento", value: "40cm" }],
            },
          },
        ],
      },
      options: [{ name: "Comprimento", values: ["40cm"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/anel-solsticio",
      title: "Anel Solstício",
      description: "Volumes luminosos celebram o instante em que a luz muda de direção.",
      handle: "anel-solsticio",
      priceRange: { minVariantPrice: { amount: "2490.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: anelChama, altText: "Anel Solstício em ouro 18k" } },
        ],
      },
      variants: {
        edges: [12, 14, 16, 18, 20].map((size) => ({
          node: {
            id: `gid://shopify/ProductVariant/anel-solsticio-${size}`,
            title: `Aro ${size}`,
            price: { amount: "2490.00", currencyCode: "BRL" },
            availableForSale: true,
            selectedOptions: [{ name: "Tamanho", value: `Aro ${size}` }],
          },
        })),
      },
      options: [{ name: "Tamanho", values: ["Aro 12", "Aro 14", "Aro 16", "Aro 18", "Aro 20"] }],
    },
  },
  {
    node: {
      id: "gid://shopify/Product/alianca-vesta",
      title: "Aliança Vesta",
      description: "Um círculo contínuo, lapidado para atravessar gerações.",
      handle: "alianca-vesta",
      priceRange: { minVariantPrice: { amount: "1290.00", currencyCode: "BRL" } },
      images: {
        edges: [
          { node: { url: pulseiraHestia, altText: "Aliança Vesta em ouro 18k" } },
        ],
      },
      variants: {
        edges: [12, 14, 16, 18, 20].map((size) => ({
          node: {
            id: `gid://shopify/ProductVariant/alianca-vesta-${size}`,
            title: `Aro ${size}`,
            price: { amount: "1290.00", currencyCode: "BRL" },
            availableForSale: true,
            selectedOptions: [{ name: "Tamanho", value: `Aro ${size}` }],
          },
        })),
      },
      options: [{ name: "Tamanho", values: ["Aro 12", "Aro 14", "Aro 16", "Aro 18", "Aro 20"] }],
    },
  },
];

export async function fetchShopifyProducts(first = 50, query?: string): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
  const edges = (data?.data?.products?.edges ?? []) as ShopifyProduct[];
  if (edges.length > 0) {
    return edges;
  }
  let filtered = FALLBACK_PRODUCTS;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((p) => p.node.title.toLowerCase().includes(q) || p.node.description.toLowerCase().includes(q));
  }
  return filtered.slice(0, first);
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct["node"] | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const product = data?.data?.product as ShopifyProduct["node"] | null;
  if (product) {
    return product;
  }
  const fallback = FALLBACK_PRODUCTS.find((p) => p.node.handle === handle);
  return fallback ? fallback.node : null;
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
