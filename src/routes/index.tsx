import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { fetchShopifyProducts } from "@/lib/shopify";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import heroLifestyle from "@/assets/vesta-hero-lifestyle.png";
import heroJewels from "@/assets/vesta-hero-jewels.png";
import collectionImage from "@/assets/vesta-collection.jpg";

const productsQuery = queryOptions({
  queryKey: ["shopify-products"],
  queryFn: () => fetchShopifyProducts(20),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
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

function Index() {
  const [time, setTime] = useState({ days: 6, hours: 12, minutes: 44, seconds: 18 });
  const [activeHero, setActiveHero] = useState(0);
  const { data: products } = useSuspenseQuery(productsQuery);
  useScrollReveal();
  useEffect(() => { const timer = window.setInterval(() => setTime((old) => ({ ...old, seconds: old.seconds > 0 ? old.seconds - 1 : 59, minutes: old.seconds > 0 ? old.minutes : Math.max(0, old.minutes - 1) })), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % 2), 10000); return () => window.clearInterval(timer); }, []);
  return <main><section className="hero"><div className="hero-carousel">{[{ src: heroLifestyle, alt: "Joias Vesta à beira-mar" }, { src: heroJewels, alt: "Seleção de joias Vesta sobre areia à beira-mar" }].map((slide, index) => <img key={slide.src} src={slide.src} alt={slide.alt} width={1365} height={768} className={index === activeHero ? "active" : ""} />)}</div><div className="hero-shade" /><div className="hero-copy"><p className="eyebrow">DROP 01</p><h1>Chama Viva</h1><p>Edição limitada · 30 peças por modelo</p><div className="countdown" aria-label="Contagem regressiva">{Object.entries(time).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{{days:"dias",hours:"horas",minutes:"minutos",seconds:"segundos"}[label]}</span></div>)}</div><div className="hero-actions"><a href="#acesso" className="vesta-button">Entrar na lista de acesso</a><a href="#drop-01" className="line-link light">Ver a coleção</a></div></div></section><section id="drop-01" className="collection reveal"><div className="section-heading"><h2>DROP 01</h2><p>Chama Viva · 2026<br/>30 peças por modelo</p></div>      {products.length === 0 ? (
        <p className="empty-catalog">Nenhum produto encontrado. As peças do próximo drop aparecerão aqui.</p>
      ) : (
        <div className={`product-grid count-${Math.min(products.length, 4)}`}>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.node.id} product={product} />
          ))}
        </div>
      )}
      <div className="center-link">
        <Link to="/" hash="categorias" className="line-link">
          Descobrir todas as peças
        </Link>
      </div>
    </section>
    <section id="historia" className="story reveal">
      <div className="story-image">
        <img src={collectionImage} alt="Coleção Chama Viva em ouro 18k" loading="lazy" width={1280} height={1600} />
      </div>
      <div className="story-copy">
        <p className="eyebrow">A NOSSA ORIGEM</p>
        <h2>Onde a chama<br/><em>nunca se apaga.</em></h2>
        <p>Vesta guardava o fogo sagrado de Roma. Inspiradas por sua presença silenciosa, criamos joias para guardar histórias — e atravessar gerações.</p>
        <a href="#rodape" className="line-link">Conheça a Vesta</a>
      </div>
    </section>
    {products.length > 0 && (
      <section id="categorias" className="categories reveal">
        <div className="section-heading">
          <h2>A coleção</h2>
          <p>O essencial, esculpido em ouro</p>
        </div>
        <div className={`category-grid count-${Math.min(products.length, 4)}`}>
          {products.slice(0, 4).map((product) => (
            <Link key={product.node.id} to="/produto/$productId" params={{ productId: product.node.handle }}>
              <div>
                {product.node.images.edges[0]?.node && (
                  <img src={product.node.images.edges[0].node.url} alt={product.node.title} loading="lazy" />
                )}
              </div>
              <span>{product.node.title}</span>
            </Link>
          ))}
        </div>
      </section>
    )}<section className="statement reveal"><p>“Cada peça carrega um número.<br/>Cada número, uma história que será somente sua.”</p><span>Feitas à mão em ouro 18k · São Paulo, Brasil</span></section><section id="acesso" className="early-access reveal"><p className="eyebrow">ACESSO ANTECIPADO</p><h2>Seja a primeira a saber<br/>do próximo drop.</h2><form onSubmit={(e) => e.preventDefault()}><label className="sr-only" htmlFor="email">Seu e-mail</label><input id="email" type="email" required placeholder="SEU MELHOR E-MAIL"/><Button className="vesta-button" type="submit">Entrar</Button></form><p>Ao se inscrever, você concorda com nossa Política de Privacidade.</p></section></main>;
}
