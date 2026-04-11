import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/data";

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <p className="section-title text-sm text-slate-500">Каталог</p>
        <h1 className="text-4xl font-semibold text-ink">Бүх бараа</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Энэ хэсгийг дараа нь database-тай холбож үлдэгдэл, үнэ, ангилал, хайлтын фильтрийг
          жинхэнэ өгөгдлөөр удирдах боломжтой.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
