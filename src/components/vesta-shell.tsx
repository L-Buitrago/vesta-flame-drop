import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, UserRound, X, Minus, Plus, Loader2, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { fetchShopifyProducts, formatPrice, getShopifyCartPermalink } from "@/lib/shopify";

const navItems = [
  { label: "Todos", cat: "todos", hash: "drop-01" },
  { label: "Colares", cat: "colares", hash: "drop-01" },
  { label: "Pulseiras", cat: "pulseiras", hash: "drop-01" },
  { label: "Brincos", cat: "brincos", hash: "drop-01" },
  { label: "Anéis", cat: "aneis", hash: "drop-01" },
  { label: "A Vesta", cat: null, hash: "historia" },
];

export function VestaShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { items, isOpen, setOpen, updateQuantity, removeItem, isLoading, isSyncing, getCheckoutUrl, syncCart } = useCartStore();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: catalog } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchShopifyProducts(50),
    enabled: searchOpen,
  });
  const filtered = query.trim()
    ? (catalog ?? []).filter((p) => p.node.title.toLowerCase().includes(query.toLowerCase()))
    : [];

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
      <div className="announcement">
        À prova d'água & suor · Frete grátis para todo o Brasil acima de R$ 300 · Pagamento via Mercado Pago
      </div>
      <header className="site-header">
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to="/"
              search={item.cat ? { categoria: item.cat } : { categoria: undefined }}
              hash={item.hash}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="icon" className="mobile-menu-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
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

      {menuOpen && (
        <div className="mobile-menu">
          <Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
            <X />
          </Button>
          <div className="mobile-brand">
            <span>VESTA</span>
            <small>FINE JEWELRY</small>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to="/"
              search={item.cat ? { categoria: item.cat } : { categoria: undefined }}
              hash={item.hash}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay">
          <div className="search-inner">
            <Button variant="ghost" size="icon" aria-label="Fechar busca" onClick={() => setSearchOpen(false)}>
              <X />
            </Button>
            <label htmlFor="site-search">O que você procura?</label>
            <input id="site-search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="COLAR, ANEL, BRINCO, PULSEIRA..." />
            {filtered.map((product) => (
              <Link
                key={product.node.id}
                to="/produto/$productId"
                params={{ productId: product.node.handle }}
                onClick={() => setSearchOpen(false)}
                className="search-result"
              >
                <span>{product.node.title}</span>
                <span>{formatPrice(product.node.priceRange.minVariantPrice.amount, product.node.priceRange.minVariantPrice.currencyCode)}</span>
              </Link>
            ))}
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
