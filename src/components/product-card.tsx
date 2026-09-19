import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return <article className={`product-card ${product.stock === 0 ? "sold-out" : ""}`}><Link to="/produto/$productId" params={{ productId: product.id }}><div className="product-image"><img src={product.image} alt={product.name} loading="lazy" width={1024} height={1280} /></div><div className="product-meta"><div><h3>{product.name}</h3><p>{formatPrice(product.price)}</p></div><span>{product.stock ? `Restam ${product.stock} de 30` : "Esgotado"}</span><div className="stock-line"><i style={{ width: `${(product.stock / 30) * 100}%` }} /></div></div></Link></article>;
}