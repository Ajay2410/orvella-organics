import { Link } from "react-router";
import { Leaf, Sun, PackageSearch, Droplet, Zap, Heart, Instagram } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useCart } from "../cart/CartContext";
import { homeVariants } from "../animations";

const PRODUCTS = [
  { id: "chikoo", name: "Dehydrated Chikoo", price: 149, category: "Fruit", img: "https://images.unsplash.com/photo-1769425158355-86d35ad889a7?q=80&w=800&auto=format&fit=crop" },
  { id: "apple", name: "Dehydrated Apple", price: 179, category: "Fruit", img: "https://images.unsplash.com/photo-1763140877786-5dc3287a6629?q=80&w=800&auto=format&fit=crop" },
  { id: "mango", name: "Dehydrated Mango", price: 199, category: "Fruit", img: "https://images.unsplash.com/photo-1770124129809-fe1fe6b7c23e?q=80&w=800&auto=format&fit=crop" },
  { id: "jamun", name: "Dehydrated Jamun", price: 219, category: "Fruit", img: "https://images.unsplash.com/photo-1759436738386-e2e743a11fc7?q=80&w=800&auto=format&fit=crop" },
];

function ProductCard({ product }: { product: any }) {
  const [weight, setWeight] = useState("100g");
  const { add } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAdd = () => {
    setIsAdding(true);
    add({ id: product.id, name: product.name, price: product.price, img: product.img });
    setTimeout(() => setIsAdding(false), 380);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      animate={isAdding ? { scale: 1.03, boxShadow: '0 14px 40px rgba(59,130,246,0.14)' } : { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
      className="bg-bg-card rounded-[16px] p-4 flex flex-col gap-4 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square rounded-[12px] overflow-hidden bg-white">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </Link>
      <div className="flex flex-col gap-2">
        <Link to={`/products/${product.id}`}><h3 className="font-heading font-bold text-lg text-text-dark">{product.name}</h3></Link>
        <div className="flex gap-2">
          {["50g", "100g", "250g"].map((w) => (
            <button 
              key={w} 
              onClick={() => setWeight(w)}
              className={`px-3 py-1 rounded-full text-xs font-medium font-body transition-colors ${weight === w ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-primary/10 border border-transparent'}`}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-body font-bold text-primary text-lg">₹{product.price}</span>
          <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-primary-dark transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Home() {
  return (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={homeVariants} className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full bg-bg-cream py-24 px-6 lg:px-20 overflow-hidden">
        {/* Decorative elements - simple mock representations */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-peach/30 rounded-full blur-2xl"></div>

        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-6 max-w-xl"
      >
        <h1 className="font-heading font-bold text-5xl lg:text-[56px] leading-[1.1] text-text-dark">
          Nature's Goodness, Dried to Perfection.
        </h1>
        <p className="font-body text-lg text-text-muted">
          Premium dehydrated fruits & B12 wellness — snack smarter, live better.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Link to="/products" className="bg-primary text-white px-8 py-3.5 rounded-[8px] font-medium hover:bg-primary-dark transition-colors">
            Shop Now
          </Link>
          <Link to="/about" className="border-2 border-primary text-primary px-8 py-3.5 rounded-[8px] font-medium hover:bg-primary hover:text-white transition-colors">
            Our Story
          </Link>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-[#E8E0D5]">
          <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
            <Leaf size={18} className="text-primary" /> 100% Natural
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
            <Zap size={18} className="text-primary" /> No Preservatives
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
            <PackageSearch size={18} className="text-primary" /> Free Shipping ₹499+
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="hidden lg:block relative h-[500px]"
      >
         <img src="https://images.unsplash.com/photo-1769425158355-86d35ad889a7?q=80&w=1000&auto=format&fit=crop" alt="Hero Fruits" className="w-full h-full object-cover rounded-[24px] shadow-2xl" />
      </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-bold text-4xl text-center text-text-dark mb-12"
          >
            Our Bestsellers
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Why Orvella */}
      <section className="py-24 px-6 lg:px-20 bg-bg-cream">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-[1440px] mx-auto grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-primary-light/30"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col items-center gap-4 pt-8 md:pt-0 md:px-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Leaf size={32} />
            </div>
            <h3 className="font-heading font-bold text-xl text-text-dark">Farm to Pack Freshness</h3>
            <p className="font-body text-text-muted">Sourced directly from local farmers and processed within 24 hours.</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col items-center gap-4 pt-8 md:pt-0 md:px-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Sun size={32} />
            </div>
            <h3 className="font-heading font-bold text-xl text-text-dark">Rich in Nutrients</h3>
            <p className="font-body text-text-muted">Slow-dried at low temperatures to retain 98% of vitamins and minerals.</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col items-center gap-4 pt-8 md:pt-0 md:px-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Droplet size={32} />
            </div>
            <h3 className="font-heading font-bold text-xl text-text-dark">Zero Additives</h3>
            <p className="font-body text-text-muted">No added sugar, colors, or preservatives. Just pure fruit goodness.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* B12 Spotlight */}
      <section className="bg-primary-dark w-full py-24 px-6 lg:px-20 text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h2 className="font-heading font-bold text-4xl lg:text-5xl leading-tight">
              Fuel Your Day with B12 Wellness Powder
            </h2>
            <p className="font-body text-primary-light text-lg">
              A plant-based, natural source of energy to keep you vitalized all day long.
            </p>
            <ul className="flex flex-col gap-3 font-body text-[15px] text-[#E8E0D5] mt-4">
              <li className="flex items-center gap-3"><Heart size={20} className="text-primary-light" /> Boosts energy levels naturally</li>
              <li className="flex items-center gap-3"><Heart size={20} className="text-primary-light" /> Supports healthy nervous system</li>
              <li className="flex items-center gap-3"><Heart size={20} className="text-primary-light" /> 100% Vegan-friendly & organic</li>
            </ul>
            <div className="mt-6">
              <Link to="/products" className="bg-peach text-primary-dark px-8 py-3.5 rounded-[8px] font-medium hover:bg-white transition-colors inline-block">
                Explore B12 Powder
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary-light opacity-20 blur-[100px] rounded-full"></div>
            <img src="https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?q=80&w=1000&auto=format&fit=crop" alt="B12 Wellness Powder" className="relative z-10 w-full max-w-md mx-auto object-cover aspect-square rounded-[24px] shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-bold text-4xl text-center text-text-dark mb-16"
          >
            How It Works
          </motion.h2>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 relative"
          >
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-primary-light/40 z-0"></div>
            
            {[
              { step: 1, title: "We source fresh fruits", desc: "Handpicked from selected organic farms." },
              { step: 2, title: "Slow-dried at low heat", desc: "Preserving nutrients, taste, and color." },
              { step: 3, title: "Packed with care", desc: "Delivered fresh to your doorstep." }
            ].map((item) => (
              <motion.div 
                key={item.step} 
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                className="flex flex-col items-center text-center relative z-10 max-w-[250px] bg-white"
              >
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">{item.title}</h4>
                <p className="font-body text-text-muted text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-20 bg-bg-cream">
        <div className="max-w-[1440px] mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-bold text-4xl text-center text-text-dark mb-16"
          >
            What Our Customers Say
          </motion.h2>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { text: "The dehydrated mangoes taste exactly like summer! My kids love them as a healthy snack for school.", name: "Priya S.", loc: "Mumbai" },
              { text: "Started using the B12 powder in my morning smoothies. I feel so much more energetic throughout the day.", name: "Rahul M.", loc: "Bangalore" },
              { text: "Exceptional quality. You can really tell there's no added sugar in the chikoo. Simply perfect.", name: "Anita K.", loc: "Delhi" }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.04)] relative"
              >
                <div className="absolute top-6 right-6 text-primary-light/20">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[1,2,3,4,5].map(star => <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>)}
                </div>
                <p className="font-body text-text-dark mb-6 leading-relaxed">"{t.text}"</p>
                <div className="mt-auto">
                  <p className="font-bold text-sm font-body text-text-dark">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.loc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Instagram / Gallery Strip */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl text-text-dark flex items-center justify-center gap-3">
            <Instagram className="text-primary" /> Follow @orvellaorganics
          </h2>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-4 px-4 overflow-x-auto pb-8 snap-x">
          {[
            "https://images.unsplash.com/photo-1769425158355-86d35ad889a7?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1763140877786-5dc3287a6629?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1770124129809-fe1fe6b7c23e?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1759436738386-e2e743a11fc7?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1694487652603-18ee5406a88f?q=80&w=400&auto=format&fit=crop"
          ].map((img, i) => (
            <div key={i} className="min-w-[200px] w-[200px] md:min-w-[0] md:flex-1 aspect-square rounded-[16px] overflow-hidden relative group snap-center cursor-pointer">
              <img src={img} alt="Instagram post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="py-24 px-6 lg:px-20 bg-bg-cream">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-[800px] mx-auto text-center bg-white p-12 rounded-[24px] shadow-sm border border-primary-light/20"
        >
          <h2 className="font-heading font-bold text-3xl text-text-dark mb-4">Get 10% Off Your First Order</h2>
          <p className="font-body text-text-muted mb-8">Join our community for wholesome updates, exclusive offers, and nutrition tips.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-[500px] mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-5 py-3.5 rounded-[8px] border border-[#E8E0D5] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
              required
            />
            <button type="submit" className="bg-primary text-white px-8 py-3.5 rounded-[8px] font-medium hover:bg-primary-dark transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
          <p className="text-xs text-text-muted mt-4 font-body">No spam, only wholesome updates.</p>
      </motion.div>
      </section>
    </motion.div>
  );
}
