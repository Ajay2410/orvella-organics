export function sortProductsByStockStatus<T extends { isOutOfStock?: boolean }>(products: T[]) {
  return [...products].sort((first, second) => Number(first.isOutOfStock) - Number(second.isOutOfStock));
}
