import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { productService, type Product } from '../../services/products/productService';
import { 
  Package, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  ExternalLink, 
  Upload, 
  X, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMrp, setEditMrp] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editIngredients, setEditIngredients] = useState<string>('');
  const [editVariants, setEditVariants] = useState<{ id: string; dbId?: string; label: string; price: number; isOutOfStock: boolean }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const prods = await productService.getProducts();
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleProductStock = async (product: Product) => {
    const nextStatus = !product.isOutOfStock;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              isOutOfStock: nextStatus,
              stockStatus: nextStatus ? 'Out of Stock' : 'In Stock',
              variants: p.variants.map((v) => ({
                ...v,
                isOutOfStock: nextStatus,
                stockStatus: nextStatus ? 'Out of Stock' : 'In Stock',
              })),
            }
          : p
      )
    );

    const success = await productService.toggleProductStock(product.id, nextStatus);
    if (success) {
      setStatusMessage({
        type: 'success',
        text: `Updated "${product.shortName}" to ${nextStatus ? 'Out of Stock' : 'In Stock'}`,
      });
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to update stock in database. Reverting...' });
      loadProducts();
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleVariantStock = async (product: Product, variantDbId?: string, currentOutOfStock?: boolean) => {
    if (!variantDbId) return;
    const nextStatus = !currentOutOfStock;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              variants: p.variants.map((v) =>
                (v as any).dbId === variantDbId
                  ? { ...v, isOutOfStock: nextStatus, stockStatus: nextStatus ? 'Out of Stock' : 'In Stock' }
                  : v
              ),
            }
          : p
      )
    );

    const success = await productService.toggleVariantStock(variantDbId, nextStatus);
    if (!success) {
      setStatusMessage({ type: 'error', text: 'Failed to update variant stock.' });
      loadProducts();
    }
  };

  const handleSeedCatalog = async () => {
    if (!confirm('This will seed the 5 standard products and variants from code into Supabase. Proceed?')) {
      return;
    }
    setSeeding(true);
    setStatusMessage(null);
    try {
      const res = await productService.seedInitialCatalog();
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error.message || 'Failed to seed catalog' });
      } else {
        setStatusMessage({ type: 'success', text: `Successfully synced ${res.count} products into Supabase!` });
        await loadProducts();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error seeding database' });
    } finally {
      setSeeding(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditPrice(product.price || 0);
    setEditMrp((product as any).mrp || 0);
    setEditDiscount((product as any).discount || '');
    setEditDescription(product.description || '');
    setEditIngredients(product.ingredients || '');
    setEditVariants(
      product.variants.map((v) => ({
        id: v.id,
        dbId: (v as any).dbId,
        label: v.label,
        price: v.price,
        isOutOfStock: v.isOutOfStock,
      }))
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingImage(true);
    try {
      const publicUrl = await productService.uploadProductImage(file);
      if (publicUrl) {
        setEditingProduct((prev) => prev ? { ...prev, heroImage: publicUrl } : null);
        setStatusMessage({ type: 'success', text: 'New image uploaded to Supabase Storage!' });
      } else {
        setStatusMessage({ type: 'error', text: 'Image upload failed. Ensure storage bucket is public.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Upload error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);

    try {
      // 1. Update product base info
      await productService.updateProduct(editingProduct.id, {
        price: editPrice,
        mrp: editMrp,
        discount: editDiscount,
        description: editDescription,
        ingredients: editIngredients,
        hero_image: typeof editingProduct.heroImage === 'string' ? editingProduct.heroImage : undefined,
      });

      // 2. Update variant prices
      for (const v of editVariants) {
        if (v.dbId) {
          await productService.updateVariantPrice(v.dbId, v.price);
        }
      }

      setStatusMessage({ type: 'success', text: `Saved changes to "${editingProduct.shortName}"!` });
      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save product' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
            >
              <ArrowLeft size={14} /> Back to Admin Overview
            </Link>
            <h1 className="text-3xl font-heading font-bold text-text-dark flex items-center gap-3">
              <Package size={28} className="text-primary" />
              Product Catalog Management
            </h1>
            <p className="text-sm text-text-muted mt-1 font-body">
              Toggle stock availability, adjust pricing, manage variants, and update product images.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary bg-white hover:bg-primary/5 text-sm font-semibold transition-colors disabled:opacity-50"
              title="Populate/Sync Supabase tables with initial products"
            >
              <Sparkles size={16} />
              <span>{seeding ? 'Syncing...' : 'Sync Catalog to Supabase'}</span>
            </button>

            <button
              onClick={loadProducts}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[#E8E0D5] bg-white text-text-dark hover:bg-bg-cream transition-colors"
              title="Refresh list"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-center gap-3 border text-sm animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Products List */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted">
              <RefreshCw size={32} className="animate-spin text-primary mb-3" />
              <p className="text-sm font-medium">Loading products from Supabase...</p>
            </div>
          ) : (
            products.map((product) => {
              const isOut = product.isOutOfStock;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 shadow-sm ${
                    isOut ? 'border-amber-200/80 bg-amber-50/20' : 'border-[#E8E0D5] hover:border-primary/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-bg-cream shrink-0 border border-[#E8E0D5]/70">
                        <img
                          src={product.heroImage}
                          alt={product.shortName}
                          className="w-full h-full object-contain"
                        />
                        <span
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full text-white ${
                            isOut ? 'bg-[#8B3E16]' : 'bg-primary'
                          }`}
                        >
                          {product.stockStatus}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {product.category}
                          </span>
                          <span className="text-xs text-text-muted">ID: {product.id}</span>
                        </div>
                        <h2 className="text-lg font-heading font-bold text-text-dark mt-1 truncate">
                          {product.name}
                        </h2>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-xl font-bold font-body text-primary leading-none">
                            ₹{product.price}
                          </span>
                          {(product as any).mrp && (
                            <span className="text-xs text-text-muted line-through font-body">
                              M.R.P. ₹{(product as any).mrp}
                            </span>
                          )}
                          {(product as any).discount && (
                            <span className="text-xs font-bold text-[#8B3E16]">
                              {(product as any).discount} off
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Variants List & Stock */}
                    <div className="flex flex-wrap items-center gap-2">
                      {product.variants.map((v) => {
                        const variantDbId = (v as any).dbId;
                        return (
                          <div
                            key={v.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                              v.isOutOfStock
                                ? 'border-amber-300 bg-amber-50 text-amber-900'
                                : 'border-primary/20 bg-primary/5 text-primary'
                            }`}
                          >
                            <span className="font-bold">{v.label}:</span>
                            <span>₹{v.price}</span>
                            {variantDbId && (
                              <button
                                onClick={() => handleToggleVariantStock(product, variantDbId, v.isOutOfStock)}
                                className="ml-1 text-[10px] font-semibold underline hover:opacity-80"
                                title="Toggle variant stock status"
                              >
                                {v.isOutOfStock ? 'Set In Stock' : 'Set Out'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Controls & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E8E0D5]/60">
                      {/* Main Stock Toggle Button */}
                      <button
                        onClick={() => handleToggleProductStock(product)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isOut
                            ? 'bg-[#8B3E16] text-white hover:bg-[#723211]'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                        title="Click to toggle product availability"
                      >
                        {isOut ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                        <span>{isOut ? 'Mark In Stock' : 'Mark Out of Stock'}</span>
                      </button>

                      {/* Edit Modal Button */}
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E0D5] bg-white text-text-dark text-xs font-medium hover:bg-bg-cream transition-colors"
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>

                      {/* Storefront Link */}
                      <Link
                        to={`/products/${product.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-[#E8E0D5] bg-white text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
                        title="View on live website"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E0D5] my-8 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
                <h3 className="text-xl font-heading font-bold text-text-dark">
                  Edit "{editingProduct.shortName}"
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-dark hover:bg-bg-cream"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 font-body">
                    Hero Image
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={editingProduct.heroImage}
                      alt={editingProduct.shortName}
                      className="w-16 h-16 rounded-xl object-contain bg-bg-cream border border-[#E8E0D5]"
                    />
                    <div>
                      <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E8E0D5] rounded-xl text-xs font-medium text-text-dark bg-white hover:bg-bg-cream cursor-pointer transition-colors">
                        <Upload size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload New Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                      <p className="text-[11px] text-text-muted mt-1 font-body">
                        Uploads directly to Supabase Storage (<code className="text-primary font-mono">product-media</code>)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-dark mb-1 font-body">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-bg-cream text-text-dark font-body text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark mb-1 font-body">
                      M.R.P. (₹)
                    </label>
                    <input
                      type="number"
                      value={editMrp}
                      onChange={(e) => setEditMrp(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-bg-cream text-text-dark font-body text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark mb-1 font-body">
                      Discount Badge (e.g. 29%)
                    </label>
                    <input
                      type="text"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(e.target.value)}
                      placeholder="29%"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-bg-cream text-text-dark font-body text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Variant Prices */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 font-body">
                    Variant Prices
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {editVariants.map((v, idx) => (
                      <div key={v.id} className="p-3 bg-bg-cream rounded-xl border border-[#E8E0D5]/70">
                        <span className="text-xs font-bold text-text-dark">{v.label}</span>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs text-text-muted">₹</span>
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              setEditVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, price: newPrice } : item))
                              );
                            }}
                            className="w-full px-2 py-1 rounded-lg border border-[#E8E0D5] bg-white text-xs font-body font-bold text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1 font-body">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-bg-cream text-text-dark font-body text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1 font-body">
                    Ingredients
                  </label>
                  <input
                    type="text"
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-bg-cream text-text-dark font-body text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-[#E8E0D5] flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8E0D5] text-text-dark text-sm font-medium hover:bg-bg-cream"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
