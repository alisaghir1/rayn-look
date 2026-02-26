'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  color: string;
  duration: string;
  quantity: number;
  sku: string;
  stockQuantity: number;
  productType?: string;
  degree?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        // Match by id AND degree so the same lens with different degrees are separate cart items
        const existingItem = items.find(
          (i) => i.id === item.id && (i.degree || '') === (item.degree || '')
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity;
          if (newQuantity > item.stockQuantity) return;
          set({
            items: items.map((i) =>
              i.id === item.id && (i.degree || '') === (item.degree || '')
                ? { ...i, quantity: newQuantity }
                : i
            ),
          });
        } else {
          if (item.quantity > item.stockQuantity) return;
          set({ items: [...items, item] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        const item = get().items.find((i) => i.id === id);
        if (item && quantity > item.stockQuantity) return;
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'rayn-look-cart',
    }
  )
);
