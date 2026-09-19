import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, UserRound, X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice, products } from "@/lib/products";
import logoAsset from "@/assets/vesta-logo.png.asset.json";

const nav = ["DROP 01", "Anéis", "Brincos", "Colares", "Pulseiras", "A Vesta"];

export function VestaShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { items, isOpen, setOpen, changeQuantity, removeItem } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const filtered = query.trim() ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <>
      <div className="announcement">Frete grátis acima de R$ 500 · Embalagem presente em todos os pedidos</div>
      <header className="site-header">
        <nav className="desktop-nav" aria-label="Navegação principal">
          {nav.map((item) => <Link key={item} to="/" hash={item === "A Vesta" ? "historia" : item === "DROP 01" ? "drop-01" : "categorias"} className="nav-link">{item}</Link>)}
        </nav>
        <Button variant="ghost" size="icon" className="mobile-menu-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu /></Button>
        <Link to="/" className="brand" aria-label="Vesta Fine Jewelry"><img src={logoAsset.url} alt="Vesta Fine Jewelry" /></Link>
        <div className="header-actions">
          <Button variant="ghost" size="icon" aria-label="Buscar" onClick={() => setSearchOpen(true)}><Search /></Button>
          <Button variant="ghost" size="icon" aria-label="Minha conta" className="account-action"><UserRound /></Button>
          <Button variant="ghost" size="icon" aria-label={`Sacola com ${count} itens`} className="bag-button" onClick={() => setOpen(true)}><ShoppingBag />{count > 0 && <span>{count}</span>}</Button>
        </div>
      </header>

      {menuOpen && <div className="mobile-menu"><Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X /></Button><img src={logoAsset.url} alt="Vesta Fine Jewelry" />{nav.map((item) => <Link key={item} to="/" hash={item === "A Vesta" ? "historia" : item === "DROP 01" ? "drop-01" : "categorias"} onClick={() => setMenuOpen(false)}>{item}</Link>)}</div>}

      {searchOpen && <div className="search-overlay"><div className="search-inner"><Button variant="ghost" size="icon" aria-label="Fechar busca" onClick={() => setSearchOpen(false)}><X /></Button><label htmlFor="site-search">O que você procura?</label><input id="site-search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ANEL, COLAR, BRINCO..." />{filtered.map((product) => <Link key={product.id} to="/produto/$productId" params={{ productId: product.id }} onClick={() => setSearchOpen(false)} className="search-result"><span>{product.name}</span><span>{formatPrice(product.price)}</span></Link>)}</div></div>}

      {isOpen && <div className="cart-layer"><button className="cart-backdrop" aria-label="Fechar sacola" onClick={() => setOpen(false)} /><aside className="cart-drawer" aria-label="Sacola"><div className="cart-heading"><h2>Sua sacola</h2><Button variant="ghost" size="icon" aria-label="Fechar sacola" onClick={() => setOpen(false)}><X /></Button></div><div className="shipping-progress"><p>{subtotal >= 500 ? "Você ganhou frete grátis" : `Faltam ${formatPrice(500 - subtotal)} para o frete grátis`}</p><div><span style={{ width: `${Math.min(100, subtotal / 5)}%` }} /></div></div><div className="cart-items">{items.length === 0 ? <p className="empty-cart">Sua sacola está vazia.</p> : items.map((item) => <article className="cart-item" key={`${item.product.id}-${item.size}`}><img src={item.product.image} alt={item.product.name} /><div><h3>{item.product.name}</h3>{item.size && <p>Tamanho {item.size}</p>}<p>{formatPrice(item.product.price)}</p><div className="quantity"><Button variant="ghost" size="icon" aria-label="Diminuir quantidade" onClick={() => changeQuantity(item.product.id, -1)}><Minus /></Button><span>{item.quantity}</span><Button variant="ghost" size="icon" aria-label="Aumentar quantidade" onClick={() => changeQuantity(item.product.id, 1)}><Plus /></Button></div><button className="text-action" onClick={() => removeItem(item.product.id)}>Remover</button></div></article>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Frete calculado na próxima etapa.</p><Button className="vesta-button w-full" disabled={!items.length}>Finalizar compra</Button></div></aside></div>}
    </>
  );
}