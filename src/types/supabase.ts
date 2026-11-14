export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'customer' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_name: string | null;
          tagline: string | null;
          description: string | null;
          hero_image: string | null;
          image_urls: string[];
          hsn_code: string | null;
          gst_rate: number;
          rating_avg: number;
          rating_count: number;
          is_active: boolean;
          is_featured: boolean;
          benefits: Json;
          ingredients: Json;
          nutrition: Json;
          details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_name?: string | null;
          tagline?: string | null;
          description?: string | null;
          hero_image?: string | null;
          image_urls?: string[];
          hsn_code?: string | null;
          gst_rate?: number;
          rating_avg?: number;
          rating_count?: number;
          is_active?: boolean;
          is_featured?: boolean;
          benefits?: Json;
          ingredients?: Json;
          nutrition?: Json;
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_name?: string | null;
          tagline?: string | null;
          description?: string | null;
          hero_image?: string | null;
          image_urls?: string[];
          hsn_code?: string | null;
          gst_rate?: number;
          rating_avg?: number;
          rating_count?: number;
          is_active?: boolean;
          is_featured?: boolean;
          benefits?: Json;
          ingredients?: Json;
          nutrition?: Json;
          details?: Json;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          sku: string | null;
          price_paise: number;
          mrp_paise: number;
          stock_qty: number;
          weight_grams: number;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          sku?: string | null;
          price_paise: number;
          mrp_paise: number;
          stock_qty?: number;
          weight_grams?: number;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          label?: string;
          sku?: string | null;
          price_paise?: number;
          mrp_paise?: number;
          stock_qty?: number;
          weight_grams?: number;
          is_active?: boolean;
          is_default?: boolean;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          variant_id: string;
          qty: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          variant_id: string;
          qty: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          qty?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_no: string;
          user_id: string | null;
          status: OrderStatus;
          payment_status: PaymentStatus;
          subtotal_paise: number;
          shipping_paise: number;
          discount_paise: number;
          total_paise: number;
          address_snapshot: Json;
          razorpay_order_id: string | null;
          courier: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_no: string;
          user_id?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal_paise: number;
          shipping_paise?: number;
          discount_paise?: number;
          total_paise: number;
          address_snapshot: Json;
          razorpay_order_id?: string | null;
          courier?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          shipping_paise?: number;
          discount_paise?: number;
          total_paise?: number;
          courier?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string | null;
          product_name: string;
          variant_label: string;
          unit_price_paise: number;
          qty: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id?: string | null;
          product_name: string;
          variant_label: string;
          unit_price_paise: number;
          qty: number;
        };
        Update: {
          qty?: number;
          unit_price_paise?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          razorpay_payment_id: string | null;
          amount_paise: number;
          status: string;
          method: string | null;
          raw_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          razorpay_payment_id?: string | null;
          amount_paise: number;
          status: string;
          method?: string | null;
          raw_payload?: Json;
          created_at?: string;
        };
        Update: {
          status?: string;
          method?: string | null;
          raw_payload?: Json;
        };
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          note: string | null;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          note?: string | null;
          actor_id?: string | null;
          created_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: 'percent' | 'flat';
          value: number;
          min_order_paise: number;
          expires_at: string | null;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: 'percent' | 'flat';
          value: number;
          min_order_paise?: number;
          expires_at?: string | null;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          is_active?: boolean;
          used_count?: number;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          value?: Json;
          updated_at?: string;
        };
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          details?: Json;
          created_at?: string;
        };
      };
      shipping_rates: {
        Row: {
          id: string;
          zone_name: string;
          states: string[];
          min_weight_g: number;
          max_weight_g: number;
          charge_paise: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          zone_name: string;
          states: string[];
          min_weight_g?: number;
          max_weight_g: number;
          charge_paise: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          charge_paise?: number;
          is_active?: boolean;
        };
      };
      invoice_counters: {
        Row: {
          financial_year: string;
          last_number: number;
        };
        Insert: {
          financial_year: string;
          last_number?: number;
        };
        Update: {
          last_number?: number;
        };
      };
      invoices: {
        Row: {
          id: string;
          order_id: string;
          invoice_no: string;
          financial_year: string;
          issued_at: string;
          taxable_paise: number;
          cgst_paise: number;
          sgst_paise: number;
          igst_paise: number;
          total_paise: number;
          pdf_path: string | null;
          details: Json;
        };
        Insert: {
          id?: string;
          order_id: string;
          invoice_no: string;
          financial_year: string;
          issued_at?: string;
          taxable_paise: number;
          cgst_paise?: number;
          sgst_paise?: number;
          igst_paise?: number;
          total_paise: number;
          pdf_path?: string | null;
          details?: Json;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_item_id: string | null;
          rating: number;
          title: string | null;
          body: string;
          image_paths: string[];
          status: ReviewStatus;
          admin_reply: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_item_id?: string | null;
          rating: number;
          title?: string | null;
          body: string;
          image_paths?: string[];
          status?: ReviewStatus;
          admin_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: ReviewStatus;
          admin_reply?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
