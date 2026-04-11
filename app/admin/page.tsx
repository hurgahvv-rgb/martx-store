import Link from "next/link";

import { formatPrice } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [orders, products, pendingOrders, paidOrders] = await Promise.all([
      prisma.order.findMany({ select: { total: true } }),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } })
    ]);

    return {
      connected: true,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalProducts: products,
      pendingOrders,
      paidOrders
    };
  } catch {
    return {
      connected: false,
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      pendingOrders: 0,
      paidOrders: 0
    };
  }
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title text-sm text-slate-500">Удирдлага</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">MartX админ dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Захиалга, бараа, үлдэгдэл, төлөвийг нэг газраас удирдах эхний хувилбар.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/orders" className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white">
            Захиалга харах
          </Link>
          <Link href="/admin/products" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700">
            Бараа удирдах
          </Link>
        </div>
      </div>

      {!stats.connected ? (
        <div className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
          Database холбогдоогүй байна. Vercel дээр бодит `DATABASE_URL` нэмээд Prisma migration ажиллуулсны дараа dashboard дээр бодит захиалга, бараа харагдана.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Нийт захиалга", value: stats.totalOrders },
          { label: "Хүлээгдэж буй", value: stats.pendingOrders },
          { label: "Төлбөртэй", value: stats.paidOrders },
          { label: "Бараа", value: stats.totalProducts },
          { label: "Нийт дүн", value: formatPrice(stats.totalRevenue, "MNT") }
        ].map((item) => (
          <article key={item.label} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-ink">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
