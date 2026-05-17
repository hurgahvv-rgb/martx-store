import Link from "next/link";

import { shouldSkipDatabaseReads } from "@/lib/database-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackCategories = [
  { name: "Хувцас", slug: "huvtsas", description: "Ноолуур, гадуур хувцас, өдөр тутмын premium загварууд.", count: 0 },
  { name: "Гэр ахуй", slug: "ger-ahuj", description: "Үнэртэн, керамик болон өдөр тутмын тав тух нэмэх бүтээгдэхүүн.", count: 0 },
  { name: "Цүнх", slug: "tsunh", description: "Аялал, ажил, амралтад тохирсон загварлаг сонголтууд.", count: 0 }
];

async function getCategories() {
  if (shouldSkipDatabaseReads()) {
    return fallbackCategories;
  }

  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({ where: { isActive: true }, select: { category: true } })
    ]);
    const counts = new Map<string, number>();

    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }

    if (categories.length > 0) {
      return categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description || "Энэ ангиллын бараануудыг харах.",
        count: counts.get(category.name) ?? 0
      }));
    }
  } catch {
    // Keep public category page available during local database setup.
  }

  return fallbackCategories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <p className="section-title text-sm text-slate-500">Ангилал</p>
        <h1 className="text-4xl font-semibold text-ink">Ангиллаар сонгох</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="glass-panel rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1"
          >
            <p className="section-title text-sm text-slate-500">Ангилал</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">{category.name}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.description}</p>
            <p className="mt-5 text-sm font-semibold text-stone-900">{category.count} бараа</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
