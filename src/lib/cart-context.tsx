import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; size?: number; quantity: number };
type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, size?: number) => void;
  changeQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    setOpen,
    addItem: (product, size) => {
      setItems((current) => {
        const found = current.find((item) => item.product.id === product.id && item.size === size);
        if (found) return current.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item);
        return [...current, { product, size, quantity: 1 }];
      });
      setOpen(true);
    },
    changeQuantity: (id, delta) => setItems((current) => current
      .map((item) => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0)),
    removeItem: (id) => setItems((current) => current.filter((item) => item.product.id !== id)),
  }), [items, isOpen]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}