import { useState } from "react";
import { useParams, Link } from "react-router";
import { Leaf, ShieldCheck, Truck, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "../cart/CartContext";

// Mock Data Source
const PRODUCTS = {
  "chikoo": { name: "Dehydrated Chikoo", price: 149, category: "Fruits", img: "https://images.unsplash.com/photo-1769425158355-86d35ad889a7?q=80&w=1000&auto=format&fit=crop" },
  "apple": { name: "Dehydrated Apple", price: 179, category: "Fruits", img: "https://images.unsplash.com/photo-1763140877786-5dc3287a6629?q=80&w=1000&auto=format&fit=crop" },
  "mango": { name: "Dehydrated Mango", price: 199, category: "Fruits", img: "https://images.unsplash.com/photo-1770124129809-fe1fe6b7c23e?q=80&w=1000&auto=format&fit=crop" },
  "jamun": { name: "Dehydrated Jamun", price: 219, category: "Fruits", img: "https://images.unsplash.com/photo-1759436738386-e2e743a11fc7?q=80&w=1000&auto=format&fit=crop" },
  "b12-powder": { name: "B12 Wellness Powder", price: 499, category: "Wellness", img: "https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?q=80&w=1000&auto=format&fit=crop" },
};

function Accordion({ title, content }: { title: string, content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E0D5]">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-heading font-bold text-lg text-text-dark hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && (
        <div className="pb-4 font-body text-text-muted text-[15px] leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS[id as keyof typeof PRODUCTS] || PRODUCTS["mango"]; // Fallback to mango
  const productId = id && PRODUCTS[id as keyof typeof PRODUCTS] ? id : "mango";
  const { add } = useCart();
  
  const [weight, setWeight] = useState("100g");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const total = product.price * qty;
  const whatsappMessage = [
    "*New Product Inquiry*",
    "Orvella Organics",
    "",
    "Hello, I would like to order this product.",
    "",
    "------------------------------",
    "*Product Details*",
    "------------------------------",
    `Product: ${product.name}`,
    `Weight: ${weight}`,
    `Quantity: ${qty}`,
    `Rate: ₹${product.price}`,
    `Total: ₹${total}`,
    "",
    "Please confirm availability and delivery details.",
  ].join("\n");

  const handleAddToCart = () => {
    add({ id: `${productId}-${weight}`, name: product.name, price: product.price, img: product.img, weight }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <div className="py-12 lg:py-24 px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-body text-text-muted mb-12">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-text-dark">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left Column - Images */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#E8E0D5]/50">
              <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`aspect-square bg-white rounded-[12px] overflow-hidden cursor-pointer border-2 ${i === 1 ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                   <img src={product.img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col">
            <h1 className="font-heading font-bold text-4xl lg:text-[40px] text-text-dark mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-amber-400">
                {[1,2,3,4].map(star => <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>)}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400/50"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
              </div>
              <span className="font-body text-sm text-text-muted">4.8 stars (48 reviews)</span>
            </div>

            <p className="font-body text-text-muted text-lg leading-relaxed mb-8">
              Experience the pure taste of nature. Our premium {product.name.toLowerCase()} are slow-dried to perfection to retain maximum nutrients, vibrant color, and intense flavor. The perfect healthy snack for any time of the day.
            </p>

            {/* Selectors */}
            <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-[#E8E0D5]">
              <div className="flex flex-col gap-3">
                <span className="font-heading font-bold text-text-dark">Select Weight</span>
                <div className="flex gap-3">
                  {["50g", "100g", "250g"].map((w) => (
                    <button 
                      key={w} 
                      onClick={() => setWeight(w)}
                      className={`px-6 py-2 rounded-full font-body font-medium transition-all ${weight === w ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-text-muted border border-[#E8E0D5] hover:border-primary-light'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-heading font-bold text-text-dark">Quantity</span>
                <div className="flex items-center w-32 bg-white rounded-full border border-primary/30 p-1">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors"><Minus size={16} /></button>
                  <span className="flex-1 text-center font-body font-bold text-text-dark">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors"><Plus size={16} /></button>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex flex-col">
                <span className="font-body font-bold text-primary text-[32px] leading-none">₹{product.price}</span>
                {qty > 1 && <span className="font-body text-text-muted text-sm mt-1">Total: ₹{total}</span>}
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href={`https://wa.me/916354726401?text=${encodeURIComponent(whatsappMessage)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-[10px] font-body font-bold text-lg hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/20"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Order on WhatsApp
                </a>
                <button onClick={handleAddToCart} className="w-full py-4 rounded-[10px] font-body font-bold text-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors">
                  {added ? "Added to Cart" : "Add to Cart"}
                </button>
              </div>
            </div>

            {/* Trust Icons */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                <Leaf size={18} className="text-primary" /> Natural
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                <ShieldCheck size={18} className="text-primary" /> Preservative Free
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                <Truck size={18} className="text-primary" /> Ships in 2 days
              </div>
            </div>

            {/* Accordions */}
            <div className="flex flex-col">
              <Accordion title="Ingredients" content={`100% Pure Organic ${product.name.replace('Dehydrated ', '')}. No added sugar, preservatives, or artificial colors.`} />
              <Accordion title="Nutritional Info" content="Per 100g: Calories 320kcal, Carbohydrates 78g, Dietary Fiber 12g, Sugars (Natural) 58g, Protein 2g." />
              <Accordion title="Storage Tips" content="Store in a cool, dry place away from direct sunlight. Once opened, keep in an airtight container and consume within 30 days." />
              <Accordion title="Shipping Policy" content="Free shipping on orders above ₹499. Orders are usually dispatched within 24 hours and delivered in 2-5 business days depending on the location." />
            </div>

          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-32">
          <h2 className="font-heading font-bold text-3xl text-text-dark mb-10 text-center">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(PRODUCTS).filter(p => p.name !== product.name).slice(0, 4).map((p, i) => (
              <div key={i} className="bg-white rounded-[16px] p-4 flex flex-col gap-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-[#E8E0D5]/50">
                <Link to="/products" className="block relative aspect-square rounded-[12px] overflow-hidden bg-bg-cream">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="flex flex-col gap-2">
                  <Link to="/products"><h3 className="font-heading font-bold text-lg text-text-dark">{p.name}</h3></Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-body font-bold text-primary text-lg">₹{p.price}</span>
                    <button className="text-primary text-sm font-medium hover:underline">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
