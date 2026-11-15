import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeFromCart,
    subtotalPaise,
    totalItems,
    freeShippingThresholdPaise,
  } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotalRupees = subtotalPaise / 100;
  const freeShippingThresholdRupees = freeShippingThresholdPaise / 100;
  const differenceToFreeShipping = Math.max(0, freeShippingThresholdRupees - subtotalRupees);
  const progressPercent = Math.min(100, Math.round((subtotalRupees / freeShippingThresholdRupees) * 100));

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      openAuthModal();
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E8E0D5]">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E8E0D5] flex items-center justify-between bg-bg-cream/30">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-primary" />
              <h2 className="font-heading font-bold text-xl text-text-dark">Your Cart</h2>
              <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-xs rounded-full font-body">
                {totalItems} item{totalItems === 1 ? '' : 's'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-text-muted hover:text-text-dark hover:bg-white transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="p-4 bg-primary/5 border-b border-[#E8E0D5]">
            <div className="flex items-center gap-2 mb-1.5 font-body text-xs font-semibold text-text-dark">
              <Truck size={14} className="text-primary shrink-0" />
              {differenceToFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-primary">₹{differenceToFreeShipping}</strong> more to get <strong className="text-primary">FREE Delivery!</strong>
                </span>
              ) : (
                <span className="text-primary font-bold">
                  🎉 Congratulations! You unlocked FREE Delivery!
                </span>
              )}
            </div>
            <div className="w-full bg-[#E8E0D5] h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E8E0D5]/70">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <div className="w-16 h-16 rounded-full bg-bg-cream flex items-center justify-center text-primary mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-dark mb-1">Your cart is empty</h3>
                <p className="font-body text-sm text-text-muted mb-6 max-w-xs">
                  Discover our pure dehydrated fruit snacks and wellness powders.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="px-6 py-2.5 bg-primary text-white font-body text-sm font-semibold rounded-[10px] hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Image */}
                  <Link
                    to={`/products/${item.product_slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="w-20 h-20 bg-bg-cream rounded-[10px] overflow-hidden shrink-0 border border-[#E8E0D5]/50 flex items-center justify-center"
                  >
                    <img
                      src={item.hero_image}
                      alt={item.product_name}
                      className="w-full h-full object-contain p-1"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${item.product_slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-heading font-bold text-sm text-text-dark hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-text-muted hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <span className="inline-block mt-0.5 text-xs text-text-muted font-body">
                        Pack: <strong className="text-text-dark">{item.variant_label}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <span className="font-body font-bold text-sm text-primary">
                        ₹{(item.price_paise * item.qty) / 100}
                      </span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#D8CEC2] rounded-[8px] overflow-hidden bg-bg-cream/40">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="p-1 hover:bg-[#E8E0D5] text-text-dark transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold font-body text-text-dark min-w-[24px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          disabled={item.stock_qty > 0 && item.qty >= item.stock_qty}
                          className="p-1 hover:bg-[#E8E0D5] text-text-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8E0D5] bg-bg-cream/20">
              <div className="flex items-center justify-between mb-1.5 font-body">
                <span className="text-sm text-text-muted">Subtotal</span>
                <span className="font-bold text-lg text-text-dark">₹{subtotalRupees}</span>
              </div>
              <p className="text-xs text-text-muted font-body mb-4">
                Taxes included. Courier shipping calculated at checkout.
              </p>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-primary text-white font-body font-bold text-base rounded-[12px] hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
