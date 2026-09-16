import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseServices } from "../firebase/firebaseConfig";
import type { Product, ProductInput, ProductService } from "./productTypes";

const PRODUCTS_COLLECTION = "products";

function normalizeProduct(id: string, data: Record<string, unknown>): Product {
  return {
    ...(data as Product),
    id,
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
    features: Array.isArray(data.features) ? (data.features as string[]) : [],
    nutrition: Array.isArray(data.nutrition) ? (data.nutrition as string[][]) : [],
  };
}

export const firebaseProductService: ProductService = {
  async getProducts() {
    const { db } = await getFirebaseServices();
    const snapshot = await getDocs(query(collection(db, PRODUCTS_COLLECTION), orderBy("sortOrder", "asc")));

    return snapshot.docs
      .map((item) => normalizeProduct(item.id, item.data()))
      .filter((product) => product.isActive !== false);
  },

  async getProduct(id: string) {
    const { db } = await getFirebaseServices();
    const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, id));

    if (!snapshot.exists()) {
      return undefined;
    }

    const product = normalizeProduct(snapshot.id, snapshot.data());
    return product.isActive === false ? undefined : product;
  },

  async saveProduct(product: ProductInput) {
    const { db } = await getFirebaseServices();
    await setDoc(
      doc(db, PRODUCTS_COLLECTION, product.id),
      {
        ...product,
        updatedAt: serverTimestamp(),
        createdAt: product.createdAt || serverTimestamp(),
      },
      { merge: true },
    );
  },

  async deleteProduct(id: string) {
    const { db } = await getFirebaseServices();
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  },

  async uploadProductImage(file: File, productId: string) {
    const { storage } = await getFirebaseServices();
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
    const imageRef = ref(storage, `products/${productId}/${Date.now()}-${safeName}`);

    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  },
};
