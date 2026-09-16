import { PRODUCTS } from "../../data/products";
import { sortProductsByStockStatus } from "./productUtils";
import type { Product, ProductInput, ProductService } from "./productTypes";

const localProducts = PRODUCTS as Product[];

export const localProductService: ProductService = {
  async getProducts() {
    return sortProductsByStockStatus(localProducts.filter((product) => product.isActive !== false));
  },

  async getProduct(id: string) {
    return localProducts.find((product) => product.id === id && product.isActive !== false);
  },

  async saveProduct() {
    throw new Error("Local product data is read-only. Configure Firebase to manage products from the admin panel.");
  },

  async deleteProduct() {
    throw new Error("Local product data is read-only. Configure Firebase to delete products from the admin panel.");
  },

  async uploadProductImage() {
    throw new Error("Local product data cannot upload images. Configure Firebase Storage first.");
  },
};

export async function getDefaultLocalProduct() {
  return localProducts[0];
}
