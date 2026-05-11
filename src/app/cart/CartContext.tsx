import React, { createContext, useContext, useEffect, useState } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  img?: string;
  weight?: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem('orvella-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem('orvella-cart', JSON.stringify(items));
  }, [items]);

  const add = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + qty } : p);
      }
      return [...prev, { ...item, qty }];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, qty } : p));
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const value: CartContextType = { items, add, remove, updateQty, clear, count, total };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
