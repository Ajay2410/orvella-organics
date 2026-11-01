import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';
import { PRODUCTS, type CHIKOO_PRODUCT, type PRODUCT_VARIANTS } from '../../data/products';

export type Product = typeof CHIKOO_PRODUCT;
export type ProductVariant = (typeof PRODUCT_VARIANTS)[0];

export const productService = {
  /**
   * Fetch all products from Supabase.
   * If database has no products yet or connection is inactive, falls back to local data.
   */
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return PRODUCTS;
    }

    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: true });

      if (error || !dbProducts || dbProducts.length === 0) {
        return PRODUCTS;
      }

      // Map Supabase rows to the storefront Product structure
      return dbProducts.map((row) => {
        const localFallback = PRODUCTS.find((p) => p.id === row.id) || PRODUCTS[0];
        const variants = (row.variants && row.variants.length > 0)
          ? row.variants
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((v: any) => ({
                id: v.variant_id,
                dbId: v.id,
                label: v.label,
                weight: v.weight,
                packLabel: v.pack_label || '',
                price: Number(v.price),
                unitPrice: v.unit_price || '',
                stockStatus: v.stock_status,
                isOutOfStock: Boolean(v.is_out_of_stock),
              }))
          : localFallback.variants;

        return {
          ...localFallback,
          id: row.id,
          name: row.name || localFallback.name,
          shortName: row.short_name || localFallback.shortName,
          category: row.category || localFallback.category,
          description: row.description || localFallback.description,
          price: row.price ? Number(row.price) : localFallback.price,
          mrp: row.mrp ? Number(row.mrp) : (localFallback as any).mrp,
          discount: row.discount || (localFallback as any).discount,
          stockStatus: row.stock_status || (row.is_out_of_stock ? 'Out of Stock' : 'In Stock'),
          isOutOfStock: Boolean(row.is_out_of_stock),
          dimensions: row.dimensions || localFallback.dimensions,
          itemWeight: row.item_weight || localFallback.itemWeight,
          manufacturer: row.manufacturer || localFallback.manufacturer,
          partNumber: row.part_number || localFallback.partNumber,
          countryOfOrigin: row.country_of_origin || localFallback.countryOfOrigin,
          ingredients: row.ingredients || localFallback.ingredients,
          highlights: (row.highlights && row.highlights.length > 0) ? row.highlights : localFallback.highlights,
          features: (row.features && row.features.length > 0) ? row.features : localFallback.features,
          usage: (row.usage && row.usage.length > 0) ? row.usage : localFallback.usage,
          nutrition: (row.nutrition && Array.isArray(row.nutrition) && row.nutrition.length > 0) ? row.nutrition : localFallback.nutrition,
          heroImage: row.hero_image || localFallback.heroImage,
          images: row.hero_image ? [row.hero_image, ...localFallback.images.slice(1)] : localFallback.images,
          variants,
        };
      });
    } catch (err) {
      console.warn('Failed to fetch products from Supabase, using local catalog:', err);
      return PRODUCTS;
    }
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id: string): Promise<Product | undefined> {
    const all = await this.getProducts();
    return all.find((p) => p.id === id);
  },

  /**
   * Toggle product stock status
   */
  async toggleProductStock(productId: string, isOutOfStock: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const stockStatus = isOutOfStock ? 'Out of Stock' : 'In Stock';
    const { error } = await supabase
      .from('products')
      .update({
        is_out_of_stock: isOutOfStock,
        stock_status: stockStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product stock:', error);
      return false;
    }

    // Also update all variants for this product
    await supabase
      .from('product_variants')
      .update({
        is_out_of_stock: isOutOfStock,
        stock_status: stockStatus,
      })
      .eq('product_id', productId);

    return true;
  },

  /**
   * Toggle variant stock status
   */
  async toggleVariantStock(variantDbId: string, isOutOfStock: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('product_variants')
      .update({
        is_out_of_stock: isOutOfStock,
        stock_status: isOutOfStock ? 'Out of Stock' : 'In Stock',
      })
      .eq('id', variantDbId);

    return !error;
  },

  /**
   * Update product details
   */
  async updateProduct(id: string, updates: Partial<{
    name: string;
    short_name: string;
    description: string;
    price: number;
    mrp: number;
    discount: string;
    ingredients: string;
    hero_image: string;
  }>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  },

  /**
   * Update a specific variant's price
   */
  async updateVariantPrice(variantDbId: string, price: number, unitPrice?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const payload: any = { price };
    if (unitPrice) payload.unit_price = unitPrice;

    const { error } = await supabase
      .from('product_variants')
      .update(payload)
      .eq('id', variantDbId);

    return !error;
  },

  /**
   * Upload an image to Supabase Storage 'product-media' bucket
   */
  async uploadProductImage(file: File): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-media')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Image upload failed:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Seed initial 5 products from local products.ts into Supabase
   */
  async seedInitialCatalog(): Promise<{ count: number; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { count: 0, error: new Error('Supabase is not configured') };
    }

    try {
      let insertedCount = 0;

      for (const prod of PRODUCTS) {
        // 1. Insert product
        const { error: prodError } = await supabase.from('products').upsert(
          {
            id: prod.id,
            name: prod.name,
            short_name: prod.shortName,
            category: prod.category,
            description: prod.description,
            price: prod.price,
            mrp: (prod as any).mrp || null,
            discount: (prod as any).discount || null,
            stock_status: prod.stockStatus,
            is_out_of_stock: prod.isOutOfStock,
            dimensions: prod.dimensions,
            item_weight: prod.itemWeight,
            manufacturer: prod.manufacturer,
            part_number: prod.partNumber,
            country_of_origin: prod.countryOfOrigin,
            item_form: (prod as any).itemForm || 'Whole Dried Fruit / Powder',
            package_quantity: (prod as any).packageQuantity || '1 Pack',
            packer: prod.packer,
            ingredients: prod.ingredients,
            highlights: prod.highlights,
            features: prod.features,
            usage: (prod as any).usage || [],
            nutrition: prod.nutrition,
          },
          { onConflict: 'id' }
        );

        if (prodError) throw prodError;

        // 2. Insert variants
        if (prod.variants && prod.variants.length > 0) {
          for (let i = 0; i < prod.variants.length; i++) {
            const v = prod.variants[i];
            await supabase.from('product_variants').upsert(
              {
                product_id: prod.id,
                variant_id: v.id,
                label: v.label,
                weight: v.weight,
                pack_label: v.packLabel,
                price: v.price,
                unit_price: v.unitPrice,
                stock_status: v.stockStatus,
                is_out_of_stock: v.isOutOfStock,
                display_order: i,
              },
              { onConflict: 'product_id, variant_id' }
            );
          }
        }

        insertedCount++;
      }

      return { count: insertedCount, error: null };
    } catch (err: any) {
      console.error('Seeding catalog failed:', err);
      return { count: 0, error: err };
    }
  },
};
