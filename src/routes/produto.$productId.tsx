import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { fetchProductByHandle, fetchShopifyProducts, formatPrice, isContainFitProduct } from "@/lib/shopify";
import { getProductDescription } from "@/lib/product-descriptions";
import { filterGalleryByMetal } from "@/lib/product-filtering";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

const productQuery = (handle: string) =>
  queryOptions({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

const recommendationsQuery = queryOptions({
  queryKey: ["shopify-products"],
  queryFn: () => fetchShopifyProducts(),
});

export const Route = createFileRoute("/produto/$productId")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.productId));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const desc = loaderData
      ? getProductDescription(loaderData)
      : "Joia de edição limitada VESTA.";
    return {
      meta: [
        { title: `${loaderData?.title ?? "Joia"} — VESTA Joias` },
        { name: "description", content: desc },
        { property: "og:title", content: `${loaderData?.title ?? "Joia"} — VESTA` },
        { property: "og:description", content: desc },
        ...(loaderData?.images.edges[0]?.node.url.startsWith("https://")
          ? [
              { property: "og:image", content: loaderData.images.edges[0].node.url },
              { name: "twitter:image", content: loaderData.images.edges[0].node.url },
            ]
          : []),
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

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

  const displayDescription = getProductDescription(product);
  const details = [
    ["Descrição", `${displayDescription} Peça de alto padrão com acabamento polido.`],
    ["Materiais e cuidados", "Aço inoxidável cirúrgico com banho nobre de alta durabilidade. Totalmente à prova d'água e de suor. Limpe delicadamente com uma flanela seca para preservar o brilho espelhado."],
    ["Envio e trocas", "Envio segurado com código de rastreamento para todo o Brasil. Garantia incondicional de troca em até 7 dias após o recebimento."],
    ["Embalagem presente", "Todas as joias são entregues em embalagem especial Vesta, pronta para presentear com sofisticação e requinte."],
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
    toast.success(`${product.title} adicionado à sacola!`);
  };

  const recs = catalog.filter((item) => item.node.id !== product.id).slice(0, 4);

  // Filtra fotos genéricas de lote de fornecedor (banner repetido de 3 colares)
  const baseGalleryImages = product.images.edges
    .map((e) => e.node)
    .filter((img) => !img.url.includes("S86269fcc87bd4a7da443c69a4d1d6e97y"));

  // Filtra imagens da galeria de acordo com a variação selecionada (ex: Ouro vs Prata para produtos duplos)
  const galleryImages = filterGalleryByMetal(
    baseGalleryImages,
    selectedVariant?.title,
    variants,
    product.handle
  );

  return (
    <main className="pdp">
      <div className="breadcrumbs">
        <Link to="/">Início</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>
      <section className="pdp-layout">
        <div
          key={`gallery-${selectedVariant?.id ?? "default"}`}
          className={`pdp-gallery ${galleryImages.length <= 1 ? "single-image" : ""} ${isContainFitProduct(product.handle, product.title) ? "pdp-gallery--contain" : ""}`}
        >
          {galleryImages.map((node, index) => (
            <img
              key={node.url}
              src={node.url}
              alt={node.altText ?? product.title}
              width={1024}
              height={1280}
              loading="lazy"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))}
        </div>
        <div className="pdp-info">
          <p className="eyebrow">VESTA JOIAS</p>
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
                {selectedVariant && (
                  <span key={selectedVariant.id} className="selected-variant-label animated-fade">
                    {selectedVariant.title}
                  </span>
                )}
              </div>
              <div>
                {variants.map((variant) => {
                  const isSelected = variantId === variant.id;
                  const lower = variant.title.toLowerCase();
                  const isGold = lower.includes("gold") || lower.includes("ouro") || lower.includes("dourad");
                  const isSilver = lower.includes("silver") || lower.includes("prat");

                  return (
                    <Button
                      key={variant.id}
                      variant="outline"
                      className={`variant-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => setVariantId(variant.id)}
                      disabled={!variant.availableForSale}
                    >
                      {isGold && <span className="metal-swatch metal-gold" aria-hidden="true" />}
                      {isSilver && <span className="metal-swatch metal-silver" aria-hidden="true" />}
                      <span>{variant.title}</span>
                    </Button>
                  );
                })}
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
              <ProductAccordionItem key={title} title={title} content={content} />
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

function ProductAccordionItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`product-accordion-item ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="product-accordion-header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="product-accordion-title">{title}</span>
        <span className="product-accordion-icon" aria-hidden="true">+</span>
      </button>
      <div className="product-accordion-collapse">
        <div className="product-accordion-inner">
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
}

