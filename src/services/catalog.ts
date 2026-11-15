import { supabase } from '../lib/supabase';
import { PRODUCTS, CHIKOO_PRODUCT } from '../app/data/products';

export interface CatalogVariant {
  id: string;
  label: string;
  sku: string | null;
  price: number;
  price_paise: number;
  mrp: number;
  mrp_paise: number;
  weight: string;
  weight_grams: number;
  stock_qty: number;
  isOutOfStock: boolean;
  stockStatus: string;
  is_default: boolean;
  unitPrice: string;
}

export interface CatalogProduct {
  id: string; // slug for backwards compatibility (e.g. 'dried-chickoo-slices')
  dbId: string;
  name: string;
  shortName: string;
  tagline: string;
  title: string;
  category: string;
  categorySlug: string;
  description: string;
  heroImage: string;
  images: string[];
  price: number;
  mrp: number;
  unitPrice: string;
  discount: string;
  stockStatus: string;
  isOutOfStock: boolean;
  variants: CatalogVariant[];
  benefits: string[];
  features: string[];
  highlights: string[];
  nutrition: [string, string, string][];
  details: Record<string, string>;
  contact: {
    address: string;
    phone: string;
    email: string;
    fssai: string;
  };
  storage?: string;
  legalDisclaimer?: string;
}

function transformDbProduct(item: any): CatalogProduct {
  const variants: CatalogVariant[] = (item.product_variants || []).map((v: any) => {
    const priceRupees = v.price_paise / 100;
    const mrpRupees = v.mrp_paise / 100;
    const isOut = v.stock_qty <= 0;
    return {
      id: v.label,
      label: v.label,
      sku: v.sku,
      price: priceRupees,
      price_paise: v.price_paise,
      mrp: mrpRupees,
      mrp_paise: v.mrp_paise,
      weight: v.label,
      weight_grams: v.weight_grams,
      stock_qty: v.stock_qty,
      isOutOfStock: isOut,
      stockStatus: isOut ? 'Out of Stock' : 'In Stock',
      is_default: v.is_default,
      unitPrice: `₹${(priceRupees / (v.weight_grams / 100)).toFixed(2)} / 100 g`,
    };
  });

  const defaultVariant = variants.find((v) => v.is_default) || variants[0] || {
    price: 249,
    mrp: 399,
    isOutOfStock: false,
    stockStatus: 'In Stock',
    unitPrice: '₹124.50 / 100 g',
  };

  const isAllOut = variants.length > 0 ? variants.every((v) => v.isOutOfStock) : false;
  const discountPercent =
    defaultVariant.mrp > defaultVariant.price
      ? `${Math.round(((defaultVariant.mrp - defaultVariant.price) / defaultVariant.mrp) * 100)}%`
      : '';

  return {
    id: item.slug,
    dbId: item.id,
    name: item.name,
    shortName: item.short_name || item.name,
    tagline: item.tagline || '',
    title: `${item.name} | ${item.tagline || ''}`,
    category: item.categories?.name === 'Wellness Powders' ? 'Powders' : 'Fruits',
    categorySlug: item.categories?.slug || 'dried-fruits',
    description: item.description || '',
    heroImage: item.hero_image,
    images: item.image_urls && item.image_urls.length > 0 ? item.image_urls : [item.hero_image],
    price: defaultVariant.price,
    mrp: defaultVariant.mrp,
    unitPrice: defaultVariant.unitPrice,
    discount: discountPercent,
    stockStatus: isAllOut ? 'Out of Stock' : 'In Stock',
    isOutOfStock: isAllOut,
    variants,
    benefits: Array.isArray(item.benefits) ? item.benefits : [],
    features: Array.isArray(item.benefits) ? item.benefits : [],
    highlights: Array.isArray(item.benefits) ? item.benefits : [],
    nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
    details: item.details || {},
    contact: {
      address: 'Surat, Gujarat, Pin code: 395006',
      phone: '+91 97142 80780',
      email: 'orvellaorganics@gmail.com',
      fssai: item.details?.fssai || '20726031003417',
    },
    storage:
      'Store in a cool and dry place away from direct sunlight. Reseal properly once opened.',
    legalDisclaimer:
      'Actual product packaging and materials may contain more and different information than what is shown on our app or website. Always read labels, warnings, and directions before using or consuming a product.',
  };
}

export async function fetchProducts(): Promise<CatalogProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), product_variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Falling back to local static products:', error?.message);
      return PRODUCTS as any;
    }

    return data.map(transformDbProduct);
  } catch (err) {
    console.error('Error fetching products from Supabase:', err);
    return PRODUCTS as any;
  }
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), product_variants(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.warn(`Product slug ${slug} not found in Supabase, checking local fallback:`, error?.message);
      const local = PRODUCTS.find((p) => p.id === slug) || (slug === 'chikoo' ? CHIKOO_PRODUCT : null);
      return local as any;
    }

    return transformDbProduct(data);
  } catch (err) {
    console.error(`Error fetching product ${slug}:`, err);
    const local = PRODUCTS.find((p) => p.id === slug) || (slug === 'chikoo' ? CHIKOO_PRODUCT : null);
    return local as any;
  }
}
