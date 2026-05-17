import Link from "next/link";
import type { ComponentType } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Package, Settings, TrendingUp } from "lucide-react";

import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [recentOrders, recentProducts, lowStockProducts, orderStats] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: true }
      }),
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      prisma.product.findMany({
        where: { stock: { lte: 3 }, isActive: true },
        orderBy: { stock: "asc" },
        take: 6
      }),
      prisma.$queryRaw<{ totalOrders: bigint; totalRevenue: bigint | null; pendingOrders: bigint; paidOrders: bigint }[]>`
        SELECT
          COUNT(*) AS "totalOrders",
          COALESCE(SUM(total), 0) AS "totalRevenue",
          COUNT(*) FILTER (WHERE status = 'PENDING') AS "pendingOrders",
          COUNT(*) FILTER (WHERE status = 'PAID') AS "paidOrders"
        FROM "Order"
      `
    ]);
    const stats = orderStats[0];

    return {
      connected: true,
      recentOrders,
      recentProducts,
      lowStockProducts,
      totalOrders: Number(stats?.totalOrders ?? 0),
      totalRevenue: Number(stats?.totalRevenue ?? 0),
      pendingOrders: Number(stats?.pendingOrders ?? 0),
      paidOrders: Number(stats?.paidOrders ?? 0)
    };
  } catch {
    return {
      connected: false,
      recentOrders: [],
      recentProducts: [],
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

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">MartX Admin</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Удирдлагын самбар</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Бараа, зураг, үлдэгдэл, захиалгаа browser дотроосоо удирдана.
            </p>
          </div>
        </div>

        {!data.connected ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Database холбогдоогүй байна. `DATABASE_URL` тохиргоогоо шалгаарай.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт захиалга" value={data.totalOrders} icon={ClipboardList} />
          <StatCard label="Хүлээгдэж буй" value={data.pendingOrders} icon={AlertTriangle} />
          <StatCard label="Төлбөртэй" value={data.paidOrders} icon={CheckCircle2} />
          <StatCard label="Борлуулалт" value={formatPrice(data.totalRevenue, "MNT")} icon={TrendingUp} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Сүүлийн захиалга</h2>
                <p className="mt-1 text-sm text-slate-500">Шинэ захиалга болон төлөвийг хурдан хянах хэсэг.</p>
              </div>
              <Link href="/admin/orders" className="text-sm font-bold text-blue-600">
                Бүгдийг харах
              </Link>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {data.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-950">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.customerName} · {order.customerPhone}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {orderStatusLabels[order.status]}
                  </span>
                  <span className="font-bold text-slate-950">{formatPrice(order.total, "MNT")}</span>
                </Link>
              ))}

              {data.connected && data.recentOrders.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">Одоогоор захиалга байхгүй байна.</p>
              ) : null}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Сүүлийн бараа</h2>
                  <p className="mt-1 text-sm text-slate-500">Сүүлд нэмсэн эсвэл зассан бараанууд.</p>
                </div>
                <Package className="text-blue-600" size={22} />
              </div>

              <div className="mt-5 space-y-3">
                {data.recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href="/admin/products"
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(product.price, "MNT")}</span>
                  </Link>
                ))}

                {data.connected && data.recentProducts.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Бараа хараахан нэмээгүй байна.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Үлдэгдэл багатай</h2>
                  <p className="mt-1 text-sm text-slate-500">3 болон түүнээс цөөн үлдэгдэлтэй бараа.</p>
                </div>
                <Settings className="text-slate-400" size={22} />
              </div>

              <div className="mt-5 space-y-3">
                {data.lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href="/admin/products"
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      {product.stock}ш
                    </span>
                  </Link>
                ))}

                {data.connected && data.lowStockProducts.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Үлдэгдэл багатай бараа алга.
                  </p>
                ) : null}
              </div>
            </section>
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
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
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
