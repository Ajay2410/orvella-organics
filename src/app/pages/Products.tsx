import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { productsVariants } from "../animations";
import { PRODUCTS, sortProductsByStockStatus } from "../data/products";

const STOCK_FILTERS = [
  { label: "All Stock", value: "all" },
  { label: "In Stock", value: "in-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Slices", value: "Fruits" },
  { label: "Powder", value: "Powders" },
];

const PRODUCT_SECTIONS = [
  { title: "Dried Fruit Slices", category: "Fruits" },
  { title: "Powders", category: "Powders" },
];

function getStockBadgeClass(product: any) {
  return product.isOutOfStock ? "bg-[#8B3E16]" : "bg-primary";
}

function hasInStockVariant(product: any) {
  return product.variants ? product.variants.some((variant: any) => !variant.isOutOfStock) : !product.isOutOfStock;
}

function hasOutOfStockVariant(product: any) {
  return product.variants ? product.variants.some((variant: any) => variant.isOutOfStock) : product.isOutOfStock;
}

function PriceBlock({ product }: { product: any }) {
  if (!product.price) {
    return <span className="font-body font-bold text-[#8B3E16] text-xl">{product.stockStatus}</span>;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-body">
      <span className="font-bold text-primary text-xl">₹{product.price}</span>
      {product.mrp && <span className="text-sm text-text-muted line-through">₹{product.mrp}</span>}
      {product.discount && <span className="text-sm font-bold text-[#8B3E16]">{product.discount} off</span>}
      {product.unitPrice && <span className="basis-full text-xs text-text-muted">{product.unitPrice}</span>}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.28 }}
      className="bg-white rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-[#E8E0D5]/50"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square rounded-[12px] overflow-hidden bg-bg-cream">
        <img src={product.heroImage} alt={product.shortName} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 bg-primary-light text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {product.category}
        </div>
        <div className={`absolute top-3 right-3 ${getStockBadgeClass(product)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
          {product.stockStatus}
        </div>
      </Link>
      <div className="flex flex-col gap-3">
        <div>
          <Link to={`/products/${product.id}`}><h3 className="font-heading font-bold text-xl text-text-dark hover:text-primary transition-colors">{product.shortName}</h3></Link>
          <p className="font-body text-sm text-text-muted mt-1 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.variants?.map((variant: any) => (
            <span
              key={variant.id}
              className={`px-3 py-1.5 rounded-full text-xs font-medium font-body border ${
                variant.isOutOfStock
                  ? "bg-white text-[#8B3E16] border-[#8B3E16]/30"
                  : "bg-primary text-white border-primary"
              }`}
            >
              {variant.label}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full text-xs font-medium font-body bg-transparent text-text-muted border border-[#E8E0D5]">Vegetarian</span>
        </div>
        
        <PriceBlock product={product} />
        
        <div className="flex flex-col gap-2 mt-2">
          <Link to={`/products/${product.id}`} className="w-full text-center border border-primary text-primary px-4 py-2.5 rounded-[8px] text-sm font-medium hover:bg-primary/5 transition-colors">
            View Details
          </Link>
          {product.isOutOfStock ? (
            <button disabled className="w-full mt-2 text-center bg-[#D8CEC2] text-text-muted px-4 py-2.5 rounded-[8px] text-sm font-medium cursor-not-allowed">Out of Stock</button>
          ) : (
            <a
              href={`https://wa.me/919714280780?text=${encodeURIComponent(`Hi! I'd like to order: ${product.shortName} - ${product.weight} - ₹${product.price}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full mt-2 text-center bg-[#25D366] text-white px-4 py-2.5 rounded-[8px] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Order on WhatsApp
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Products() {
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const filteredProducts = sortProductsByStockStatus(PRODUCTS.filter((product) => {
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    if (stockFilter === "in-stock") return hasInStockVariant(product);
    if (stockFilter === "out-of-stock") return hasOutOfStockVariant(product);
    return true;
  }));
  const sections = PRODUCT_SECTIONS.map((section) => ({
    ...section,
    products: filteredProducts.filter((product) => product.category === section.category),
  }))
    .filter((section) => section.products.length > 0)
    .sort((first, second) => {
      if (categoryFilter !== "all") return 0;
      return Number(first.products.every((product) => product.isOutOfStock)) - Number(second.products.every((product) => product.isOutOfStock));
    });

  return (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={productsVariants} className="py-12 lg:py-16 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl lg:text-4xl text-text-dark">All Products</h1>
            <p className="font-body text-sm text-text-muted mt-2">Filter by product type and stock availability.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row lg:justify-end gap-3 w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex items-center gap-2 bg-white p-1.5 rounded-[14px] sm:rounded-full shadow-sm border border-[#E8E0D5]">
              {CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={`px-3 sm:px-6 py-2 rounded-full font-body text-sm font-medium transition-colors ${
                    categoryFilter === filter.value ? "bg-primary text-white" : "text-primary hover:bg-bg-cream"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:flex items-center gap-2 bg-white p-1.5 rounded-[14px] sm:rounded-full shadow-sm border border-[#E8E0D5]">
              {STOCK_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStockFilter(filter.value)}
                  className={`px-3 sm:px-6 py-2 rounded-full font-body text-sm font-medium transition-colors ${
                    stockFilter === filter.value
                      ? "bg-primary text-white"
                      : filter.value === "out-of-stock"
                        ? "text-[#8B3E16] hover:bg-bg-cream"
                        : "text-primary hover:bg-bg-cream"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:gap-12">
          {sections.map((section) => (
            <section key={section.category} className="flex flex-col gap-5">
              <div className="flex items-end justify-between gap-4 border-b border-[#E8E0D5] pb-4">
                <div>
                  <h2 className="font-heading font-bold text-2xl lg:text-3xl text-text-dark">{section.title}</h2>
                  <p className="font-body text-sm text-text-muted mt-1">{section.products.length} product{section.products.length === 1 ? "" : "s"}</p>
                </div>
              </div>

              <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
                <AnimatePresence mode="popLayout">
                  {section.products.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white border border-[#E8E0D5] rounded-[12px] p-10 text-center font-body text-text-muted">
            No products match this filter.
          </div>
        )}
        
      </div>
    </motion.div>
  );
}
