import { ProductCard } from "@/components/product-card";
import { getStoreProducts } from "@/lib/store-products";
import Link from "next/link";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = String(params.category ?? "").trim();
  const selectedFilter = String(params.filter ?? "").trim();
  const products = await getStoreProducts();
  const categoryProducts = selectedCategory ? products.filter((product) => product.category === selectedCategory) : products;
  const visibleProducts =
    selectedFilter === "featured"
      ? categoryProducts.filter((product) => product.isFeatured)
      : selectedFilter === "new"
        ? categoryProducts.slice(0, 8)
        : categoryProducts;
  const title = selectedCategory || (selectedFilter === "featured" ? "Онцлох бараа" : selectedFilter === "new" ? "Шинэ бараа" : "Бүх бараа");
  const description = selectedCategory
    ? `${selectedCategory} ангиллын идэвхтэй бараанууд.`
    : selectedFilter === "featured"
      ? "Дэлгүүрээс онцолсон, хэрэглэгчдэд санал болгох бүтээгдэхүүнүүд."
      : selectedFilter === "new"
        ? "Сүүлд нэмэгдсэн болон шинэчлэгдсэн бүтээгдэхүүнүүд."
        : "Admin дээр нэмсэн идэвхтэй бараанууд энд шууд харагдана.";

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <p className="section-title text-sm text-slate-500">Каталог</p>
        <h1 className="text-4xl font-semibold text-ink">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
        {selectedCategory || selectedFilter ? (
          <Link href="/products" className="inline-flex text-sm font-semibold text-stone-600 underline-offset-4 hover:underline">
            Бүх бараа харах
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {visibleProducts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center text-sm text-stone-500">
          Энэ ангилалд одоогоор идэвхтэй бараа алга.
        </div>
      ) : null}
    </section>
  );
}
