import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, MapPin, MessageCircle, Minus, Plus, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { useCart } from "../cart/CartContext";

const WHATSAPP_PHONE = "916354726401";

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
};

const initialForm: CheckoutForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  notes: "",
};

export default function Cart() {
  const { items, updateQty, remove, total } = useCart();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const shipping = total >= 499 ? 0 : 49;
  const grandTotal = total + shipping;

  const orderMessage = useMemo(() => {
    const productLines = items.map((item, index) => {
      const weight = item.weight ? ` (${item.weight})` : "";
      return [
        `*${index + 1}. ${item.name}${weight}*`,
        `Quantity: ${item.qty}`,
        `Rate: ₹${item.price}`,
        `Amount: ₹${item.price * item.qty}`,
      ].join("\n");
    }).join("\n\n");

    return [
      "*New Order Request*",
      "Orvella Organics",
      "",
      "Hello, I would like to place this order.",
      "",
      "------------------------------",
      "*Product Details*",
      "------------------------------",
      productLines,
      "",
      "------------------------------",
      "*Bill Summary*",
      "------------------------------",
      `Total Items: ${itemCount}`,
      `Subtotal: ₹${total}`,
      `Shipping: ${shipping === 0 ? "Free" : `₹${shipping}`}`,
      `Grand Total: ₹${grandTotal}`,
      "",
      "------------------------------",
      "*Delivery Details*",
      "------------------------------",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}`,
      `City: ${form.city}`,
      `Pincode: ${form.pincode}`,
      form.notes ? `Notes: ${form.notes}` : "",
      "",
      "Please confirm availability and delivery time.",
    ].filter(Boolean).join("\n");
  }, [form, grandTotal, itemCount, items, shipping, total]);

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!form.phone.trim()) nextErrors.phone = "Please enter your phone number.";
    if (!form.address.trim()) nextErrors.address = "Please enter your full address.";
    if (!form.city.trim()) nextErrors.city = "Please enter your city.";
    if (!form.pincode.trim()) nextErrors.pincode = "Please enter your pincode.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendToWhatsApp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(orderMessage)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-16 lg:py-24 px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="font-body text-primary font-bold uppercase tracking-[0.16em] text-xs">Cart flow</span>
            <h1 className="font-heading font-bold text-4xl text-text-dark mt-2">Your Cart</h1>
            <p className="font-body text-text-muted mt-2">Review your items, add delivery details, and send the order on WhatsApp.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-primary font-body font-bold hover:text-primary-dark transition-colors">
            Add more products <ArrowRight size={18} />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white p-8 lg:p-12 rounded-[16px] shadow-sm text-center border border-[#E8E0D5]/60">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary-light/20 text-primary flex items-center justify-center mb-5">
              <ShoppingBag size={28} />
            </div>
            <p className="text-text-muted">No items in your cart yet.</p>
            <Link to="/products" className="inline-block mt-5 bg-primary text-white px-6 py-3 rounded-[10px] font-body font-bold hover:bg-primary-dark transition-colors">Browse products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-5 lg:p-6 rounded-[16px] shadow-sm border border-[#E8E0D5]/60">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
                <h2 className="font-heading font-bold text-2xl text-text-dark">Selected Products</h2>
                <span className="bg-bg-cream text-primary px-3 py-1 rounded-full text-sm font-body font-bold">{itemCount} items</span>
              </div>
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} layout className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 border-b border-[#E8E0D5] last:border-b-0">
                    <img src={it.img} alt={it.name} className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-[12px] bg-bg-cream" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading font-bold text-xl text-text-dark">{it.name}</h3>
                          {it.weight && <p className="text-primary text-sm font-body font-bold mt-1">{it.weight}</p>}
                        </div>
                        <button onClick={() => remove(it.id)} className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-primary/10 transition-colors" aria-label={`Remove ${it.name}`}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <p className="text-text-muted text-sm mt-1">₹{it.price} each</p>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center bg-bg-cream rounded-full border border-primary/20 p-1">
                          <button onClick={() => updateQty(it.id, it.qty - 1)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label="Decrease quantity"><Minus size={15} /></button>
                          <div className="w-10 text-center font-body font-bold text-text-dark">{it.qty}</div>
                          <button onClick={() => updateQty(it.id, it.qty + 1)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label="Increase quantity"><Plus size={15} /></button>
                        </div>
                        <span className="font-body font-bold text-primary text-lg">₹{it.price * it.qty}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
              <form onSubmit={sendToWhatsApp} className="bg-white p-5 lg:p-6 rounded-[16px] shadow-sm border border-[#E8E0D5]/60">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary-light/20 text-primary flex items-center justify-center"><MapPin size={20} /></div>
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-text-dark">Delivery Details</h2>
                    <p className="font-body text-sm text-text-muted">These details will be sent with your WhatsApp order.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" error={errors.name}>
                    <input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="cart-input" placeholder="Your name" />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="cart-input" placeholder="Mobile number" inputMode="tel" />
                  </Field>
                  <Field label="Address" error={errors.address} className="sm:col-span-2">
                    <textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} className="cart-input min-h-[96px] resize-none" placeholder="House no, street, area" />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="cart-input" placeholder="City" />
                  </Field>
                  <Field label="Pincode" error={errors.pincode}>
                    <input value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} className="cart-input" placeholder="Pincode" inputMode="numeric" />
                  </Field>
                  <Field label="Order Notes" className="sm:col-span-2">
                    <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="cart-input min-h-[76px] resize-none" placeholder="Any delivery note, gift message, or preferred time" />
                  </Field>
                </div>

                <button type="submit" className="mt-6 w-full flex items-center justify-center gap-3 bg-[#25D366] text-white px-4 py-4 rounded-[12px] font-body font-bold text-lg hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/20">
                  <MessageCircle size={22} /> Send Order on WhatsApp
                </button>
              </form>
            </div>
            <aside className="bg-white p-6 rounded-[16px] shadow-sm h-fit border border-[#E8E0D5]/60 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary-light/20 text-primary flex items-center justify-center"><UserRound size={20} /></div>
                <h4 className="font-heading font-bold text-2xl text-text-dark">Order Summary</h4>
              </div>
              <div className="space-y-3 font-body">
                <div className="flex items-center justify-between"><span className="text-text-muted">Items</span><span className="font-medium">{itemCount}</span></div>
                <div className="flex items-center justify-between"><span className="text-text-muted">Subtotal</span><span className="font-medium">₹{total}</span></div>
                <div className="flex items-center justify-between"><span className="text-text-muted">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                <div className="pt-4 border-t border-[#E8E0D5] flex items-center justify-between"><span className="font-bold text-text-dark">Total</span><span className="font-bold text-2xl text-primary">₹{grandTotal}</span></div>
              </div>
              <div className="mt-5 bg-bg-cream rounded-[12px] p-4 text-sm text-text-muted leading-relaxed">
                No online payment is collected here. Your complete cart and address open directly in WhatsApp for confirmation.
              </div>
            </aside>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-2 font-body ${className}`}>
      <span className="text-sm font-bold text-text-dark">{label}</span>
      {children}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
