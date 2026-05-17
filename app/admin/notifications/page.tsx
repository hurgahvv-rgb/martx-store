import Link from "next/link";

import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  await requireAdminSession();

  let pendingOrders = 0;
  let lowStock = 0;
  let latestOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: keyof typeof orderStatusLabels;
    createdAt: Date;
    customerName: string;
    customerPhone: string;
    items: Array<{ productName: string; variant: string | null; quantity: number }>;
  }> = [];

  try {
    const [orders, products, recent] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { stock: { lte: 3 }, isActive: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true }
      })
    ]);
    pendingOrders = orders;
    lowStock = products;
    latestOrders = recent;
  } catch {
    // Keep the page reachable if the database is temporarily unavailable.
  }

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Notifications</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Мэдэгдэл</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">Баталгаажаагүй захиалга</h2>
            <p className="mt-3 text-3xl font-bold text-blue-600">{pendingOrders}</p>
            <Link href="/admin/orders" className="mt-4 inline-flex rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              Захиалга харах
            </Link>
          </article>
          <article className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">Үлдэгдэл багатай бараа</h2>
            <p className="mt-3 text-3xl font-bold text-amber-600">{lowStock}</p>
          </article>
        </div>

        <section className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">Сүүлийн мэдэгдэл</h2>
            <p className="mt-1 text-sm text-slate-500">Шинэ захиалга ирэхэд энд бараа, хэрэглэгч, дүнтэйгээ нэмэгдэнэ.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {latestOrders.map((order) => (
              <article key={order.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_1fr_190px] lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{order.orderNumber}</p>
                  <h3 className="mt-2 font-bold text-slate-950">
                    {order.customerName} · {order.customerPhone}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                    <Link href={`/admin/orders?q=${encodeURIComponent(order.customerPhone)}`} className="text-blue-600">
                      Энэ утсаар хайх
                    </Link>
                    <Link href={`/admin/orders/${order.id}`} className="text-slate-600">
                      Дэлгэрэнгүй
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {order.items.map((item) => `${item.productName}${item.variant ? ` (${item.variant})` : ""} x${item.quantity}`).join(", ")}
                </p>
                <div className="lg:text-right">
                  <p className="font-bold text-slate-950">{formatPrice(order.total, "MNT")}</p>
                  <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{orderStatusLabels[order.status]}</p>
                </div>
              </article>
            ))}

            {latestOrders.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">Одоогоор шинэ мэдэгдэл байхгүй байна.</div>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}
