import { revalidatePath } from "next/cache";

import { formatPrice } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яө үүё-]+/gi, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.product.create({
    data: {
      name,
      slug: slugify(String(formData.get("slug") || name)),
      category: String(formData.get("category") || "Ерөнхий"),
      description: String(formData.get("description") || ""),
      price: Number(formData.get("price") || 0),
      compareAtPrice: formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : null,
      currency: "MNT",
      image: String(
        formData.get("image") ||
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
      ),
      stock: Number(formData.get("stock") || 0),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: true
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

async function updateProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      category: String(formData.get("category") ?? "Ерөнхий"),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") || 0),
      compareAtPrice: formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : null,
      image: String(formData.get("image") ?? ""),
      stock: Number(formData.get("stock") || 0),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on"
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

async function deleteProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" }
    });

    return { connected: true, products };
  } catch {
    return { connected: false, products: [] };
  }
}

export default async function AdminProductsPage() {
  const { connected, products } = await getProducts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="section-title text-sm text-slate-500">Бараа</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Бараа нэмэх, засах</h1>
      </div>

      {!connected ? (
        <div className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
          Database холбогдоогүй байна. `DATABASE_URL` тохируулж migration ажиллуулсны дараа бараа нэмэх/засах ажиллана.
        </div>
      ) : null}

      <form action={createProduct} className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-card">
        <h2 className="text-2xl font-semibold text-ink">Шинэ бараа нэмэх</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="name" placeholder="Барааны нэр" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="slug" placeholder="slug, хоосон бол автоматаар" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="category" placeholder="Ангилал" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="price" type="number" placeholder="Үнэ" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="compareAtPrice" type="number" placeholder="Хуучин үнэ" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="stock" type="number" placeholder="Үлдэгдэл" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="image" placeholder="Зургийн URL" className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" />
          <textarea name="description" placeholder="Тайлбар" className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input name="isFeatured" type="checkbox" />
            Онцлох бараа болгох
          </label>
        </div>
        <button className="mt-5 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white">
          Бараа нэмэх
        </button>
      </form>

      <div className="space-y-5">
        {products.map((product) => (
          <article key={product.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-card">
            <form action={updateProduct} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={product.id} />
              <input name="name" defaultValue={product.name} className="rounded-2xl border border-stone-200 px-4 py-3" />
              <input name="slug" defaultValue={product.slug} className="rounded-2xl border border-stone-200 px-4 py-3" />
              <input name="category" defaultValue={product.category} className="rounded-2xl border border-stone-200 px-4 py-3" />
              <input name="price" type="number" defaultValue={product.price} className="rounded-2xl border border-stone-200 px-4 py-3" />
              <input
                name="compareAtPrice"
                type="number"
                defaultValue={product.compareAtPrice ?? ""}
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input name="stock" type="number" defaultValue={product.stock} className="rounded-2xl border border-stone-200 px-4 py-3" />
              <input name="image" defaultValue={product.image} className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" />
              <textarea
                name="description"
                defaultValue={product.description}
                className="min-h-24 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
              />
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 md:col-span-2">
                <span className="font-semibold text-ink">{formatPrice(product.price, "MNT")}</span>
                <span>Үлдэгдэл: {product.stock}</span>
                <label className="flex items-center gap-2">
                  <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
                  Онцлох
                </label>
                <label className="flex items-center gap-2">
                  <input name="isActive" type="checkbox" defaultChecked={product.isActive} />
                  Идэвхтэй
                </label>
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white">
                  Засах
                </button>
              </div>
            </form>
            <form action={deleteProduct} className="mt-3">
              <input type="hidden" name="id" value={product.id} />
              <button className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600">
                Устгах
              </button>
            </form>
          </article>
        ))}

        {connected && products.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center text-slate-600">
            Одоогоор database-д бараа байхгүй байна.
          </div>
        ) : null}
      </div>
    </section>
  );
}
