import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router";
import { Leaf, PackageCheck, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { CHIKOO_PRODUCT, PRODUCTS } from "../data/products";

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

export function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find((item) => item.id === id) || (id === "chikoo" ? CHIKOO_PRODUCT : undefined);
  const [selectedImage, setSelectedImage] = useState(product?.heroImage || CHIKOO_PRODUCT.heroImage);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.heroImage);
    }
  }, [product]);

  if (!product) {
    return <Navigate to={`/products/${CHIKOO_PRODUCT.id}`} replace />;
  }

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
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-[16px] lg:rounded-[20px] overflow-hidden shadow-sm border border-[#E8E0D5]/50">
              <img src={selectedImage} alt={product.shortName} className="w-full h-full object-contain" />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square bg-white rounded-[12px] overflow-hidden border-2 transition-opacity ${selectedImage === image ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={image} alt={`${product.shortName} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center rounded-full bg-[#8B3E16] px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white mb-5">
              {product.stockStatus}
            </div>

            <h1 className="font-heading font-bold text-3xl lg:text-[38px] text-text-dark mb-4">{product.title}</h1>

            <p className="font-body text-text-muted text-base lg:text-lg leading-relaxed mb-6">{product.description}</p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                ["Flavour", product.flavour],
                ["Brand", product.brand],
                ["Net Weight", product.weight],
                ["Item Weight", product.itemWeight],
                product.itemForm ? ["Item Form", product.itemForm] : undefined,
                product.packageQuantity ? ["Package Quantity", product.packageQuantity] : undefined,
                ["UPC", product.upc],
                ["ASIN", product.asin],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} className="bg-white rounded-[10px] border border-[#E8E0D5]/70 p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted font-body">{label}</p>
                  <p className="font-body font-bold text-text-dark mt-1">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {product.isOutOfStock ? (
                <>
                  <button disabled className="w-full py-4 rounded-[10px] font-body font-bold text-lg bg-[#D8CEC2] text-text-muted cursor-not-allowed">
                    Out of Stock
                  </button>
                  <p className="font-body text-sm text-text-muted text-center">Ordering is disabled until this {product.weight} pack is back in stock.</p>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="font-body font-bold text-primary text-[34px] leading-none">₹{product.price}</span>
                    {product.mrp && <span className="font-body text-text-muted line-through">M.R.P.: ₹{product.mrp}</span>}
                    {product.discount && <span className="font-body font-bold text-[#8B3E16]">{product.discount} off</span>}
                  </div>
                  {product.unitPrice && <p className="font-body text-sm text-text-muted">{product.unitPrice}</p>}
                  <a
                    href={`https://wa.me/916354726401?text=${encodeURIComponent(`Hi! I'd like to order: ${product.shortName} - ${product.weight} - ₹${product.price}`)}`}
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
        </div>
      </div>
    </div>
  );
}
