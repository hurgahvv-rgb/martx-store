export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  image: string;
  galleryImages?: string[];
  rating: number;
  description: string;
  subtitle?: string | null;
  features: string[];
  bullets?: string[];
  specs?: string[];
  shippingText?: string | null;
  returnsText?: string | null;
  warrantyText?: string | null;
  helpText?: string | null;
  storyTitle?: string | null;
  storyDescription?: string | null;
  storyImage?: string | null;
  stories?: ProductStoryBlock[];
  reviews?: ProductReview[];
  stock?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  price?: number | null;
  stock: number;
  image?: string | null;
  isActive?: boolean;
};

export type ProductReview = {
  author: string;
  rating: number;
  title: string;
  body: string;
  image?: string;
};

export type ProductStoryBlock = {
  title: string;
  description: string;
  image: string;
};

export type ProductDetail = {
  slug: string;
  subtitle: string;
  gallery: string[];
  variants: string[];
  bullets: string[];
  specs: string[];
  shipping: string;
  returns: string;
  warranty: string;
  help: string;
  story: ProductStoryBlock[];
  reviews: ProductReview[];
};
