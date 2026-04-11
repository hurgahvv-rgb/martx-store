import Link from "next/link";
import type { ComponentType } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Package, TrendingUp } from "lucide-react";

import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [orders, products, lowStockProducts] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true }
      }),
      prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.product.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" }, take: 6 })
    ]);

    const allOrders = await prisma.order.findMany({ select: { total: true, status: true } });

    return {
      connected: true,
      orders,
      products,
      lowStockProducts,
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: allOrders.filter((order) => order.status === "PENDING").length,
      paidOrders: allOrders.filter((order) => order.status === "PAID").length
    };
  } catch {
    return {
      connected: false,
      orders: [],
      products: [],
      lowStockProducts: [],
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      paidOrders: 0
    };
  }
}

export default async function AdminPage() {
  await requireAdminSession();
  const data = await getDashboardData();

  const setupCards = [
    { title: "Домэйн үүсгэх", done: true },
    { title: "Үндсэн өнгө солих", done: true },
    { title: "Лого оруулах", done: true },
    { title: "Ангилал үүсгэх", done: false },
    { title: "Бараа оруулах", done: data.products.length > 0 },
    { title: "Төлбөрийн данс нэмэх", done: true },
    { title: "Баннер оруулах", done: true },
    { title: "Хол хэсэг", done: false }
  ];

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Дэлгүүрээ эхлүүлэх</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">MartX удирдлагын самбар</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Захиалга, бараа, үлдэгдэл, борлуулалтаа нэг газраас хянах dashboard.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <TrendingUp size={20} />
              </span>
              <div>
                <p className="text-sm text-slate-500">Одоогийн бэлэн байдал</p>
                <p className="text-xl font-bold text-slate-950">72%</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-72 max-w-full rounded-full bg-slate-100">
              <div className="h-2 w-[72%] rounded-full bg-blue-600" />
            </div>
          </div>
        </div>

        {!data.connected ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Database холбогдоогүй байна. Vercel дээр `DATABASE_URL` зөв байгаа эсэхээ шалгаад дахин deploy хийгээрэй.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {setupCards.map((card) => (
            <article key={card.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  {card.done ? <CheckCircle2 size={22} /> : <Package size={22} />}
                </span>
                {card.done ? <CheckCircle2 className="text-emerald-500" size={18} /> : null}
              </div>
              <h2 className="mt-5 text-center text-base font-bold text-slate-900">{card.title}</h2>
              {!card.done ? <p className="mt-3 text-center text-xs text-slate-400">1 минут</p> : null}
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт захиалга" value={data.totalOrders} icon={ClipboardList} />
          <StatCard label="Баталгаажаагүй" value={data.pendingOrders} icon={AlertTriangle} />
          <StatCard label="Төлбөртэй" value={data.paidOrders} icon={CheckCircle2} />
          <StatCard label="Борлуулалт" value={formatPrice(data.totalRevenue, "MNT")} icon={TrendingUp} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">Сүүлийн захиалга</h2>
              <Link href="/admin/orders" className="text-sm font-bold text-blue-600">
                Бүгдийг харах
              </Link>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {data.orders.map((order) => (
                <Link key={order.id} href="/admin/orders" className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <p className="font-bold text-slate-950">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.customerName} · {order.customerPhone}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {orderStatusLabels[order.status]}
                  </span>
                  <span className="font-bold text-slate-950">{formatPrice(order.total, "MNT")}</span>
                </Link>
              ))}
              {data.connected && data.orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">Одоогоор захиалга байхгүй байна.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">Үлдэгдэл багатай</h2>
              <Link href="/admin/products" className="text-sm font-bold text-blue-600">
                Бараа засах
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{product.stock}ш</span>
                </div>
              ))}
              {data.connected && data.lowStockProducts.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Үлдэгдэл багатай бараа алга.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}
