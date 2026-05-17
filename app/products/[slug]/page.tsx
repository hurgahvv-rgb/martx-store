import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/product-detail-client";
import { ProductImage } from "@/components/product-image";
import { ReviewSection } from "@/components/review-section";
import { formatPrice } from "@/lib/data";
import { getFeaturedStoreProducts, getProductDetail, getStoreProductBySlug } from "@/lib/store-products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ image?: string }>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { slug } = await params;
  const { image } = await searchParams;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const detail = await getProductDetail(product);
  const featuredProducts = await getFeaturedStoreProducts();
  const selectedImage = image && detail.gallery.includes(image) ? image : undefined;

  return (
    <div className="bg-[#fbfaf7]">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 text-sm text-stone-500">
          <Link href="/products" className="transition hover:text-stone-900">
            Бүх бараа
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <ProductDetailClient product={product} detail={detail} selectedImage={selectedImage} />
      </section>

      {detail.story.length > 0 && (
        <section className="border-t border-stone-200">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="space-y-16">
              {detail.story.map((block, index) => (
                <div
                  key={block.title}
                  className={[
                    "grid overflow-hidden border border-stone-200 bg-[#f3f3f3] lg:grid-cols-2",
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  ].join(" ")}
                >
                  <div className="flex min-h-[24rem] items-center justify-center bg-[#f4f4f4] px-8 py-14 text-center sm:px-12 lg:px-16">
                    <div className="max-w-md">
                      <h2 className="text-2xl font-semibold leading-tight tracking-[-0.01em] text-black sm:text-[1.65rem]">
                        {block.title}
                      </h2>
                      <p className="mx-auto mt-5 max-w-sm text-sm font-normal leading-7 text-slate-700">
                        {block.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative min-h-[24rem] bg-stone-100">
                    <ProductImage src={block.image} alt={block.title} className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ReviewSection initialReviews={detail.reviews} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              You May Also Like
            </p>
            <h2 className="mt-3 text-3xl font-medium text-stone-950 sm:text-4xl">Төстэй бараанууд</h2>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts
            .filter((item) => item.slug !== product.slug)
            .map((item) => {
              const hoverImage = item.galleryImages?.[0] ?? item.image;

              return (
                <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[1.25rem] bg-[#f4f1eb]">
                    <div className="relative aspect-[4/4.8] overflow-hidden">
                      {item.compareAtPrice ? (
                        <span className="absolute bottom-3 right-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                          Sale
                        </span>
                      ) : null}
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:opacity-0"
                      />
                      <ProductImage
                        src={hoverImage}
                        alt={`${item.name} hover`}
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 px-1 pb-2 pt-5">
                    <h3 className="text-lg font-medium leading-7 text-stone-900">{item.name}</h3>
                    <div className="flex items-center gap-3 text-base">
                      {item.compareAtPrice ? (
                        <span className="text-sm text-stone-400 line-through">
                          {formatPrice(item.compareAtPrice, item.currency)}
                        </span>
                      ) : null}
                      <span className="font-medium text-stone-900">
                        {formatPrice(item.price, item.currency)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
