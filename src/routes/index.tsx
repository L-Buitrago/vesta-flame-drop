import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import heroImage from "@/assets/vesta-hero.jpg";
import collectionImage from "@/assets/vesta-collection.jpg";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "VESTA Fine Jewelry — Joias em edições limitadas" },
    { name: "description", content: "Joias brasileiras em ouro 18k, criadas em edições limitadas e numeradas." },
    { property: "og:title", content: "VESTA Fine Jewelry — Drop 01 Chama Viva" },
    { property: "og:description", content: "Conheça Chama Viva, a primeira coleção limitada e numerada da VESTA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const [time, setTime] = useState({ days: 6, hours: 12, minutes: 44, seconds: 18 });
  useEffect(() => { const timer = window.setInterval(() => setTime((old) => ({ ...old, seconds: old.seconds > 0 ? old.seconds - 1 : 59, minutes: old.seconds > 0 ? old.minutes : Math.max(0, old.minutes - 1) })), 1000); return () => window.clearInterval(timer); }, []);
  return <main><section className="hero"><img src={heroImage} alt="Anel Chama da coleção Vesta" width={1536} height={1280} /><div className="hero-shade" /><div className="hero-copy"><p className="eyebrow">DROP 01</p><h1>Chama Viva</h1><p>Edição limitada · 30 peças por modelo</p><div className="countdown" aria-label="Contagem regressiva">{Object.entries(time).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{{days:"dias",hours:"horas",minutes:"minutos",seconds:"segundos"}[label]}</span></div>)}</div><div className="hero-actions"><a href="#acesso" className="vesta-button">Entrar na lista de acesso</a><a href="#drop-01" className="line-link light">Ver a coleção</a></div></div></section><section id="drop-01" className="collection"><div className="section-heading"><h2>DROP 01</h2><p>Chama Viva · 2026<br/>30 peças por modelo</p></div><div className="product-grid">{products.slice(0,4).map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="center-link"><Link to="/" hash="categorias" className="line-link">Descobrir todas as peças</Link></div></section><section id="historia" className="story"><div className="story-image"><img src={collectionImage} alt="Coleção Chama Viva em ouro 18k" loading="lazy" width={1280} height={1600} /></div><div className="story-copy"><p className="eyebrow">A NOSSA ORIGEM</p><h2>Onde a chama<br/><em>nunca se apaga.</em></h2><p>Vesta guardava o fogo sagrado de Roma. Inspiradas por sua presença silenciosa, criamos joias para guardar histórias — e atravessar gerações.</p><a href="#rodape" className="line-link">Conheça a Vesta</a></div></section><section id="categorias" className="categories"><div className="section-heading"><h2>Por categoria</h2><p>O essencial, esculpido em ouro</p></div><div className="category-grid">{products.slice(0,4).map((product) => <Link key={product.category} to="/produto/$productId" params={{ productId: product.id }}><div><img src={product.image} alt={product.category} loading="lazy" /></div><span>{product.category}</span></Link>)}</div></section><section className="statement"><p>“Cada peça carrega um número.<br/>Cada número, uma história que será somente sua.”</p><span>Feitas à mão em ouro 18k · São Paulo, Brasil</span></section><section id="acesso" className="early-access"><p className="eyebrow">ACESSO ANTECIPADO</p><h2>Seja a primeira a saber<br/>do próximo drop.</h2><form onSubmit={(e) => e.preventDefault()}><label className="sr-only" htmlFor="email">Seu e-mail</label><input id="email" type="email" required placeholder="SEU MELHOR E-MAIL"/><Button className="vesta-button" type="submit">Entrar</Button></form><p>Ao se inscrever, você concorda com nossa Política de Privacidade.</p></section></main>;
}
