import { products as fallbackProducts } from "@/lib/data";
import { productDetails } from "@/lib/product-details";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import type { Product, ProductDetail } from "@/lib/types";

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  subtitle: string | null;
  bullets: string[];
  specs: string[];
  shippingText: string | null;
  returnsText: string | null;
  warrantyText: string | null;
  helpText: string | null;
  storyTitle: string | null;
  storyDescription: string | null;
  storyImage: string | null;
  stories?: {
    title: string;
    description: string;
    image: string;
  }[];
  price: number;
  compareAtPrice: number | null;
  currency: string;
  image: string;
  galleryImages: string[];
  rating: number;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  variants?: {
    id: string;
    color: string | null;
    size: string | null;
    sku: string | null;
    price: number | null;
    stock: number;
    image: string | null;
    isActive: boolean;
  }[];
};

function mapProduct(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    currency: product.currency,
    image: product.image,
    galleryImages: product.galleryImages,
    rating: product.rating,
    description: product.description,
    subtitle: product.subtitle,
    features: [],
    bullets: product.bullets,
    specs: product.specs,
    shippingText: product.shippingText,
    returnsText: product.returnsText,
    warrantyText: product.warrantyText,
    helpText: product.helpText,
    storyTitle: product.storyTitle,
    storyDescription: product.storyDescription,
    storyImage: product.storyImage,
    stories: product.stories ?? [],
    stock: product.stock,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    variants: product.variants ?? []
  };
}

export async function getStoreProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      include: {
        variants: {
          where: { isActive: true },
          orderBy: [{ color: "asc" }, { size: "asc" }]
        },
        stories: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (products.length > 0) {
      return products.map(mapProduct);
    }
  } catch {
    // Local setup can run before DATABASE_URL is ready; keep the storefront usable.
  }

  return fallbackProducts;
}

export async function getFeaturedStoreProducts() {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 4
    });

    if (featuredProducts.length > 0) {
      return featuredProducts.map(mapProduct);
    }
  } catch {
    // Local setup can run before DATABASE_URL is ready; keep the storefront usable.
  }

  const featured = fallbackProducts.filter((product) => product.isFeatured);
  return featured.length > 0 ? featured.slice(0, 4) : fallbackProducts.slice(0, 4);
}

export async function getStoreProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: [{ color: "asc" }, { size: "asc" }]
        },
        stories: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (product) {
      return mapProduct(product);
    }
  } catch {
    // Local setup can run before DATABASE_URL is ready; keep the storefront usable.
  }

  return fallbackProducts.find((product) => product.slug === slug) ?? null;
}

export async function getProductDetail(product: Product): Promise<ProductDetail> {
  const savedDetail = productDetails[product.slug];
  const settings = await getStoreSettings();
  const gallery = [product.image, ...(product.galleryImages ?? [])].filter(Boolean);
  const story = product.stories?.length
    ? product.stories
    : product.storyTitle || product.storyDescription || product.storyImage
      ? [
          {
            title: product.storyTitle || "Product Story",
            description: product.storyDescription || "",
            image: product.storyImage || product.image
          }
        ]
      : savedDetail?.story ?? [];

  return {
    slug: product.slug,
    subtitle: product.subtitle || savedDetail?.subtitle || product.description,
    gallery: savedDetail?.gallery?.length ? savedDetail.gallery : gallery,
    variants: savedDetail?.variants?.length ? savedDetail.variants : ["Standard"],
    bullets: product.bullets?.length ? product.bullets : savedDetail?.bullets?.length ? savedDetail.bullets : product.features,
    specs: product.specs?.length ? product.specs : savedDetail?.specs?.length ? savedDetail.specs : [],
    shipping: settings.shippingText,
    returns: settings.returnsText,
    warranty: settings.warrantyText,
    help: settings.helpText,
    story,
    reviews: savedDetail?.reviews ?? []
  };
}
