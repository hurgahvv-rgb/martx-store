import Image from "next/image";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яөүё-]+/gi, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createProduct(formData: FormData) {
  "use server";

  await requireAdminSession();

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

  await requireAdminSession();

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

  await requireAdminSession();

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
  await requireAdminSession();
  const { connected, products } = await getProducts();

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Бараа</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Бараа нэмэх, засах</h1>
            <p className="mt-2 text-sm text-slate-500">Үнэ, зураг, үлдэгдэл, идэвхтэй эсэхийг эндээс удирдана.</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
            Нийт бараа: <span className="text-slate-950">{products.length}</span>
          </div>
        </div>

        {!connected ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Database холбогдоогүй байна. `DATABASE_URL` тохируулаад дахин deploy хийгээрэй.
          </div>
        ) : null}

        <form action={createProduct} className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Шинэ бараа нэмэх</h2>
              <p className="mt-1 text-sm text-slate-500">Зураг дээр URL тавина. Дараа нь image upload болгож сайжруулж болно.</p>
            </div>
            <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
              + Нэмэх
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input name="name" placeholder="Барааны нэр" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <input name="slug" placeholder="slug" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <input name="category" placeholder="Ангилал" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <input name="price" type="number" placeholder="Үнэ" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <input name="compareAtPrice" type="number" placeholder="Хуучин үнэ" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <input name="stock" type="number" placeholder="Үлдэгдэл" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <input name="image" placeholder="Зургийн URL" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 md:col-span-2" />
            <textarea name="description" placeholder="Тайлбар" className="min-h-24 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 xl:col-span-4" />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input name="isFeatured" type="checkbox" />
              Онцлох бараа
            </label>
          </div>
        </form>

        <div className="space-y-4">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="grid gap-5 xl:grid-cols-[150px_1fr]">
                <div className="relative h-36 overflow-hidden rounded-2xl bg-slate-100">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="150px" />
                  ) : null}
                </div>

                <div>
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{product.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.category} · {formatPrice(product.price, "MNT")} · Үлдэгдэл {product.stock}ш
                      </p>
                    </div>
                    <span
                      className={[
                        "w-fit rounded-full px-3 py-1 text-xs font-bold",
                        product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      ].join(" ")}
                    >
                      {product.isActive ? "Идэвхтэй" : "Нуусан"}
                    </span>
                  </div>

                  <form action={updateProduct} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <input type="hidden" name="id" value={product.id} />
                    <input name="name" defaultValue={product.name} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    <input name="slug" defaultValue={product.slug} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    <input name="category" defaultValue={product.category} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    <input name="price" type="number" defaultValue={product.price} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    <input name="compareAtPrice" type="number" defaultValue={product.compareAtPrice ?? ""} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    <input name="stock" type="number" defaultValue={product.stock} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    <input name="image" defaultValue={product.image} className="rounded-xl border border-slate-200 px-4 py-3 text-sm md:col-span-2" />
                    <textarea name="description" defaultValue={product.description} className="min-h-20 rounded-xl border border-slate-200 px-4 py-3 text-sm xl:col-span-4" />
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 xl:col-span-4">
                      <label className="flex items-center gap-2">
                        <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
                        Онцлох
                      </label>
                      <label className="flex items-center gap-2">
                        <input name="isActive" type="checkbox" defaultChecked={product.isActive} />
                        Идэвхтэй
                      </label>
                      <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Хадгалах</button>
                    </div>
                  </form>

                  <form action={deleteProduct} className="mt-3">
                    <input type="hidden" name="id" value={product.id} />
                    <button className="rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-bold text-red-600">
                      Устгах
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}

          {connected && products.length === 0 ? (
            <div className="rounded-2xl bg-white px-5 py-14 text-center text-sm text-slate-500 shadow-sm">
              Одоогоор database-д бараа байхгүй байна.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
