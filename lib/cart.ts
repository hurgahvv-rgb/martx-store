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
  variantId?: string;
  variant: string;
  quantity: number;
};

export function createCartItem(product: Product, variant: string, quantity: number, variantId?: string): CartItem {
  const selectedVariant = product.variants?.find((item) => item.id === variantId);

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: selectedVariant?.price ?? product.price,
    currency: product.currency,
    image: selectedVariant?.image ?? product.image,
    variantId,
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
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("martx-cart-updated"));
  } catch {
    // Cart writes should not break the product page controls.
  }
}

export function getCartQuantity(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.quantity) ? item.quantity : 0), 0);
}

export function addCartItem(item: CartItem) {
  const current = readCart();
  const existingIndex = current.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId &&
      (cartItem.variantId ? cartItem.variantId === item.variantId : cartItem.variant === item.variant)
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
