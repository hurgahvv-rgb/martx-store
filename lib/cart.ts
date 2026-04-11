import { Product } from "@/lib/types";

export const CART_STORAGE_KEY = "martx-cart";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  variant: string;
  quantity: number;
};

export function createCartItem(product: Product, variant: string, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    currency: product.currency,
    image: product.image,
    variant,
    quantity
  };
}

export function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("martx-cart-updated"));
}

export function getCartQuantity(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function addCartItem(item: CartItem) {
  const current = readCart();
  const existingIndex = current.findIndex(
    (cartItem) => cartItem.productId === item.productId && cartItem.variant === item.variant
  );

  if (existingIndex >= 0) {
    current[existingIndex] = {
      ...current[existingIndex],
      quantity: current[existingIndex].quantity + item.quantity
    };
    writeCart(current);
    return;
  }

  writeCart([...current, item]);
}
