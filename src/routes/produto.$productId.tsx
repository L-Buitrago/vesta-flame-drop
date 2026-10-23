import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { fetchProductByHandle, fetchShopifyProducts, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

const productQuery = (handle: string) =>
  queryOptions({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

const recommendationsQuery = queryOptions({
  queryKey: ["shopify-products"],
  queryFn: () => fetchShopifyProducts(20),
});

export const Route = createFileRoute("/produto/$productId")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.productId));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Joia"} — VESTA Fine Jewelry` },
    { name: "description", content: loaderData?.description ?? "Joia de edição limitada VESTA." },
    { property: "og:title", content: `${loaderData?.title ?? "Joia"} — VESTA` },
    { property: "og:description", content: loaderData?.description ?? "Joia de edição limitada VESTA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: ProductPage,
});

function formatProductDescription(description?: string) {
  if (!description || description.trim() === "") {
    return "Joia fina com acabamento refinado e cravação de alta precisão. Uma peça versátil e atemporal criada para elevar qualquer composição com brilho e sofisticação.";
  }
  if (description.includes("SPECIFICATIONS") || description.includes("High-concerned chemical")) {
    return "Pulseira com cravação de alta precisão e banho especial. Design atemporal e elegante que reflete a luz com intensidade em todos os ângulos.";
  }
  return description;
}

function ProductPage() {
  const { productId } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(productId));
  const { data: catalog } = useSuspenseQuery(recommendationsQuery);
  const { addItem, isLoading } = useCartStore();

  const variants = product?.variants.edges.map((e) => e.node) ?? [];
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const selectedVariant = variants.find((v) => v.id === variantId) ?? variants[0];
  const hasOptions = (product?.options ?? []).some((o) => o.name !== "Title" || o.values.length > 1);

  if (!product) return null;

  const displayDescription = formatProductDescription(product.description);
  const details = [
    ["Descrição", `${displayDescription} Peça de alto padrão com acabamento polido.`],
    ["Materiais e cuidados", "Limpe delicadamente com uma flanela seca. Evite contato com perfumes, cremes e água do mar."],
    ["Envio e trocas", "Envio segurado com rastreio para todo o Brasil. Trocas em até 7 dias após o recebimento."],
    ["Embalagem presente", "Todas as joias chegam em nossa embalagem especial, pronta para presentear."],
  ];

  const handleAdd = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions ?? [],
    });
  };

  const recs = catalog.filter((item) => item.node.id !== product.id).slice(0, 4);

  return (
    <main className="pdp">
      <div className="breadcrumbs">
        <Link to="/">Início</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>
      <section className="pdp-layout">
        <div className="pdp-gallery">
          {product.images.edges.map(({ node }) => (
            <img key={node.url} src={node.url} alt={node.altText ?? product.title} width={1024} height={1280} loading="lazy" />
          ))}
        </div>
        <div className="pdp-info">
          <p className="eyebrow">VESTA FINE JEWELRY</p>
          <h1>{product.title}</h1>
          <p className="pdp-price">
            {formatPrice(
              selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount,
              selectedVariant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode,
            )}
          </p>
          <p className="pdp-description">{displayDescription}</p>
          {hasOptions && variants.length > 1 && (
            <div className="sizes">
              <div>
                <span>{product.options[0]?.name ?? "Variação"}</span>
                {selectedVariant && <span className="selected-variant-label">{selectedVariant.title}</span>}
              </div>
              <div>
                {variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant="outline"
                    className={variantId === variant.id ? "selected" : ""}
                    onClick={() => setVariantId(variant.id)}
                    disabled={!variant.availableForSale}
                  >
                    {variant.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <Button
            className="vesta-button add-button"
            disabled={!selectedVariant?.availableForSale || isLoading}
            onClick={handleAdd}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : selectedVariant?.availableForSale ? "Adicionar à sacola" : "Esgotado"}
          </Button>
          <div className="product-accordions">
            {details.map(([title, content]) => (
              <details key={title}>
                <summary>
                  {title}
                  <span>+</span>
                </summary>
                <p>{content}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {recs.length > 0 && (
        <section className="recommendations">
          <div className="section-heading">
            <h2>Complete o look</h2>
            <p>Curadoria Vesta</p>
          </div>
          <div className={`product-grid count-${Math.min(recs.length, 4)}`}>
            {recs.map((item) => (
              <ProductCard key={item.node.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
