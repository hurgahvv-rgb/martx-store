export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  image: string;
  rating: number;
  description: string;
  features: string[];
  isFeatured?: boolean;
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
