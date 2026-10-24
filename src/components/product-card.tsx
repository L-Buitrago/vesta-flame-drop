import { Link } from "@tanstack/react-router";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

// Identificadores de fotos genéricas compartilhadas de fornecedores do AliExpress (como o banner de 3 colares juntos)
const GENERIC_SUPPLIER_PATTERNS = [
  "S86269fcc87bd4a7da443c69a4d1d6e97y", // foto com 3 colares juntos
];

function isGenericSupplierPhoto(url?: string): boolean {
  if (!url) return true;
  return GENERIC_SUPPLIER_PATTERNS.some((pattern) => url.includes(pattern));
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const { node } = product;
  const image = node.images.edges[0]?.node;
  
  // Encontra uma segunda foto válida que não seja a foto genérica repetida e nem igual à primeira
  const validSecondaryNode = node.images.edges
    .slice(1)
    .map((e) => e.node)
    .find((img) => img.url && !isGenericSupplierPhoto(img.url) && img.url !== image?.url);

  const available = node.variants.edges.some((v) => v.node.availableForSale);
  const amount = parseFloat(node.priceRange.minVariantPrice.amount);
  const installment = (amount / 3).toFixed(2);

  return (
    <article className={`product-card ${available ? "" : "sold-out"}`}>
      <Link to="/produto/$productId" params={{ productId: node.handle }}>
        <div className={`product-image ${validSecondaryNode ? "has-secondary" : ""}`}>
          <span className="product-badge">À prova d'água</span>
          {image && <img src={image.url} alt={image.altText ?? node.title} loading="lazy" width={1024} height={1280} />}
          {validSecondaryNode && (
            <img
              className="secondary"
              src={validSecondaryNode.url}
              alt={validSecondaryNode.altText ?? node.title}
              loading="lazy"
              width={1024}
              height={1280}
            />
          )}
        </div>
        <div className="product-meta">
          <div>
            <h3>{node.title}</h3>
            <div>
              <p>{formatPrice(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}</p>
              <span className="installments">ou 3x de {formatPrice(installment, node.priceRange.minVariantPrice.currencyCode)}</span>
            </div>
          </div>
          <span>{available ? "Disponível" : "Esgotado"}</span>
          <div className="stock-line"><i style={{ width: available ? "100%" : "0%" }} /></div>
        </div>
      </Link>
    </article>
  );
}

