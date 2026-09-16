import { isFirebaseConfigured } from "../firebase/firebaseConfig";
import { localProductService } from "./localProductService";
import type { ProductService } from "./productTypes";

async function getActiveProductService(): Promise<ProductService> {
  if (!isFirebaseConfigured()) {
    return localProductService;
  }

  const { firebaseProductService } = await import("./firebaseProductService");
  return firebaseProductService;
}

export const productService: ProductService = {
  async getProducts() {
    const service = await getActiveProductService();

    if (service === localProductService) {
      return service.getProducts();
    }

    try {
      const [firebaseProducts, localProducts] = await Promise.all([
        service.getProducts(),
        localProductService.getProducts(),
      ]);
      const productsById = new Map(localProducts.map((product) => [product.id, product]));

      firebaseProducts.forEach((product) => {
        productsById.set(product.id, product);
      });

      return Array.from(productsById.values()).filter((product) => product.isActive !== false);
    } catch (error) {
      console.warn("Falling back to local products because Firebase products could not be loaded.", error);
      return localProductService.getProducts();
    }
  },

  async getProduct(id) {
    const service = await getActiveProductService();

    if (service === localProductService) {
      return service.getProduct(id);
    }

    try {
      return (await service.getProduct(id)) || localProductService.getProduct(id);
    } catch (error) {
      console.warn("Falling back to local product because Firebase product could not be loaded.", error);
      return localProductService.getProduct(id);
    }
  },

  async saveProduct(product) {
    return (await getActiveProductService()).saveProduct(product);
  },

  async deleteProduct(id) {
    return (await getActiveProductService()).deleteProduct(id);
  },

  async uploadProductImage(file, productId) {
    return (await getActiveProductService()).uploadProductImage(file, productId);
  },
};

export { getDefaultLocalProduct } from "./localProductService";
export { sortProductsByStockStatus } from "./productUtils";
export type { Product, ProductInput, ProductService, ProductVariant } from "./productTypes";
