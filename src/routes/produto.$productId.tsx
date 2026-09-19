import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  return <main className="pdp"><div className="breadcrumbs"><Link to="/">Início</Link><span>/</span><span>{product.category}</span></div><section className="pdp-layout"><div className="pdp-gallery"><img src={product.image} alt={product.name} width={1024} height={1280} /><img src={product.image} alt={`Detalhe de ${product.name}`} width={1024} height={1280} loading="lazy" /></div><div className="pdp-info"><p className="eyebrow">DROP 01 · CHAMA VIVA</p><h1>{product.name}</h1><p className="pdp-price">{formatPrice(product.price)}</p><span className="number-badge">Peça {String(product.number).padStart(2, "0")} de 30</span><p className="pdp-description">{product.description}</p>{product.sizes && <div className="sizes"><div><span>Tamanho</span><button className="text-action">Guia de medidas</button></div><div>{product.sizes.map((item) => <Button key={item} variant="outline" className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</Button>)}</div></div>}<Button className="vesta-button add-button" disabled={!product.stock} onClick={() => addItem(product, size)}>{product.stock ? "Adicionar à sacola" : "Esgotado"}</Button><Accordion type="single" collapsible className="product-accordions"><AccordionItem value="description"><AccordionTrigger>Descrição</AccordionTrigger><AccordionContent>{product.description} Cada peça é numerada e acompanha certificado de autenticidade.</AccordionContent></AccordionItem><AccordionItem value="care"><AccordionTrigger>Materiais e cuidados</AccordionTrigger><AccordionContent>Ouro 18k. Limpe delicadamente com uma flanela seca e guarde separadamente.</AccordionContent></AccordionItem><AccordionItem value="shipping"><AccordionTrigger>Envio e trocas</AccordionTrigger><AccordionContent>Envio segurado para todo o Brasil. Trocas em até 7 dias após o recebimento.</AccordionContent></AccordionItem><AccordionItem value="gift"><AccordionTrigger>Embalagem presente</AccordionTrigger><AccordionContent>Todas as joias chegam em nossa caixa especial, sem custo adicional.</AccordionContent></AccordionItem></Accordion></div></section><section className="recommendations"><div className="section-heading"><h2>Complete o look</h2><p>Curadoria Vesta</p></div><div className="product-grid">{products.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div></section></main>;
}