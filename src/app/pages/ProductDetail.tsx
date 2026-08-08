import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router";
import { Leaf, PackageCheck, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { CHIKOO_PRODUCT, PRODUCTS, getDefaultProductVariant } from "../data/products";

function getStockBadgeClass(product: any) {
  return product.isOutOfStock ? "bg-[#8B3E16]" : "bg-primary";
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E8E0D5]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-heading font-bold text-lg text-text-dark hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="pb-5 font-body text-text-muted text-[15px] leading-relaxed">{children}</div>}
    </div>
  );
}

function SuggestedProductCard({ product }: { product: any }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group grid grid-cols-[104px_1fr] gap-4 rounded-[14px] border border-[#E8E0D5]/70 bg-white p-3.5 shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-bg-cream">
        <img src={product.heroImage} alt={product.shortName} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
        <span className={`absolute left-2 top-2 rounded-full ${getStockBadgeClass(product)} px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white`}>
          {product.stockStatus}
        </span>
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <h3 className="font-heading text-lg font-bold leading-snug text-text-dark transition-colors group-hover:text-primary">{product.shortName}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.variants?.map((variant: any) => (
            <span
              key={variant.id}
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                variant.isOutOfStock
                  ? "border-[#8B3E16]/30 text-[#8B3E16]"
                  : "border-primary bg-primary text-white"
              }`}
            >
              {variant.label}
            </span>
          ))}
        </div>
        {product.price && <p className="mt-2 font-body text-sm font-bold text-primary">From ₹{product.price}</p>}
      </div>
    </Link>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find((item) => item.id === id) || (id === "chikoo" ? CHIKOO_PRODUCT : undefined);
  const [selectedImage, setSelectedImage] = useState(product?.heroImage || CHIKOO_PRODUCT.heroImage);
  const [selectedVariantId, setSelectedVariantId] = useState(getDefaultProductVariant().id);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.heroImage);
      setSelectedVariantId((product.variants?.find((variant: any) => !variant.isOutOfStock) || getDefaultProductVariant()).id);
    }
  }, [product]);

  if (!product) {
    return <Navigate to={`/products/${CHIKOO_PRODUCT.id}`} replace />;
  }

  const selectedVariant = product.variants?.find((variant: any) => variant.id === selectedVariantId) || product;
  const showProductMrp = selectedVariant.id === "200g";
  const suggestedProducts = PRODUCTS.filter((item) => item.id !== product.id);

  return (
    <div className="py-8 lg:py-14 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-sm font-body text-text-muted mb-6 lg:mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-text-dark">{product.shortName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[92px_1fr] lg:gap-4">
            <div className="relative order-1 h-[420px] sm:h-[520px] lg:order-2 lg:h-[620px] bg-white rounded-[16px] lg:rounded-[20px] overflow-hidden shadow-sm border border-[#E8E0D5]/50">
              <div className={`absolute left-4 top-4 z-10 inline-flex items-center rounded-full ${getStockBadgeClass(selectedVariant)} px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm`}>
                {selectedVariant.stockStatus}
              </div>
              <img src={selectedImage} alt={product.shortName} className="w-full h-full object-contain" />
            </div>
            <div className="order-2 grid grid-cols-5 gap-3 lg:order-1 lg:grid-cols-1 lg:content-start">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square bg-white rounded-[12px] overflow-hidden border-2 transition-opacity lg:h-[92px] lg:w-[92px] ${selectedImage === image ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={image} alt={`${product.shortName} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-heading font-bold text-2xl lg:text-[30px] leading-tight text-text-dark mb-4">{product.title}</h1>

            <p className="font-body text-text-muted text-base lg:text-lg leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="font-body text-sm font-bold text-text-dark mb-3">Select Variant</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.variants?.map((variant: any) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-[10px] border p-3 text-left transition-colors ${
                      selectedVariant.id === variant.id
                        ? "border-primary bg-primary text-white"
                        : variant.isOutOfStock
                          ? "border-[#8B3E16]/30 bg-white text-[#8B3E16] hover:bg-[#8B3E16]/5"
                          : "border-[#E8E0D5] bg-white text-text-dark hover:border-primary/50"
                    }`}
                  >
                    <span className="block font-body font-bold">{variant.label} / ₹{variant.price}</span>
                    {variant.packLabel && <span className="block text-xs opacity-80 mt-1">{variant.packLabel}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {selectedVariant.isOutOfStock ? (
                <>
                  <button disabled className="w-full py-4 rounded-[10px] font-body font-bold text-lg bg-[#D8CEC2] text-text-muted cursor-not-allowed">
                    Out of Stock
                  </button>
                  <p className="font-body text-sm text-text-muted text-center">Ordering is disabled until this {selectedVariant.weight} pack is back in stock.</p>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="font-body font-bold text-primary text-[34px] leading-none">₹{selectedVariant.price}</span>
                    {showProductMrp && product.mrp && <span className="font-body text-text-muted line-through">M.R.P.: ₹{product.mrp}</span>}
                    {showProductMrp && product.discount && <span className="font-body font-bold text-[#8B3E16]">{product.discount} off</span>}
                  </div>
                  {selectedVariant.unitPrice && <p className="font-body text-sm text-text-muted">{selectedVariant.unitPrice}</p>}
                  <a
                    href={`https://wa.me/919714280780?text=${encodeURIComponent(`Hi! I'd like to order: ${product.shortName} - ${selectedVariant.weight}${selectedVariant.packLabel ? ` (${selectedVariant.packLabel})` : ""} - ₹${selectedVariant.price}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-[10px] font-body font-bold text-lg hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/20"
                  >
                    Order on WhatsApp
                  </a>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                <Leaf size={18} className="text-primary" /> 100% Fruit
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                <ShieldCheck size={18} className="text-primary" /> No Preservatives
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                <PackageCheck size={18} className="text-primary" /> Resealable Pouch
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 lg:mt-10 rounded-[16px] border border-[#E8E0D5]/70 bg-white p-5 lg:p-8 shadow-sm">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-text-dark mb-3">Product Information</h2>
          <div className="flex flex-col">
            <Accordion title="About this item" defaultOpen>
              <ul className="space-y-2 list-disc pl-5">
                {product.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Accordion>

            <Accordion title="Key Features">
              <ul className="space-y-2 list-disc pl-5">
                {product.features.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Accordion>

            <Accordion title="Ingredients">
              <p>{product.ingredients}</p>
            </Accordion>

            {product.usage && (
              <Accordion title="How To Use">
                <ul className="space-y-2 list-disc pl-5">
                  {product.usage.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Accordion>
            )}

            <Accordion title="Nutritional Information">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left border border-[#E8E0D5] bg-white">
                  <thead>
                    <tr className="bg-bg-cream">
                      <th className="p-3 border-b border-[#E8E0D5]">Serving Size: 100g</th>
                      <th className="p-3 border-b border-[#E8E0D5]">Amount</th>
                      <th className="p-3 border-b border-[#E8E0D5]">%Daily Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.nutrition.map(([name, amount, value]) => (
                      <tr key={name}>
                        <td className="p-3 border-b border-[#E8E0D5]">{name}</td>
                        <td className="p-3 border-b border-[#E8E0D5]">{amount}</td>
                        <td className="p-3 border-b border-[#E8E0D5]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-sm">Approximate daily values are based on a 2000 calorie diet. Daily values not established.</p>
              </div>
            </Accordion>

            <Accordion title="Product Details">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {[
                  ["Product Dimensions", `${product.dimensions}; ${product.itemWeight}`],
                  ["Manufacturer", product.manufacturer],
                  ["Item Part Number", product.partNumber],
                  ["Country of Origin", product.countryOfOrigin],
                  product.itemForm ? ["Item Form", product.itemForm] : undefined,
                  product.packageQuantity ? ["Item Package Quantity", product.packageQuantity] : undefined,
                  ["Packer", product.packer],
                  ["Importer", product.importer],
                  ["Net Quantity", product.netQuantity],
                  ["Generic Name", product.genericName],
                  ["FSSAI Lic. No.", product.contact.fssai],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label}>
                    <span className="font-bold text-text-dark">{label}: </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Storage Information">
              <p>{product.storage}</p>
            </Accordion>

            <Accordion title="Legal Disclaimer">
              <p>{product.legalDisclaimer}</p>
            </Accordion>
          </div>
        </div>

        {suggestedProducts.length > 0 && (
          <section className="mt-7 lg:mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-text-dark">Our Products</h2>
                <p className="mt-1 font-body text-sm text-text-muted">Explore more Orvella Organics favourites.</p>
              </div>
              <Link to="/products" className="hidden font-body text-sm font-bold text-primary hover:text-primary-dark sm:inline">
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {suggestedProducts.map((item) => (
                <SuggestedProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
