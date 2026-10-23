import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  addLineToShopifyCart,
  CART_QUERY,
  createShopifyCart,
  createShopifyCartFromLines,
  getShopifyCartPermalink,
  removeLineFromShopifyCart,
  storefrontApiRequest,
  updateShopifyCartLine,
  type ShopifyProduct,
} from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,

      setOpen: (open) => set({ isOpen: open }),

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ variantId: item.variantId, quantity: item.quantity });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
                isOpen: true,
              });
            } else {
              const fallbackItems = [{ ...item, lineId: `local-${item.variantId}` }];
              set({
                cartId: null,
                checkoutUrl: getShopifyCartPermalink(fallbackItems),
                items: fallbackItems,
                isOpen: true,
              });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({
                items: currentItems.map((i) => (i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i)),
                isOpen: true,
              });
            } else {
              // Re-create cart with fresh lines
              const updatedItems = get().items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i));
              const fresh = await createShopifyCartFromLines(updatedItems);
              if (fresh) {
                set({
                  cartId: fresh.cartId,
                  checkoutUrl: fresh.checkoutUrl,
                  items: updatedItems.map((i) => ({ ...i, lineId: fresh.lineMap[i.variantId] ?? i.lineId })),
                  isOpen: true,
                });
              } else {
                set({
                  items: updatedItems,
                  checkoutUrl: getShopifyCartPermalink(updatedItems),
                  isOpen: true,
                });
              }
            }
          } else {
            const result = await addLineToShopifyCart(cartId, { variantId: item.variantId, quantity: item.quantity });
            if (result?.success) {
              const currentItems = get().items;
              set({ items: [...currentItems, { ...item, lineId: result.lineId ?? null }], isOpen: true });
            } else {
              // Re-create cart with all lines
              const allItems = [...get().items, item];
              const fresh = await createShopifyCartFromLines(allItems);
              if (fresh) {
                set({
                  cartId: fresh.cartId,
                  checkoutUrl: fresh.checkoutUrl,
                  items: allItems.map((i) => ({ ...i, lineId: fresh.lineMap[i.variantId] ?? i.lineId })),
                  isOpen: true,
                });
              } else {
                set({
                  items: [...get().items, { ...item, lineId: `local-${item.variantId}` }],
                  checkoutUrl: getShopifyCartPermalink(allItems),
                  isOpen: true,
                });
              }
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
          const allItems = [...get().items, item];
          set({
            items: allItems.map((i) => ({ ...i, lineId: i.lineId ?? `local-${i.variantId}` })),
            checkoutUrl: getShopifyCartPermalink(allItems),
            isOpen: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item) return;

        if (!cartId || item.lineId?.startsWith("local-")) {
          const currentItems = get().items;
          set({ items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
          return;
        }

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({ items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item) return;

        if (!cartId || item.lineId?.startsWith("local-")) {
          const currentItems = get().items;
          const newItems = currentItems.filter((i) => i.variantId !== variantId);
          newItems.length === 0 ? clearCart() : set({ items: newItems });
          return;
        }

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((i) => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    },
  ),
);
