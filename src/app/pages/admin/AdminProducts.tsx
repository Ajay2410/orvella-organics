import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { ImagePlus, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { getCurrentAdmin, signOutAdmin } from "../../services/firebase/authService";
import { isFirebaseConfigured } from "../../services/firebase/firebaseConfig";
import { getDefaultLocalProduct, productService, type Product, type ProductInput } from "../../services/products/productService";
import { PRODUCT_VARIANTS } from "../../data/products";

type ProductFormState = {
  id: string;
  name: string;
  shortName: string;
  title: string;
  category: string;
  brand: string;
  weight: string;
  price: string;
  mrp: string;
  unitPrice: string;
  stockStatus: string;
  isOutOfStock: boolean;
  description: string;
  ingredients: string;
  imagesText: string;
  heroImage: string;
  highlightsText: string;
  featuresText: string;
  usageText: string;
  nutritionText: string;
  variantsText: string;
  storage: string;
  legalDisclaimer: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: ProductFormState = {
  id: "",
  name: "",
  shortName: "",
  title: "",
  category: "Fruits",
  brand: "ORVELLA ORGANICS",
  weight: "200g",
  price: "",
  mrp: "",
  unitPrice: "",
  stockStatus: "In Stock",
  isOutOfStock: false,
  description: "",
  ingredients: "",
  imagesText: "",
  heroImage: "",
  highlightsText: "",
  featuresText: "",
  usageText: "",
  nutritionText: "",
  variantsText: JSON.stringify(PRODUCT_VARIANTS, null, 2),
  storage: "Store in a cool and dry place. Reseal the pouch properly after opening.",
  legalDisclaimer: "Actual product packaging and materials may contain more and different information than what is shown on our website.",
  isActive: true,
  sortOrder: "0",
};

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function nutritionFromText(value: string) {
  return linesToArray(value).map((line) => line.split("|").map((part) => part.trim()));
}

function nutritionToText(value: string[][] = []) {
  return value.map((row) => row.join(" | ")).join("\n");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function productToForm(product: Product): ProductFormState {
  return {
    ...emptyForm,
    id: product.id,
    name: product.name,
    shortName: product.shortName,
    title: product.title,
    category: product.category,
    brand: product.brand,
    weight: product.weight,
    price: product.price?.toString() || "",
    mrp: product.mrp?.toString() || "",
    unitPrice: product.unitPrice || "",
    stockStatus: product.stockStatus,
    isOutOfStock: product.isOutOfStock,
    description: product.description,
    ingredients: product.ingredients,
    imagesText: product.images.join("\n"),
    heroImage: product.heroImage,
    highlightsText: product.highlights.join("\n"),
    featuresText: product.features.join("\n"),
    usageText: product.usage?.join("\n") || "",
    nutritionText: nutritionToText(product.nutrition),
    variantsText: JSON.stringify(product.variants || PRODUCT_VARIANTS, null, 2),
    storage: product.storage,
    legalDisclaimer: product.legalDisclaimer,
    isActive: product.isActive !== false,
    sortOrder: product.sortOrder?.toString() || "0",
  };
}

function buildProductPayload(form: ProductFormState, baseProduct?: Product): ProductInput {
  const images = linesToArray(form.imagesText);
  const id = form.id || slugify(form.shortName || form.name);
  const variants = JSON.parse(form.variantsText);

  return {
    ...(baseProduct || {}),
    id,
    name: form.name,
    shortName: form.shortName,
    title: form.title || form.name,
    category: form.category,
    brand: form.brand,
    weight: form.weight,
    price: form.price ? Number(form.price) : undefined,
    mrp: form.mrp ? Number(form.mrp) : undefined,
    unitPrice: form.unitPrice,
    stockStatus: form.stockStatus,
    isOutOfStock: form.isOutOfStock,
    description: form.description,
    ingredients: form.ingredients,
    images,
    heroImage: form.heroImage || images[0] || "",
    highlights: linesToArray(form.highlightsText),
    features: linesToArray(form.featuresText),
    usage: linesToArray(form.usageText),
    nutrition: nutritionFromText(form.nutritionText),
    variants,
    storage: form.storage,
    legalDisclaimer: form.legalDisclaimer,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder || 0),
    contact: baseProduct?.contact || {
      address: "Surat, Gujarat, Pin code: 395006",
      phone: "+91 97142 80780",
      email: "orvellaorganics@gmail.com",
      fssai: "20726031003417",
    },
  };
}

export function AdminProducts() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  useEffect(() => {
    return getCurrentAdmin((user) => {
      setIsAuthenticated(Boolean(user));
      setIsCheckingAuth(false);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    refreshProducts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedProduct) {
      setForm(productToForm(selectedProduct));
    }
  }, [selectedProduct]);

  async function refreshProducts() {
    const items = await productService.getProducts();
    setProducts(items);
    if (!selectedProductId && items[0]) {
      setSelectedProductId(items[0].id);
      setForm(productToForm(items[0]));
    }
  }

  function updateForm(field: keyof ProductFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function startNewProduct() {
    const defaultProduct = await getDefaultLocalProduct();
    setSelectedProductId("");
    setForm({
      ...emptyForm,
      highlightsText: defaultProduct.highlights.join("\n"),
      featuresText: defaultProduct.features.join("\n"),
      nutritionText: nutritionToText(defaultProduct.nutrition),
    });
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const productId = form.id || slugify(form.shortName || form.name);
    if (!productId) {
      setError("Add a product name before uploading images.");
      return;
    }

    setError("");
    setIsUploading(true);
    try {
      const imageUrl = await productService.uploadProductImage(file, productId);
      const nextImages = [...linesToArray(form.imagesText), imageUrl];
      setForm((current) => ({
        ...current,
        id: productId,
        imagesText: nextImages.join("\n"),
        heroImage: current.heroImage || imageUrl,
      }));
      setMessage("Image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const payload = buildProductPayload(form, selectedProduct);
      await productService.saveProduct(payload);
      setMessage("Product saved.");
      setSelectedProductId(payload.id);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedProductId) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await productService.deleteProduct(selectedProductId);
      setMessage("Product deleted.");
      setSelectedProductId("");
      setForm(emptyForm);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product.");
    }
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-bg-cream px-4 py-16 text-center font-body text-text-muted">Checking admin access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-cream px-4 py-8 sm:px-6 lg:px-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-[#E8E0D5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-dark">Product Admin</h1>
            <p className="font-body text-sm text-text-muted">Add and update products without redeploying the site.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={startNewProduct} className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2.5 font-body text-sm font-bold text-white hover:bg-primary-dark">
              <Plus size={17} /> New Product
            </button>
            <button onClick={() => signOutAdmin()} className="inline-flex items-center gap-2 rounded-[8px] border border-[#E8E0D5] bg-white px-4 py-2.5 font-body text-sm font-bold text-text-dark hover:border-primary">
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        </div>

        {!isFirebaseConfigured() && (
          <div className="rounded-[10px] border border-[#8B3E16]/25 bg-white p-4 font-body text-sm text-[#8B3E16]">
            Firebase is not configured yet, so the admin panel is read-only. Add `.env.local` values and Firebase rules before saving products.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-[14px] border border-[#E8E0D5]/70 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-heading text-xl font-bold text-text-dark">Products</h2>
            <div className="flex flex-col gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`rounded-[10px] border px-3 py-3 text-left font-body text-sm transition-colors ${
                    selectedProductId === product.id ? "border-primary bg-primary text-white" : "border-[#E8E0D5] bg-bg-cream text-text-dark hover:border-primary/50"
                  }`}
                >
                  <span className="block font-bold">{product.shortName}</span>
                  <span className="text-xs opacity-80">{product.category} · {product.stockStatus}</span>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-[14px] border border-[#E8E0D5]/70 bg-white p-5 shadow-sm lg:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product ID" value={form.id} onChange={(value) => updateForm("id", slugify(value))} placeholder="dried-mango-slices" />
              <Field label="Category" value={form.category} onChange={(value) => updateForm("category", value)} placeholder="Fruits" />
              <Field label="Product Name" value={form.name} onChange={(value) => updateForm("name", value)} />
              <Field label="Short Name" value={form.shortName} onChange={(value) => updateForm("shortName", value)} />
              <Field label="Title" value={form.title} onChange={(value) => updateForm("title", value)} className="sm:col-span-2" />
              <Field label="Brand" value={form.brand} onChange={(value) => updateForm("brand", value)} />
              <Field label="Weight" value={form.weight} onChange={(value) => updateForm("weight", value)} />
              <Field label="Price" type="number" value={form.price} onChange={(value) => updateForm("price", value)} />
              <Field label="MRP" type="number" value={form.mrp} onChange={(value) => updateForm("mrp", value)} />
              <Field label="Unit Price" value={form.unitPrice} onChange={(value) => updateForm("unitPrice", value)} placeholder="₹124.50 / 100 g" />
              <Field label="Stock Status" value={form.stockStatus} onChange={(value) => updateForm("stockStatus", value)} />
              <Field label="Sort Order" type="number" value={form.sortOrder} onChange={(value) => updateForm("sortOrder", value)} />
              <Field label="Ingredients" value={form.ingredients} onChange={(value) => updateForm("ingredients", value)} className="sm:col-span-2" />
              <TextArea label="Description" value={form.description} onChange={(value) => updateForm("description", value)} className="sm:col-span-2" />
              <TextArea label="Image URLs" value={form.imagesText} onChange={(value) => updateForm("imagesText", value)} className="sm:col-span-2" />
              <Field label="Hero Image URL" value={form.heroImage} onChange={(value) => updateForm("heroImage", value)} className="sm:col-span-2" />
              <TextArea label="Highlights" value={form.highlightsText} onChange={(value) => updateForm("highlightsText", value)} />
              <TextArea label="Features" value={form.featuresText} onChange={(value) => updateForm("featuresText", value)} />
              <TextArea label="Usage" value={form.usageText} onChange={(value) => updateForm("usageText", value)} />
              <TextArea label="Nutrition" value={form.nutritionText} onChange={(value) => updateForm("nutritionText", value)} placeholder="Calories | 380g | 10%" />
              <TextArea label="Variants JSON" value={form.variantsText} onChange={(value) => updateForm("variantsText", value)} className="sm:col-span-2" />
              <TextArea label="Storage" value={form.storage} onChange={(value) => updateForm("storage", value)} />
              <TextArea label="Legal Disclaimer" value={form.legalDisclaimer} onChange={(value) => updateForm("legalDisclaimer", value)} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 font-body text-sm font-bold text-text-dark">
                <input type="checkbox" checked={form.isOutOfStock} onChange={(event) => updateForm("isOutOfStock", event.target.checked)} />
                Out of stock
              </label>
              <label className="flex items-center gap-2 font-body text-sm font-bold text-text-dark">
                <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} />
                Active on site
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#E8E0D5] bg-bg-cream px-4 py-2.5 font-body text-sm font-bold text-text-dark hover:border-primary">
                <ImagePlus size={17} />
                {isUploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading || !isFirebaseConfigured()} />
              </label>
            </div>

            {(message || error) && (
              <p className={`mt-4 font-body text-sm ${error ? "text-[#8B3E16]" : "text-primary"}`}>{error || message}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving || !isFirebaseConfigured()}
                className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-5 py-3 font-body font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-[#D8CEC2] disabled:text-text-muted"
              >
                <Save size={18} /> {isSaving ? "Saving..." : "Save Product"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!selectedProductId || !isFirebaseConfigured()}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#8B3E16]/30 bg-white px-5 py-3 font-body font-bold text-[#8B3E16] hover:bg-[#8B3E16]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 font-body text-sm font-bold text-text-dark ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[10px] border border-[#E8E0D5] bg-bg-cream px-4 py-3 font-body font-normal outline-none focus:border-primary"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 font-body text-sm font-bold text-text-dark ${className}`}>
      {label}
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="rounded-[10px] border border-[#E8E0D5] bg-bg-cream px-4 py-3 font-body font-normal outline-none focus:border-primary"
      />
    </label>
  );
}
