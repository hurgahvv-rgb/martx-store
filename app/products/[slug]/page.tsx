import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ReviewSection } from "@/components/review-section";
import { featuredProducts, formatPrice, products } from "@/lib/data";
import { productDetails } from "@/lib/product-details";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  const detail = productDetails[slug];

  if (!product || !detail) {
    notFound();
  }

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

        <div className="items-start gap-12 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery images={detail.gallery} title={product.name} />
          <ProductPurchasePanel product={product} detail={detail} />
        </div>
      </section>

      {detail.story.length > 0 && (
        <section className="border-t border-stone-200">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
            <div className="space-y-24">
              {detail.story.map((block, index) => (
                <div
                  key={block.title}
                  className={[
                    "relative grid items-center gap-0 lg:grid-cols-[1.02fr_0.98fr]",
                    index % 2 === 1 ? "lg:grid-cols-[0.98fr_1.02fr]" : ""
                  ].join(" ")}
                >
                  <div
                    className={[
                      "relative overflow-hidden bg-[#eee9e1]",
                      index % 2 === 1 ? "lg:order-2" : ""
                    ].join(" ")}
                  >
                    <div className="relative aspect-[1.55/1] min-h-[360px]">
                      <Image src={block.image} alt={block.title} fill className="object-cover" />
                    </div>
                  </div>
                  <div
                    className={[
                      "relative z-10 px-5 py-8 sm:px-8 lg:px-0",
                      index % 2 === 0
                        ? "lg:-ml-16 lg:max-w-[31rem]"
                        : "lg:-mr-16 lg:ml-auto lg:max-w-[31rem] lg:pr-0"
                    ].join(" ")}
                  >
                    <div className="bg-[#f5f1ea] p-8 shadow-[0_24px_60px_-30px_rgba(28,25,23,0.22)] sm:p-10">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                        Product Story
                      </p>
                      <h2 className="mt-4 text-3xl font-medium leading-tight text-stone-950 sm:text-4xl">
                        {block.title}
                      </h2>
                      <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
                        {block.description}
                      </p>
                    </div>
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
              const hoverImage = productDetails[item.slug]?.gallery?.[1] ?? item.image;

              return (
                <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[1.25rem] bg-[#f4f1eb]">
                    <div className="relative aspect-[4/4.8] overflow-hidden">
                      {item.compareAtPrice ? (
                        <span className="absolute bottom-3 right-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                          Sale
                        </span>
                      ) : null}
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition duration-500 group-hover:opacity-0"
                      />
                      <Image
                        src={hoverImage}
                        alt={`${item.name} hover`}
                        fill
                        className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
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
