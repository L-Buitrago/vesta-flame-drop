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

type CustomerReview = { name: string; rating: number; text: string; product: string; handle: string };

const customerPhotos: { src: string; alt: string; review?: CustomerReview }[] = [
  { src: "/clientes/cliente-1.jpg", alt: "Cliente segurando um anel Vesta dourado com zircônias na palma da mão" },
  { src: "/clientes/cliente-2.jpg", alt: "Cliente usando colar com pingente de borboleta e brinco de argola Vesta" },
  { src: "/clientes/cliente-3.jpg", alt: "Cliente usando brinco e colar dourados Vesta" },
  {
    src: "/clientes/cliente-4.jpg",
    alt: "Colar Vesta com pingente de serpente sobre a mesa",
    review: {
      name: "Edna P.",
      rating: 5,
      text: "Amei meus produtos, comprei e vou comprar mais!!",
      product: "Colar Serpente Pingente",
      handle: "square-pendants-delicate-stainless-steel-chain-pendant-necklace-for-women-necklace-21",
    },
  },
  { src: "/clientes/cliente-5.jpg", alt: "Dois anéis dourados Vesta sobre a penteadeira" },
  { src: "/clientes/cliente-6.jpg", alt: "Cliente usando colar dourado Vesta com medalha" },
];

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
      { name: "description", content: "Joias brasileiras em ouro 18k e prata nobre resistentes à água." },
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
  const [activeHero, setActiveHero] = useState(0);
  const { categoria = "todos" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  useScrollReveal();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
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

  // Fotos de clientes no meio da vitrine (múltiplo de 4 para não quebrar a linha da grade)
  const showCustomersInGrid = filteredProducts.length >= 16;
  const customersBreak = showCustomersInGrid
    ? Math.round(filteredProducts.length / 2 / 4) * 4
    : filteredProducts.length;

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
          <div className="hero-actions">
            <a href="#drop-01" className="line-link light">
              Ver Coleção
            </a>
            <a href="#acesso" className="line-link light">
              Avise-me das novidades
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
              <p>Banho nobre em Ouro 18k e Prata, livre de níquel</p>
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
              Receba um aviso quando chegarem novas joias →
            </a>
          </div>
        ) : (
          <>
            <div
              key={categoria ?? "todos"}
              className={`product-grid count-${Math.min(filteredProducts.length, 4)}`}
            >
              {filteredProducts.slice(0, customersBreak).map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
            {showCustomersInGrid && (
              <>
                <CustomersSection />
                <div className={`product-grid count-${Math.min(filteredProducts.length - customersBreak, 4)}`}>
                  {filteredProducts.slice(customersBreak).map((product) => (
                    <ProductCard key={product.node.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {!showCustomersInGrid && <CustomersSection />}

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
        <span>Joias à prova d'água em Ouro 18k e Prata · São Paulo, Brasil</span>
      </section>

      <section id="acesso" className="early-access reveal">
        <p className="eyebrow">NOVIDADES VESTA</p>
        <h2>
          Seja avisada quando
          <br />
          chegarem novas joias.
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

function CustomersSection() {
  return (
    <section id="clientes" className="customers" aria-labelledby="clientes-titulo">
      <div className="section-heading">
        <div>
          <p className="eyebrow">QUEM JÁ USA VESTA</p>
          <h2 id="clientes-titulo">Nossas clientes</h2>
        </div>
        <p>
          Fotos enviadas por quem comprou
          <br />
          No dia a dia, do jeito delas
        </p>
      </div>
      <div className="customers-marquee">
        <div className="customers-track">
          {[...customerPhotos, ...customerPhotos].map((photo, index) => {
            const isCopy = index >= customerPhotos.length;
            return (
              <figure key={`${photo.src}-${index}`} className="customer-photo" aria-hidden={isCopy || undefined}>
                <img src={photo.src} alt={isCopy ? "" : photo.alt} loading="lazy" decoding="async" width={825} height={1024} />
                {photo.review && (
                  <figcaption className="customer-review">
                    <span className="customer-review-stars" aria-label={`${photo.review.rating} de 5 estrelas`}>
                      {"★".repeat(photo.review.rating)}
                    </span>
                    <blockquote>“{photo.review.text}”</blockquote>
                    <p>
                      <strong>{photo.review.name}</strong>
                      <Link
                        to="/produto/$productId"
                        params={{ productId: photo.review.handle }}
                        tabIndex={isCopy ? -1 : undefined}
                      >
                        {photo.review.product}
                      </Link>
                    </p>
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
