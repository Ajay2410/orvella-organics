import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { productsVariants } from "../animations";
import { useCart } from "../cart/CartContext";

const PRODUCTS = [
  { id: "chikoo", name: "Dehydrated Chikoo", price: 149, category: "Fruits", img: "https://images.unsplash.com/photo-1769425158355-86d35ad889a7?q=80&w=800&auto=format&fit=crop", desc: "Naturally sweet and chewy chikoo slices." },
  { id: "apple", name: "Dehydrated Apple", price: 179, category: "Fruits", img: "https://images.unsplash.com/photo-1763140877786-5dc3287a6629?q=80&w=800&auto=format&fit=crop", desc: "Crisp and tart dried apple rings." },
  { id: "mango", name: "Dehydrated Mango", price: 199, category: "Fruits", img: "https://images.unsplash.com/photo-1770124129809-fe1fe6b7c23e?q=80&w=800&auto=format&fit=crop", desc: "Sweet, tangy, and bursting with tropical flavor." },
  { id: "jamun", name: "Dehydrated Jamun", price: 219, category: "Fruits", img: "https://images.unsplash.com/photo-1759436738386-e2e743a11fc7?q=80&w=800&auto=format&fit=crop", desc: "Rich in antioxidants, a slightly tart treat." },
  { id: "b12-powder", name: "B12 Wellness Powder", price: 499, category: "Wellness", img: "https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?q=80&w=800&auto=format&fit=crop", desc: "Plant-based energy boosting powder." },
];

function ProductCard({ product }: { product: any }) {
  const [weight, setWeight] = useState("100g");
  const { add } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    add({ id: `${product.id}-${weight}`, name: product.name, price: product.price, img: product.img, weight });
    setTimeout(() => setIsAdding(false), 380);
  };

  return (
    <motion.div 
      layout
  initial={{ opacity: 0, scale: 0.9 }}
  animate={isAdding ? { opacity: 1, scale: 1.02, boxShadow: '0 14px 36px rgba(59,130,246,0.12)' } : { opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.28 }}
      className="bg-white rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-[#E8E0D5]/50"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square rounded-[12px] overflow-hidden bg-bg-cream">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 bg-primary-light text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {product.category}
        </div>
      </Link>
      <div className="flex flex-col gap-3">
        <div>
          <Link to={`/products/${product.id}`}><h3 className="font-heading font-bold text-xl text-text-dark hover:text-primary transition-colors">{product.name}</h3></Link>
          <p className="font-body text-sm text-text-muted mt-1 truncate">{product.desc}</p>
        </div>
        
        <div className="flex gap-2">
          {["50g", "100g", "250g"].map((w) => (
            <button 
              key={w} 
              onClick={() => setWeight(w)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium font-body transition-colors border ${weight === w ? 'bg-primary text-white border-primary' : 'bg-transparent text-text-muted border-[#E8E0D5] hover:border-primary-light'}`}
            >
              {w}
            </button>
          ))}
        </div>
        
        <div className="font-body font-bold text-primary text-xl mt-1">₹{product.price}</div>
        
        <div className="flex flex-col gap-2 mt-2">
          <Link to={`/products/${product.id}`} className="w-full text-center border border-primary text-primary px-4 py-2.5 rounded-[8px] text-sm font-medium hover:bg-primary/5 transition-colors">
            View Details
          </Link>
          <a href={`https://wa.me/916354726401?text=Hi! I'd like to order: ${product.name} - ${weight}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-[8px] text-sm font-medium hover:opacity-90 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            WhatsApp Order
          </a>
          <button onClick={handleAdd} className="w-full mt-2 text-center bg-primary text-white px-4 py-2.5 rounded-[8px] text-sm font-medium hover:bg-primary-dark transition-colors">Add to Cart</button>
        </div>
      </div>
    </motion.div>
  );
}

export function Products() {
  const [filter, setFilter] = useState("All");

  const filtered = PRODUCTS.filter(p => filter === "All" || p.category === filter);

  return (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={productsVariants} className="py-24 px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <h1 className="font-heading font-bold text-4xl text-text-dark">All Products</h1>
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-[#E8E0D5]">
            {["All", "Fruits", "Wellness"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full font-body text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-cream'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </motion.div>
        
      </div>
    </motion.div>
  );
}
