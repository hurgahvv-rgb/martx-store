import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
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

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function createCategory(formData: FormData) {
  "use server";

  await requireAdminSession();

  const name = getText(formData, "name");

  if (!name) {
    return;
  }

  const slug = slugify(getText(formData, "slug") || name);
  const existingByName = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } }
  });

  if (existingByName) {
    await prisma.category.update({
      where: { id: existingByName.id },
      data: {
        slug,
        description: getText(formData, "description") || null
      }
    });
  } else {
  await prisma.category.upsert({
    where: { slug },
    create: {
      name,
      slug,
      description: getText(formData, "description") || null
    },
    update: {
      name,
      description: getText(formData, "description") || null
    }
  });
  }

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

async function updateCategory(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = getText(formData, "id");
  const name = getText(formData, "name");

  if (!id || !name) {
    return;
  }

  const current = await prisma.category.findUnique({ where: { id } });
  const slug = slugify(getText(formData, "slug") || name);

  await prisma.$transaction([
    prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: getText(formData, "description") || null
      }
    }),
    ...(current && current.name !== name
      ? [
          prisma.product.updateMany({
            where: { category: current.name },
            data: { category: name }
          })
        ]
      : [])
  ]);

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

async function deleteCategory(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = getText(formData, "id");

  if (!id) {
    return;
  }

  const current = await prisma.category.findUnique({ where: { id } });

  if (!current) {
    return;
  }

  await prisma.$transaction([
    prisma.product.updateMany({
      where: { category: current.name },
      data: { category: "Ерөнхий" }
    }),
    prisma.category.delete({ where: { id } })
  ]);

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

async function getCategories() {
  try {
    const products = await prisma.product.findMany({
      select: { category: true, isActive: true, stock: true },
      orderBy: { category: "asc" }
    });

    const productCategoryNames = Array.from(
      new Set(products.map((product) => product.category.trim()).filter(Boolean))
    );

    await Promise.all(
      productCategoryNames.map((name) => {
        const slug = slugify(name);

        if (!slug) {
          return null;
        }

        return prisma.category
          .upsert({
            where: { slug },
            create: { name, slug, description: null },
            update: {}
          })
          .catch(() => null);
      })
    );

    const savedCategories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    const savedByName = new Map(savedCategories.map((category) => [category.name.toLowerCase(), category]));

    const stats = new Map<string, { total: number; active: number; stock: number; lowStock: number }>();

    for (const product of products) {
      const current = stats.get(product.category) ?? { total: 0, active: 0, stock: 0, lowStock: 0 };
      current.total += 1;
      current.active += product.isActive ? 1 : 0;
      current.stock += product.stock;
      current.lowStock += product.isActive && product.stock <= 3 ? 1 : 0;
      stats.set(product.category, current);
    }

    const productOnlyCategories = productCategoryNames
      .filter((name) => !savedByName.has(name.toLowerCase()))
      .map((name) => ({
        id: `product-${slugify(name)}`,
        name,
        slug: slugify(name),
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    const categoryByName = new Map<string, (typeof savedCategories)[number]>();

    for (const category of [...savedCategories, ...productOnlyCategories]) {
      const key = category.name.trim().toLowerCase();
      const current = categoryByName.get(key);
      const categoryHasNaturalSlug = category.slug === slugify(category.name);
      const currentHasNaturalSlug = current ? current.slug === slugify(current.name) : false;

      if (!current || (categoryHasNaturalSlug && !currentHasNaturalSlug)) {
        categoryByName.set(key, category);
      }
    }

    const categoryList = Array.from(categoryByName.values())
      .map((category) => ({
        ...category,
        total: stats.get(category.name)?.total ?? 0,
        active: stats.get(category.name)?.active ?? 0,
        stock: stats.get(category.name)?.stock ?? 0,
        lowStock: stats.get(category.name)?.lowStock ?? 0
      }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    const totalActive = categoryList.reduce((sum, category) => sum + category.active, 0);
    const totalStock = categoryList.reduce((sum, category) => sum + category.stock, 0);

    return { connected: true, categories: categoryList, totalActive, totalStock };
  } catch {
    return { connected: false, categories: [], totalActive: 0, totalStock: 0 };
  }
}

export default async function AdminCategoriesPage() {
  await requireAdminSession();
  const data = await getCategories();

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Categories</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Ангилал</h1>
            <p className="mt-2 text-sm text-slate-500">Ангилал нэмэх, засах, устгах хэсэг.</p>
          </div>
          <Link href="/admin/products?new=1" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
            Бараа дээр ангилал засах
          </Link>
        </div>

        {!data.connected ? <Notice /> : null}

        <form action={createCategory} className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Шинэ ангилал нэмэх</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
            <Field label="Нэр">
              <input name="name" placeholder="Жишээ: Гутал" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Slug">
              <input name="slug" placeholder="gutal" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Тайлбар">
              <input name="description" placeholder="Энэ ангиллын богино тайлбар" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Нэмэх</button>
          </div>
        </form>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Ангиллын тоо" value={data.categories.length} />
          <StatCard label="Идэвхтэй бараа" value={data.totalActive} />
          <StatCard label="Нийт үлдэгдэл" value={`${data.totalStock}ш`} />
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Одоогийн ангиллууд</h2>
            <p className="mt-1 text-sm text-slate-500">Энд байгаа ангиллаа нээгээд нэр, slug, тайлбарыг нь засаж эсвэл устгаж болно.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.categories.map((category) => (
            <article key={category.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{category.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{category.description || "Тайлбар байхгүй"}</p>
                </div>
                <span className={category.lowStock > 0 ? "rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700" : "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"}>
                  {category.lowStock > 0 ? `${category.lowStock} бага` : "Хэвийн"}
                </span>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <Metric label="Нийт бараа" value={`${category.total}`} />
                <Metric label="Идэвхтэй" value={`${category.active}/${category.total}`} />
                <Metric label="Үлдэгдэл" value={`${category.stock}ш`} />
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Идэвхтэй хувь</span>
                    <span>{category.total > 0 ? Math.round((category.active / category.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${category.total > 0 ? (category.active / category.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer list-none text-sm font-bold text-blue-700 [&::-webkit-details-marker]:hidden">Засах</summary>
                <form action={updateCategory} className="mt-4 grid gap-3">
                  <input type="hidden" name="id" value={category.id} />
                  <Field label="Нэр">
                    <input name="name" defaultValue={category.name} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" />
                  </Field>
                  <Field label="Slug">
                    <input name="slug" defaultValue={category.slug} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" />
                  </Field>
                  <Field label="Тайлбар">
                    <textarea name="description" defaultValue={category.description ?? ""} className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" />
                  </Field>
                  <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">Хадгалах</button>
                </form>
                <form action={deleteCategory} className="mt-3 border-t border-red-100 pt-3">
                  <input type="hidden" name="id" value={category.id} />
                  <p className="mb-2 text-xs leading-5 text-red-700">Устгавал энэ ангиллын бараанууд `Ерөнхий` ангилал руу шилжинэ.</p>
                  <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">Ангилал устгах</button>
                </form>
              </details>
            </article>
          ))}

          {data.connected && data.categories.length === 0 ? (
            <div className="rounded-xl bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm md:col-span-2 xl:col-span-3">
              Одоогоор ангилалтай бараа байхгүй байна.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-bold text-slate-950">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Notice() {
  return <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Database холбогдоогүй байна.</div>;
}
