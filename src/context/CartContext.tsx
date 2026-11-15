import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItemDetail {
  id: string; // cart_item row id
  variant_id: string;
  qty: number;
  product_id: string;
  product_name: string;
  product_slug: string;
  hero_image: string;
  variant_label: string;
  price_paise: number;
  mrp_paise: number;
  stock_qty: number;
  weight_grams: number;
}

interface CartContextType {
  items: CartItemDetail[];
  loading: boolean;
  isCartOpen: boolean;
  totalItems: number;
  subtotalPaise: number;
  freeShippingThresholdPaise: number;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (variantId: string, qty?: number, productName?: string) => Promise<boolean>;
  updateQty: (cartItemId: string, qty: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal, pendingAction, setPendingAction } = useAuth();
  const [items, setItems] = useState<CartItemDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const freeShippingThresholdPaise = 49900; // ₹499 free shipping threshold

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          variant_id,
          qty,
          product_variants (
            id,
            label,
            price_paise,
            mrp_paise,
            stock_qty,
            weight_grams,
            products (
              id,
              name,
              slug,
              hero_image
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error.message);
        return;
      }

      if (data) {
        const mapped: CartItemDetail[] = data
          .map((row: any) => {
            const v = row.product_variants;
            const p = v?.products;
            if (!v || !p) return null;
            return {
              id: row.id,
              variant_id: row.variant_id,
              qty: row.qty,
              product_id: p.id,
              product_name: p.name,
              product_slug: p.slug,
              hero_image: p.hero_image,
              variant_label: v.label,
              price_paise: v.price_paise,
              mrp_paise: v.mrp_paise,
              stock_qty: v.stock_qty,
              weight_grams: v.weight_grams,
            };
          })
          .filter(Boolean) as CartItemDetail[];

        setItems(mapped);
      }
    } catch (err) {
      console.error('Error in fetchCart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle user login cart refresh & pending action fulfillment
  useEffect(() => {
    if (user) {
      fetchCart().then(() => {
        // If user logged in after clicking "Add to Cart", fulfill pending action now!
        if (pendingAction && pendingAction.type === 'add_to_cart') {
          addToCart(pendingAction.variantId, pendingAction.qty, pendingAction.productName);
          setPendingAction(null);
          setIsCartOpen(true);
        }
      });
    } else {
      setItems([]);
    }
  }, [user, fetchCart, pendingAction, setPendingAction]);

  const addToCart = async (variantId: string, qty = 1, productName = 'Product'): Promise<boolean> => {
    if (!user) {
      // Prompt login, save pending selection
      openAuthModal({
        type: 'add_to_cart',
        variantId,
        qty,
        productName,
      });
      return false;
    }

    try {
      // Check existing item
      const existing = items.find((i) => i.variant_id === variantId);
      if (existing) {
        const newQty = existing.qty + qty;
        await updateQty(existing.id, newQty);
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          variant_id: variantId,
          qty,
        });
        if (error) {
          console.error('Error adding to cart:', error.message);
          return false;
        }
        await fetchCart();
      }
      setIsCartOpen(true);
      return true;
    } catch (err) {
      console.error('Error in addToCart:', err);
      return false;
    }
  };

  const updateQty = async (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating qty:', error.message);
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, qty } : item))
      );
    } catch (err) {
      console.error('Error in updateQty:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error deleting cart item:', error.message);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error('Error in removeFromCart:', err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.price_paise * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        isCartOpen,
        totalItems,
        subtotalPaise,
        freeShippingThresholdPaise,
        setIsCartOpen,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
