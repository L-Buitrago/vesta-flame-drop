import { Link } from "@tanstack/react-router";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const secondImage = node.images.edges[1]?.node;
  const available = node.variants.edges.some((v) => v.node.availableForSale);
  const amount = parseFloat(node.priceRange.minVariantPrice.amount);
  const installment = (amount / 3).toFixed(2);

  return (
    <article className={`product-card ${available ? "" : "sold-out"}`}>
      <Link to="/produto/$productId" params={{ productId: node.handle }}>
        <div className="product-image">
          <span className="product-badge">À prova d'água</span>
          {image && <img src={image.url} alt={image.altText ?? node.title} loading="lazy" width={1024} height={1280} />}
          {secondImage && <img className="secondary" src={secondImage.url} alt={secondImage.altText ?? node.title} loading="lazy" width={1024} height={1280} />}
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
