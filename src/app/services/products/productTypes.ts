export type ProductVariant = {
  id: string;
  label: string;
  weight: string;
  packLabel?: string;
  price: number;
  unitPrice?: string;
  stockStatus: string;
  isOutOfStock: boolean;
};

export type ProductContact = {
  address: string;
  phone: string;
  email: string;
  fssai: string;
};

export type Product = {
  id: string;
  name: string;
  shortName: string;
  title: string;
  category: string;
  flavour?: string;
  brand: string;
  weight: string;
  itemWeight?: string;
  netQuantity?: string;
  upc?: string;
  asin?: string;
  partNumber?: string;
  dimensions?: string;
  countryOfOrigin?: string;
  genericName?: string;
  manufacturer?: string;
  packer?: string;
  importer?: string;
  itemForm?: string;
  packageQuantity?: string;
  ingredients: string;
  stockStatus: string;
  isOutOfStock: boolean;
  price?: number;
  mrp?: number;
  unitPrice?: string;
  discount?: string;
  variants?: ProductVariant[];
  images: string[];
  heroImage: string;
  description: string;
  highlights: string[];
  features: string[];
  usage?: string[];
  nutrition: string[][];
  storage: string;
  legalDisclaimer: string;
  contact: ProductContact;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = Omit<Product, "createdAt" | "updatedAt">;

export type ProductService = {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  saveProduct(product: ProductInput): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  uploadProductImage(file: File, productId: string): Promise<string>;
};
