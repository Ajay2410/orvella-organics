import { Leaf, Eye, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { aboutVariants } from "../animations";

export function About() {
  return (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={aboutVariants} className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary px-6 lg:px-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2">
          <div className="py-24 lg:py-32 flex flex-col justify-center">
            <h1 className="font-heading font-bold text-4xl lg:text-[44px] text-white leading-tight">
              We Believe in Food That's Honest.
            </h1>
            <p className="font-body text-primary-light mt-6 text-lg max-w-md">
              At Orvella Organics, our mission is to bring you nature's finest, dried to perfection without any compromises.
            </p>
          </div>
          <div className="relative min-h-[400px] lg:min-h-0">
            <img 
              src="https://images.unsplash.com/photo-1609848350757-252557c83136?q=80&w=1000&auto=format&fit=crop" 
              alt="Founder" 
              className="absolute inset-0 w-full h-full object-cover rounded-tl-[100px]"
            />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-6 lg:px-20 bg-bg-cream">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h2 className="font-heading font-bold text-4xl text-text-dark">Our Story</h2>
            <div className="w-12 h-1 bg-primary rounded-full"></div>
            <p className="font-body text-text-muted leading-relaxed text-lg">
              It started with a simple observation: most "healthy" snacks in the market were loaded with hidden sugars, preservatives, or artificial flavorings. We wanted something better for our families, something that tasted just like the real fruit.
            </p>
            <p className="font-body text-text-muted leading-relaxed text-lg">
              That's how Orvella Organics was born. We partnered directly with local farmers across India to source the finest, ripest fruits. By using advanced low-heat dehydration, we found a way to preserve up to 98% of the natural nutrients while intensifying the flavor.
            </p>
            <p className="font-body text-text-dark font-medium leading-relaxed mt-4 text-lg">
              No compromises, no additives. Just pure, sun-kissed goodness in every bite.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-center h-[500px]"
          >
             {/* Decorative layout for fruits */}
             <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-[24px] overflow-hidden shadow-xl z-20">
               <img src="https://images.unsplash.com/photo-1770124129809-fe1fe6b7c23e?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Dehydrated Mango" />
             </div>
             <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[24px] overflow-hidden shadow-lg z-10">
               <img src="https://images.unsplash.com/photo-1694487652603-18ee5406a88f?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Farm" />
             </div>
        </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl text-text-dark mb-16">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-bg-cream p-10 rounded-[24px] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-light/20 flex items-center justify-center text-primary mb-6">
                <Leaf size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-dark mb-4">Sustainability</h3>
              <p className="font-body text-text-muted">We source responsibly, support fair trade with our farmers, and package our products using eco-conscious materials whenever possible.</p>
            </div>
            
            <div className="bg-bg-cream p-10 rounded-[24px] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-light/20 flex items-center justify-center text-primary mb-6">
                <Eye size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-dark mb-4">Transparency</h3>
              <p className="font-body text-text-muted">What you see on the label is exactly what you get. We never hide behind complex chemical names or "natural flavorings".</p>
            </div>
            
            <div className="bg-bg-cream p-10 rounded-[24px] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-light/20 flex items-center justify-center text-primary mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-dark mb-4">Quality First</h3>
              <p className="font-body text-text-muted">From the moment the fruit is plucked to the time it is sealed in our pouches, strict quality controls ensure you get the best.</p>
            </div>
          </div>
        </div>
      </section>

      {/* From Farm to You Timeline */}
      <section className="py-24 px-6 lg:px-20 bg-bg-cream overflow-hidden">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl text-text-dark mb-20">From Farm to You</h2>
          
          <div className="relative">
            {/* Dashed line */}
            <div className="hidden lg:block absolute top-[50%] left-0 right-0 h-[2px] border-t-2 border-dashed border-primary-light/50 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              
              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src="https://images.unsplash.com/photo-1694487652603-18ee5406a88f?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Source" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">1. Source</h4>
                <p className="font-body text-sm text-text-muted">Procuring from local organic farms</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src="https://images.unsplash.com/photo-1759436738386-e2e743a11fc7?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Clean" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">2. Clean</h4>
                <p className="font-body text-sm text-text-muted">Washed & prepared naturally</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src="https://images.unsplash.com/photo-1763140877786-5dc3287a6629?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Dehydrate" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">3. Dehydrate</h4>
                <p className="font-body text-sm text-text-muted">Slow-dried at low temperatures</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src="https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Pack" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">4. Pack</h4>
                <p className="font-body text-sm text-text-muted">Sealed for freshness & shipped</p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
