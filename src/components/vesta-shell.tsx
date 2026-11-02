import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, UserRound, X, Minus, Plus, Loader2, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { fetchShopifyProducts, formatPrice, getShopifyCartPermalink, getProductCategory, isContainFitProduct, type ShopifyProduct } from "@/lib/shopify";

const navItems = [
  { num: "01", label: "Todas as Joias", subtitle: "Acervo Completo Drop 01", cat: "todos", hash: "drop-01" },
  { num: "02", label: "Colares", subtitle: "Gargantilhas & Fios de Ouro", cat: "colares", hash: "drop-01" },
  { num: "03", label: "Pulseiras", subtitle: "Braceletes & Elos 18k", cat: "pulseiras", hash: "drop-01" },
  { num: "04", label: "Brincos", subtitle: "Argolas & Pendentes", cat: "brincos", hash: "drop-01" },
  { num: "05", label: "Anéis", subtitle: "Solitários & Aros Ajustáveis", cat: "aneis", hash: "drop-01" },
  { num: "06", label: "A Vesta", subtitle: "Nossa Origem & Fogo Sagrado", cat: null, hash: "historia" },
];

const QUICK_SEARCH_PILLS = [
  "Colar",
  "Riviera",
  "Pérolas",
  "Anel Ajustável",
  "Pulseira",
  "Ônix",
  "Coração",
];

const STOP_WORDS = new Set(["de", "do", "da", "dos", "das", "e", "em", "com", "para", "a", "o", "as", "os", "um", "uma", "no", "na"]);

const CATEGORY_SYNONYMS: Record<string, string> = {
  colar: "colares",
  colares: "colares",
  gargantilha: "colares",
  choker: "colares",
  pulseira: "pulseiras",
  pulseiras: "pulseiras",
  bracelete: "pulseiras",
  braceletes: "pulseiras",
  anel: "aneis",
  aneis: "aneis",
  brinco: "brincos",
  brincos: "brincos",
  argola: "brincos",
  argolas: "brincos",
};

const normalizeSearch = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .trim();

const stemWord = (word: string): string => {
  const w = normalizeSearch(word);
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("is") && w.length > 4) return w.slice(0, -2) + "l";
  if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
  return w;
};

const productMatchesQuery = (product: ShopifyProduct, q: string): boolean => {
  const cleanQ = normalizeSearch(q);
  if (!cleanQ) return false;

  const queryTokens = cleanQ
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));

  if (queryTokens.length === 0) return false;

  const titleNorm = normalizeSearch(product.node.title || "");
  const category = getProductCategory(product);
  const tagsNorm = (product.node.tags || []).map(normalizeSearch);
  const descNorm = normalizeSearch(product.node.description || "");

  const titleWords = titleNorm.split(/[^a-z0-9]+/).filter(Boolean);
  const tagWords = tagsNorm.flatMap((t) => t.split(/[^a-z0-9]+/).filter(Boolean));
  const descWords = descNorm.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const allWords = [...titleWords, ...tagWords, category, ...descWords];
  const allStems = allWords.map(stemWord);

  return queryTokens.every((token) => {
    const qStem = stemWord(token);
    const targetCat = CATEGORY_SYNONYMS[token] || CATEGORY_SYNONYMS[qStem];

    // 1. Direct category match
    if (targetCat && category === targetCat) {
      return true;
    }

    // 2. Exact word or prefix match in title, tags, category, description
    const hasWordMatch = allWords.some((w) => w === token || (token.length >= 3 && w.startsWith(token)));
    if (hasWordMatch) return true;

    const hasStemMatch = allStems.some((s) => s === qStem || (qStem.length >= 4 && s.startsWith(qStem)));
    if (hasStemMatch) return true;

    // 3. Substring match in title
    if (token.length >= 3 && titleNorm.includes(token)) {
      return true;
    }

    return false;
  });
};

