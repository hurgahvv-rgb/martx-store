import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function updateProductStock(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const stock = Number(formData.get("stock") ?? 0);

  if (!id || !Number.isInteger(stock) || stock < 0) {
    return;
  }

  await prisma.product.update({
    where: { id },
    data: { stock }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

async function getInventory() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          select: {
            stock: true,
            isActive: true
          }
        }
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }]
    });

    const activeProducts = products.filter((product) => product.isActive);
    const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = activeProducts.filter((product) => product.stock > 0 && product.stock <= 3).length;
    const outOfStock = activeProducts.filter((product) => product.stock <= 0).length;

    return { connected: true, products, totalUnits, lowStock, outOfStock };
  } catch {
    return { connected: false, products: [], totalUnits: 0, lowStock: 0, outOfStock: 0 };
  }
}

export default async function AdminInventoryPage() {
  await requireAdminSession();
  const data = await getInventory();

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Inventory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Үлдэгдэл</h1>
          <p className="mt-2 text-sm text-slate-500">Барааны үлдэгдлийг хянаж, хурдан шинэчлэх хэсэг.</p>
        </div>

        {!data.connected ? <Notice /> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Нийт үлдэгдэл" value={`${data.totalUnits}ш`} tone="blue" />
          <StatCard label="Бага үлдэгдэлтэй" value={data.lowStock} tone="amber" />
          <StatCard label="Дууссан бараа" value={data.outOfStock} tone="red" />
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="hidden grid-cols-[1fr_130px_150px_140px] border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-500 md:grid">
            <span>Бараа</span>
            <span>Variant</span>
            <span>Үлдэгдэл</span>
            <span>Төлөв</span>
          </div>
          {data.products.map((product) => (
            <InventoryRow key={product.id} product={product} />
          ))}

          {data.connected && data.products.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">Одоогоор бараа бүртгээгүй байна.</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function InventoryRow({
  product
}: {
  product: {
    id: string;
    name: string;
    category: string;
    stock: number;
    isActive: boolean;
    variants: { stock: number; isActive: boolean }[];
  };
}) {
  const activeVariants = product.variants.filter((variant) => variant.isActive);
  const variantStock = activeVariants.reduce((sum, variant) => sum + variant.stock, 0);
  const status = getStockStatus(product.stock, product.isActive);

  return (
    <div className="grid gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_130px_150px_140px] md:items-center">
      <div>
        <Link href="/admin/products" className="font-semibold text-slate-950 hover:text-blue-700">
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-slate-500">{product.category}</p>
      </div>

      <div className="text-slate-600">
        <span className="font-semibold text-slate-900">{variantStock}ш</span>
        <p className="mt-1 text-xs text-slate-500">{activeVariants.length} идэвхтэй variant</p>
      </div>

      <form action={updateProductStock} className="flex items-center gap-2">
        <input type="hidden" name="id" value={product.id} />
        <input
          name="stock"
          type="number"
          min="0"
          defaultValue={product.stock}
          className="h-10 w-20 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500"
          aria-label={`${product.name} үлдэгдэл`}
        />
        <button className="h-10 rounded-lg bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-blue-700">
          Хадгалах
        </button>
      </form>

      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
    </div>
  );
}

function getStockStatus(stock: number, isActive: boolean) {
  if (!isActive) {
    return { label: "Идэвхгүй", className: "bg-slate-100 text-slate-600" };
  }

  if (stock <= 0) {
    return { label: "Дууссан", className: "bg-red-50 text-red-700" };
  }

  if (stock <= 3) {
    return { label: "Бага", className: "bg-amber-50 text-amber-700" };
  }

  return { label: "Хэвийн", className: "bg-emerald-50 text-emerald-700" };
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: "blue" | "amber" | "red" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700"
  }[tone];

  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-xl px-3 py-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </article>
  );
}

function Notice() {
  return <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Database холбогдоогүй байна.</div>;
}
