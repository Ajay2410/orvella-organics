import { Leaf, Eye, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { aboutVariants } from "../animations";

const ABOUT_IMAGES = {
  dehydrationTray: "https://images.pexels.com/photos/36326594/pexels-photo-36326594.jpeg?auto=compress&cs=tinysrgb&w=1200",
  driedAssortment: "https://images.pexels.com/photos/36326593/pexels-photo-36326593.jpeg?auto=compress&cs=tinysrgb&w=1000",
  driedDisplay: "https://images.pexels.com/photos/14699875/pexels-photo-14699875.jpeg?auto=compress&cs=tinysrgb&w=1000",
  fruitPrep: "https://images.pexels.com/photos/8963389/pexels-photo-8963389.jpeg?auto=compress&cs=tinysrgb&w=800",
  hangingSlices: "https://images.pexels.com/photos/10614249/pexels-photo-10614249.jpeg?auto=compress&cs=tinysrgb&w=800",
};

export function About() {
  return (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={aboutVariants} className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary px-4 sm:px-6 lg:px-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2">
          <div className="py-14 lg:py-20 flex flex-col justify-center">
            <h1 className="font-heading font-bold text-3xl lg:text-[42px] text-white leading-tight">
              We Believe in Food That's Honest.
            </h1>
            <p className="font-body text-primary-light mt-6 text-lg max-w-md">
              At Orvella Organics, our mission is to bring you nature's finest, dried to perfection without any compromises.
            </p>
          </div>
          <div className="relative min-h-[360px] lg:min-h-0 flex items-center justify-center py-8 lg:py-0">
            <div className="absolute inset-y-8 right-0 left-6 lg:left-12 bg-white/10 rounded-tl-[80px]"></div>
            <div className="relative z-10 w-full max-w-[620px] h-[360px] rounded-tl-[80px] rounded-br-[28px] overflow-hidden shadow-2xl">
              <img src={ABOUT_IMAGES.dehydrationTray} alt="Dehydrated fruit slices arranged on drying trays" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-14 lg:py-18 px-4 sm:px-6 lg:px-20 bg-bg-cream">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-text-dark">Our Story</h2>
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
               <img src={ABOUT_IMAGES.driedAssortment} className="w-full h-full object-cover bg-white" alt="Assorted dehydrated fruit slices" />
             </div>
             <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[24px] overflow-hidden shadow-lg z-10">
               <img src={ABOUT_IMAGES.driedDisplay} className="w-full h-full object-cover bg-white" alt="Dried fruit slices served as healthy snacks" />
             </div>
        </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-14 lg:py-18 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-text-dark mb-10">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-5 lg:gap-8">
            <div className="bg-bg-cream p-6 lg:p-8 rounded-[18px] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-light/20 flex items-center justify-center text-primary mb-6">
                <Leaf size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-dark mb-4">Sustainability</h3>
              <p className="font-body text-text-muted">We source responsibly, support fair trade with our farmers, and package our products using eco-conscious materials whenever possible.</p>
            </div>
            
            <div className="bg-bg-cream p-6 lg:p-8 rounded-[18px] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-light/20 flex items-center justify-center text-primary mb-6">
                <Eye size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-dark mb-4">Transparency</h3>
              <p className="font-body text-text-muted">What you see on the label is exactly what you get. We never hide behind complex chemical names or "natural flavorings".</p>
            </div>
            
            <div className="bg-bg-cream p-6 lg:p-8 rounded-[18px] flex flex-col items-center">
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
      <section className="py-14 lg:py-18 px-4 sm:px-6 lg:px-20 bg-bg-cream overflow-hidden">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-text-dark mb-12">From Farm to You</h2>
          
          <div className="relative">
            {/* Dashed line */}
            <div className="hidden lg:block absolute top-[50%] left-0 right-0 h-[2px] border-t-2 border-dashed border-primary-light/50 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              
              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src={ABOUT_IMAGES.fruitPrep} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Fresh fruit and dried fruit preparation" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">1. Source</h4>
                <p className="font-body text-sm text-text-muted">Procuring from local organic farms</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src={ABOUT_IMAGES.driedDisplay} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Clean sliced fruit ready for drying" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">2. Clean</h4>
                <p className="font-body text-sm text-text-muted">Washed & prepared naturally</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src={ABOUT_IMAGES.dehydrationTray} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Fruit slices drying on dehydrator trays" />
                  <div className="absolute inset-0 bg-primary/20"></div>
                </div>
                <h4 className="font-heading font-bold text-xl text-text-dark mb-2">3. Dehydrate</h4>
                <p className="font-body text-sm text-text-muted">Slow-dried at low temperatures</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 relative bg-white">
                  <img src={ABOUT_IMAGES.hangingSlices} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Finished dried fruit slices" />
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