export function VestaShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const { items, isOpen, setOpen, updateQuantity, removeItem, isLoading, isSyncing, getCheckoutUrl, syncCart } = useCartStore();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Cached product catalog from TanStack Query
  const { data: catalog } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchShopifyProducts(),
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: catalog?.length ?? 0,
      colares: 0,
      pulseiras: 0,
      brincos: 0,
      aneis: 0,
    };
    (catalog ?? []).forEach((p) => {
      const cat = getProductCategory(p);
      if (cat in counts) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [catalog]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return (catalog ?? []).filter((p) => productMatchesQuery(p, query));
  }, [catalog, query]);

  const displayProducts = useMemo(() => {
    if (query.trim()) return searchResults;
    return (catalog ?? []).slice(0, 4);
  }, [query, searchResults, catalog]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    setIsRedirecting(true);
    let checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl || items.some((i) => !i.lineId || i.lineId.startsWith("local-"))) {
      checkoutUrl = getShopifyCartPermalink(items);
    }
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setIsRedirecting(false);
    }
  };

  return (
    <>
      <header className={`site-header ${isHome ? "is-hero-overlay" : "is-solid"} ${isScrolled ? "scrolled" : ""}`}>
        <Button variant="ghost" size="icon" className="menu-trigger" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
          <Menu />
        </Button>
        <Link to="/" className="brand" aria-label="Vesta Fine Jewelry">
          <span>VESTA</span>
          <small>FINE JEWELRY</small>
        </Link>
        <div className="header-actions">
          <Button variant="ghost" size="icon" aria-label="Buscar" onClick={() => setSearchOpen(true)}>
            <Search />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Minha conta" className="account-action">
            <UserRound />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Sacola com ${count} itens`} className="bag-button" onClick={() => setOpen(true)}>
            <ShoppingBag />
            {count > 0 && <span>{count}</span>}
          </Button>
        </div>
      </header>

      <div
        className={`crystal-menu ${menuOpen ? 'is-active' : ''}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
      >
        <div className="crystal-backdrop" onClick={closeMenu} />
        <div className="crystal-panel">
          <div className="crystal-header">
            <div className="crystal-edition-badge">
              <span className="crystal-pulse-dot" />
              <span>DROP 01 · CHAMA VIVA</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="crystal-close"
              aria-label="Fechar menu"
              onClick={closeMenu}
            >
              <X size={20} />
            </Button>
          </div>

          <div className="crystal-brand">
            <Link to="/" onClick={closeMenu} className="crystal-brand-link">
              <span>VESTA</span>
              <small>FINE JEWELRY</small>
            </Link>
          </div>

          <nav className="crystal-nav">
            {navItems.map((item, i) => {
              const catCount = item.cat ? categoryCounts[item.cat] ?? 0 : null;
              return (
                <Link
                  key={item.label}
                  to="/"
                  search={item.cat ? { categoria: item.cat } : { categoria: undefined }}
                  hash={item.hash}
                  className="crystal-link"
                  style={{ transitionDelay: `${0.06 + i * 0.035}s` }}
                  onClick={closeMenu}
                >
                  <div className="crystal-link-left">
                    <span className="crystal-link-num">{item.num}</span>
                    <div className="crystal-link-info">
                      <span className="crystal-link-title">{item.label}</span>
                      <span className="crystal-link-sub">{item.subtitle}</span>
                    </div>
                  </div>
                  <div className="crystal-link-right">
                    {catCount !== null ? (
                      catCount === 0 ? (
                        <span className="crystal-badge-soon">Em breve</span>
                      ) : (
                        <span className="crystal-badge-count">({catCount})</span>
                      )
                    ) : (
                      <span className="crystal-link-arrow">→</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="crystal-footer">
            <div className="crystal-diferenciais">
              <div className="crystal-diff-item">
                <span className="diff-symbol">✦</span>
                <span>100% à prova d'água e suor</span>
              </div>
              <div className="crystal-diff-item">
                <span className="diff-symbol">✦</span>
                <span>Aço Cirúrgico 316L · Garantia Vitalícia</span>
              </div>
              <div className="crystal-diff-item">
                <span className="diff-symbol">✦</span>
                <span>Edição Limitada · Envio Imediato</span>
              </div>
            </div>
            <a href="#acesso" className="crystal-vip-button" onClick={closeMenu}>
              <span>Lista VIP · Próximo Drop</span>
              <span className="vip-arrow">→</span>
            </a>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="search-overlay">
          <div className="search-backdrop" onClick={() => setSearchOpen(false)} />
          <div className="search-modal" role="dialog" aria-modal="true" aria-label="Busca de joias">
            <div className="search-modal-header">
              <div className="search-input-wrapper">
                <Search className="search-input-icon" size={20} />
                <input
                  ref={searchInputRef}
                  id="site-search"
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar colares, anéis, pulseiras, pérolas..."
                  className="search-input"
                />
                {query && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="search-modal-close"
                aria-label="Fechar busca"
                onClick={() => setSearchOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="search-pills-bar">
              <span className="search-pills-label">Sugestões:</span>
              <div className="search-pills-list">
                {QUICK_SEARCH_PILLS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    className={`search-pill ${normalizeSearch(query) === normalizeSearch(pill) ? "active" : ""}`}
                    onClick={() => {
                      const next = normalizeSearch(query) === normalizeSearch(pill) ? "" : pill;
                      setQuery(next);
                      searchInputRef.current?.focus();
                    }}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-results-container">
              <div className="search-results-heading">
                <span>
                  {query.trim()
                    ? `${searchResults.length} ${searchResults.length === 1 ? "joia encontrada" : "joias encontradas"}`
                    : "Peças em Destaque · Drop 01"}
                </span>
                {query.trim() && searchResults.length > 0 && (
                  <small>Preços em até 3x sem juros</small>
                )}
              </div>

              {displayProducts.length === 0 ? (
                <div className="search-empty-state">
                  <p>Nenhuma joia encontrada para <strong>“{query}”</strong>.</p>
                  <span>Experimente buscar por termos como <em>Colar</em>, <em>Pulseira</em>, <em>Pérolas</em> ou <em>Anel</em>.</span>
                </div>
              ) : (
                <div className="search-cards-grid">
                  {displayProducts.map((product) => {
                    const priceAmount = parseFloat(product.node.priceRange.minVariantPrice.amount);
                    const currencyCode = product.node.priceRange.minVariantPrice.currencyCode;
                    const installmentAmount = (priceAmount / 3).toFixed(2);
                    const imageUrl = product.node.images.edges[0]?.node?.url;

                    return (
                      <Link
                        key={product.node.id}
                        to="/produto/$productId"
                        params={{ productId: product.node.handle }}
                        onClick={() => setSearchOpen(false)}
                        className="search-product-card"
                      >
                        <div className={`search-card-thumb ${isContainFitProduct(product.node.handle, product.node.title) ? "search-card-thumb--contain" : ""}`}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.node.title} loading="lazy" />
                          ) : (
                            <div className="search-card-thumb-placeholder" />
                          )}
                          <span className="search-card-badge">À prova d'água</span>
                        </div>
                        <div className="search-card-details">
                          <h4 className="search-card-title">{product.node.title}</h4>
                          <div className="search-card-prices">
                            <span className="search-card-price-main">
                              {formatPrice(product.node.priceRange.minVariantPrice.amount, currencyCode)}
                            </span>
                            <span className="search-card-installment">
                              ou 3x de {formatPrice(installmentAmount, currencyCode)} sem juros
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="cart-layer">
          <button className="cart-backdrop" aria-label="Fechar sacola" onClick={() => setOpen(false)} />
          <aside className="cart-drawer" aria-label="Sacola">
            <div className="cart-heading">
              <h2>Sua sacola</h2>
              <Button variant="ghost" size="icon" aria-label="Fechar sacola" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <div className="shipping-progress">
              <p>{subtotal >= 300 ? "Você ganhou frete grátis!" : `Faltam ${formatPrice(300 - subtotal, currency)} para o frete grátis`}</p>
              <div>
                <span style={{ width: `${Math.min(100, subtotal / 3)}%` }} />
              </div>
            </div>
            <div className="cart-items">
              {items.length === 0 ? (
                <p className="empty-cart">Sua sacola está vazia.</p>
              ) : (
                items.map((item) => (
                  <article className="cart-item" key={item.variantId}>
                    {item.product.node.images.edges[0]?.node && (
                      <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} />
                    )}
                    <div>
                      <h3>{item.product.node.title}</h3>
                      {item.variantTitle !== "Default Title" && <p>{item.selectedOptions.map((o) => o.value).join(" · ")}</p>}
                      <p>{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                      <div className="quantity">
                        <Button variant="ghost" size="icon" aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                          <Minus />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button variant="ghost" size="icon" aria-label="Aumentar quantidade" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                          <Plus />
                        </Button>
                      </div>
                      <button className="text-action" onClick={() => removeItem(item.variantId)}>
                        Remover
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, currency)}</strong>
              </div>
              <p>Frete e cupons calculados no checkout oficial.</p>
              <Button
                className="vesta-button w-full"
                disabled={!items.length || isLoading || isSyncing || isRedirecting}
                onClick={handleCheckout}
              >
                {isLoading || isSyncing || isRedirecting ? <Loader2 className="animate-spin" /> : "Finalizar compra"}
              </Button>
              <div className="cart-trust-badges">
                <div className="trust-item">
                  <ShieldCheck size={14} />
                  <span>Pagamento 100% seguro via <strong>Mercado Pago</strong></span>
                </div>
                <div className="trust-item">
                  <CreditCard size={14} />
                  <span>Pix imediato com desconto ou até 12x no cartão</span>
                </div>
                <div className="trust-item">
                  <Sparkles size={14} />
                  <span>Garantia de qualidade e joias à prova d'água</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
