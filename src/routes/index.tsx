import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { fetchShopifyProducts, getProductCategory } from "@/lib/shopify";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import heroPearls from "@/assets/vesta-hero-pearls.png.asset.json";
import heroCoconut from "@/assets/vesta-hero-coconut.jpg";
import collectionImage from "@/assets/vesta-collection.jpg";

const productsQuery = queryOptions({
  queryKey: ["shopify-products"],
  queryFn: () => fetchShopifyProducts(),
});

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { categoria?: string | undefined } => ({
    categoria: typeof search["categoria"] === "string" ? (search["categoria"] as string) : undefined,
  }),
  loader: ({ context }) => {
    // Prefetch em background sem travar o carregamento inicial da página nem exibir o rodapé antes da hora
    context.queryClient.prefetchQuery(productsQuery);
  },
  head: () => ({
    meta: [
      { title: "VESTA Joias — Joias em edições limitadas" },
      { name: "description", content: "Joias brasileiras em ouro 18k e aço 316L resistentes à água." },
      { property: "og:title", content: "VESTA Joias — Drop 01 Chama Viva" },
      { property: "og:description", content: "Conheça Chama Viva, a primeira coleção limitada da VESTA." },
      { property: "og:image", content: heroPearls.url },
      { name: "twitter:image", content: heroPearls.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [time, setTime] = useState({ days: 6, hours: 12, minutes: 44, seconds: 18 });
  const [activeHero, setActiveHero] = useState(0);
  const { categoria = "todos" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  useScrollReveal();

  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setTime((old) => ({
          ...old,
          seconds: old.seconds > 0 ? old.seconds - 1 : 59,
          minutes: old.seconds > 0 ? old.minutes : Math.max(0, old.minutes - 1),
        })),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % 2), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const categories = [
    { id: "todos", label: "Todas as Joias" },
    { id: "colares", label: "Colares" },
    { id: "pulseiras", label: "Pulseiras" },
    { id: "brincos", label: "Brincos" },
    { id: "aneis", label: "Anéis" },
  ];

  const counts: Record<string, number> = {
    todos: products.length,
    colares: products.filter((p) => getProductCategory(p) === "colares").length,
    pulseiras: products.filter((p) => getProductCategory(p) === "pulseiras").length,
    brincos: products.filter((p) => getProductCategory(p) === "brincos").length,
    aneis: products.filter((p) => getProductCategory(p) === "aneis").length,
  };

  const filteredProducts = products.filter((p) => {
    if (!categoria || categoria === "todos") return true;
    return getProductCategory(p) === categoria;
  });

  return (
    <main>
      <section className="hero">
        <div className="hero-carousel">
          {[
            { src: heroPearls.url, alt: "Colares de ouro e pulseira de pérolas Vesta sobre a grade à beira-mar ao entardecer", width: 1672, height: 941 },
            { src: heroCoconut, alt: "Brincos de pérola Vesta dentro de coco à beira da piscina", width: 1024, height: 576 },
          ].map((slide, index) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              className={index === activeHero ? "active" : ""}
            />
          ))}
        </div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">DROP 01</p>
          <h1>Chama Viva</h1>
          <p>Edição limitada · Joias à prova d'água que não escurecem</p>
          <div className="countdown" aria-label="Contagem regressiva">
            {Object.entries(time).map(([label, value]) => (
              <div key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{{ days: "dias", hours: "horas", minutes: "minutos", seconds: "segundos" }[label]}</span>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <a href="#drop-01" className="line-link light">
              Ver Coleção
            </a>
            <a href="#acesso" className="line-link light">
              Lista VIP
            </a>
          </div>
        </div>
        <a href="#drop-01" className="hero-scroll-cue" aria-label="Ver produtos da coleção">
          <span>Explorar Joias</span>
          <span className="scroll-arrow">↓</span>
        </a>
      </section>

      {/* Murano-inspired Trust Strip */}
      <section className="trust-strip">
        <div className="trust-strip-inner">
          <div className="trust-badge">
            <span className="trust-icon">✦</span>
            <div>
              <strong>À Prova d'Água & Suor</strong>
              <p>Banho, mar e piscina sem perder a cor nem escurecer</p>
            </div>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">✦</span>
            <div>
              <strong>Hipoalergênico</strong>
              <p>Aço cirúrgico 316L e banho nobre livre de níquel</p>
            </div>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">✦</span>
            <div>
              <strong>Garantia Vitalícia</strong>
              <p>Joias duráveis feitas para atravessar gerações</p>
            </div>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">✦</span>
            <div>
              <strong>Mercado Pago</strong>
              <p>Pix imediato com desconto e cartão em até 12x</p>
            </div>
          </div>
        </div>
      </section>

      <section id="drop-01" className="collection">
        <div className="section-heading">
          <div>
            <h2>COLEÇÃO</h2>
            <p style={{ textAlign: "left", margin: "4px 0 0" }}>
              {categoria === "todos" ? "Chama Viva · Edições Limitadas" : categories.find((c) => c.id === categoria)?.label}
            </p>
          </div>
          <p>
            {filteredProducts.length} {filteredProducts.length === 1 ? "joia disponível" : "joias disponíveis"}
            <br />
            Envio imediato
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-filter-bar">
          {categories.map((cat) => (
            <Button
              variant="ghost"
              key={cat.id}
              className={`filter-pill ${categoria === cat.id ? "active" : ""}`}
              onClick={() => navigate({ search: { categoria: cat.id }, hash: "drop-01" })}
            >
              {cat.label} ({counts[cat.id] ?? 0})
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="product-grid count-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="product-card skeleton-card">
                <div style={{ aspectRatio: "4/5", background: "var(--secondary)", width: "100%", marginBottom: "16px" }} />
                <div style={{ height: "16px", width: "70%", background: "var(--border)", marginBottom: "8px" }} />
                <div style={{ height: "14px", width: "40%", background: "var(--border)" }} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-catalog-editorial">
            <span className="empty-catalog-symbol">✦</span>
            <h3>Próximo Lote Exclusivo</h3>
            <p>Nenhuma joia disponível para pronta entrega nesta categoria no momento.</p>
            <a href="#acesso" className="empty-catalog-vip-link">
              Próximo Lote Exclusivo — Cadastre-se na Lista VIP →
            </a>
          </div>
        ) : (
          <div
            key={categoria ?? "todos"}
            className={`product-grid count-${Math.min(filteredProducts.length, 4)}`}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section id="historia" className="story reveal">
        <div className="story-image">
          <img src={collectionImage} alt="Coleção Vesta em ouro 18k" loading="lazy" width={819} height={1024} />
        </div>
        <div className="story-copy">
          <p className="eyebrow">A NOSSA ORIGEM</p>
          <h2>
            Onde a chama
            <br />
            <em>nunca se apaga.</em>
          </h2>
          <p>Vesta guardava o fogo sagrado de Roma. Inspiradas por sua presença silenciosa, criamos joias para guardar histórias — e atravessar gerações.</p>
          <a href="#rodape" className="line-link">
            Conheça a Vesta
          </a>
        </div>
      </section>

      <section className="statement reveal">
        <p>
          “Cada peça carrega um número.
          <br />
          Cada número, uma história que será somente sua.”
        </p>
        <span>Joias à prova d'água em aço 316L e banho nobre · São Paulo, Brasil</span>
      </section>

      <section id="acesso" className="early-access reveal">
        <p className="eyebrow">ACESSO ANTECIPADO</p>
        <h2>
          Seja a primeira a saber
          <br />
          do próximo drop.
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <label className="sr-only" htmlFor="email">
            Seu e-mail
          </label>
          <input id="email" type="email" required placeholder="SEU MELHOR E-MAIL" />
          <Button className="vesta-button" type="submit">
            Entrar
          </Button>
        </form>
        <p>Ao se inscrever, você concorda com nossa Política de Privacidade.</p>
      </section>
    </main>
  );
}
