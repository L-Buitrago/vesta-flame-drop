import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { formatPrice, products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/produto/$productId")({
  loader: ({ params }) => {
    const product = products.find((item) => item.id === params.productId);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Joia"} — VESTA Fine Jewelry` },
    { name: "description", content: loaderData?.description ?? "Joia de edição limitada VESTA." },
    { property: "og:title", content: `${loaderData?.name ?? "Joia"} — VESTA` },
    { property: "og:description", content: loaderData?.description ?? "Joia de edição limitada VESTA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const [size, setSize] = useState<number | undefined>(product.sizes?.[0]);
  const { addItem } = useCart();
  const details = [
    ["Descrição", `${product.description} Cada peça é numerada e acompanha certificado de autenticidade.`],
    ["Materiais e cuidados", "Ouro 18k. Limpe delicadamente com uma flanela seca e guarde separadamente."],
    ["Envio e trocas", "Envio segurado para todo o Brasil. Trocas em até 7 dias após o recebimento."],
    ["Embalagem presente", "Todas as joias chegam em nossa caixa especial, sem custo adicional."],
  ];
  return <main className="pdp"><div className="breadcrumbs"><Link to="/">Início</Link><span>/</span><span>{product.category}</span></div><section className="pdp-layout"><div className="pdp-gallery"><img src={product.image} alt={product.name} width={1024} height={1280} /><img src={product.image} alt={`Detalhe de ${product.name}`} width={1024} height={1280} loading="lazy" /></div><div className="pdp-info"><p className="eyebrow">DROP 01 · CHAMA VIVA</p><h1>{product.name}</h1><p className="pdp-price">{formatPrice(product.price)}</p><span className="number-badge">Peça {String(product.number).padStart(2, "0")} de 30</span><p className="pdp-description">{product.description}</p>{product.sizes && <div className="sizes"><div><span>Tamanho</span><button className="text-action">Guia de medidas</button></div><div>{product.sizes.map((item) => <Button key={item} variant="outline" className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</Button>)}</div></div>}<Button className="vesta-button add-button" disabled={!product.stock} onClick={() => addItem(product, size)}>{product.stock ? "Adicionar à sacola" : "Esgotado"}</Button><div className="product-accordions">{details.map(([title, content]) => <details key={title}><summary>{title}<span>+</span></summary><p>{content}</p></details>)}</div></div></section><section className="recommendations"><div className="section-heading"><h2>Complete o look</h2><p>Curadoria Vesta</p></div><div className="product-grid">{products.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div></section></main>;
}