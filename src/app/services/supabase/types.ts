export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  variant_id: string;
  label: string;
  weight: string;
  pack_label?: string | null;
  price: number;
  unit_price?: string | null;
  stock_status: string;
  is_out_of_stock: boolean;
  display_order?: number;
}

export interface DbProduct {
  id: string;
  name: string;
  short_name: string;
  category: string;
  description: string;
  price?: number | null;
  mrp?: number | null;
  discount?: string | null;
  stock_status: string;
  is_out_of_stock: boolean;
  dimensions?: string | null;
  item_weight?: string | null;
  manufacturer?: string | null;
  part_number?: string | null;
  country_of_origin?: string | null;
  item_form?: string | null;
  package_quantity?: string | null;
  packer?: string | null;
  ingredients?: string | null;
  highlights?: string[];
  features?: string[];
  usage?: string[];
  nutrition?: [string, string, string][];
  hero_image?: string | null;
  created_at?: string;
  updated_at?: string;
  variants?: DbProductVariant[];
}

export interface ContactInquiry {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  created_at?: string;
  items?: OrderItem[];
}
