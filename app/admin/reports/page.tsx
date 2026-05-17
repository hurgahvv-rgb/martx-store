import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getSeason(month: number) {
  if (month >= 2 && month <= 4) {
    return "Хавар";
  }

  if (month >= 5 && month <= 7) {
    return "Зун";
  }

  if (month >= 8 && month <= 10) {
    return "Намар";
  }

  return "Өвөл";
}

async function getReports() {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 12);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [orders, products] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              productName: true,
              variant: true,
              quantity: true,
              price: true
            }
          }
        }
      }),
      prisma.product.findMany({ select: { id: true, stock: true, isActive: true } })
    ]);

    const soldProducts = new Map<string, { name: string; quantity: number; revenue: number; orders: number }>();
    const validOrders = orders.filter((order) => order.status !== "CANCELED");
    const now = new Date();
    const monthlySales = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: new Intl.DateTimeFormat("mn-MN", { month: "short" }).format(date),
        revenue: 0,
        orders: 0,
        quantity: 0
      };
    });
    const monthlyIndex = new Map(monthlySales.map((month) => [month.key, month]));
    const seasonalSales = new Map<string, { season: string; revenue: number; orders: number; quantity: number }>();

    for (const order of validOrders) {
      const orderMonthKey = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
      const monthBucket = monthlyIndex.get(orderMonthKey);
      const orderQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
      const season = getSeason(order.createdAt.getMonth());
      const seasonBucket = seasonalSales.get(season) ?? { season, revenue: 0, orders: 0, quantity: 0 };

      if (monthBucket) {
        monthBucket.revenue += order.total;
        monthBucket.orders += 1;
        monthBucket.quantity += orderQuantity;
      }

      seasonBucket.revenue += order.total;
      seasonBucket.orders += 1;
      seasonBucket.quantity += orderQuantity;
      seasonalSales.set(season, seasonBucket);

      for (const item of order.items) {
        const key = `${item.productName}__${item.variant ?? ""}`;
        const current = soldProducts.get(key) ?? {
          name: item.variant ? `${item.productName} (${item.variant})` : item.productName,
          quantity: 0,
          revenue: 0,
          orders: 0
        };

        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        current.orders += 1;
        soldProducts.set(key, current);
      }
    }

    return {
      connected: true,
      totalRevenue: validOrders.reduce((sum, order) => sum + order.total, 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === "PENDING").length,
      activeProducts: products.filter((product) => product.isActive).length,
      lowStock: products.filter((product) => product.stock <= 3).length,
      recentOrders: orders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((order) => ({
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.map((item) => `${item.productName}${item.variant ? ` (${item.variant})` : ""} x${item.quantity}`)
        })),
      soldProducts: Array.from(soldProducts.values()).sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue),
      monthlySales,
      seasonalSales: ["Өвөл", "Хавар", "Зун", "Намар"].map((season) => seasonalSales.get(season) ?? { season, revenue: 0, orders: 0, quantity: 0 })
    };
  } catch {
    return {
      connected: false,
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      activeProducts: 0,
      lowStock: 0,
      recentOrders: [],
      soldProducts: [],
      monthlySales: [],
      seasonalSales: []
    };
  }
}

export default async function AdminReportsPage() {
  await requireAdminSession();
  const data = await getReports();
  const maxMonthlyRevenue = Math.max(...data.monthlySales.map((month) => month.revenue), 1);
  const maxSeasonRevenue = Math.max(...data.seasonalSales.map((season) => season.revenue), 1);
  const maxProductQuantity = Math.max(...data.soldProducts.map((product) => product.quantity), 1);

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Reports</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Тайлан</h1>
        {!data.connected ? <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Database холбогдоогүй байна.</div> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card label="Борлуулалт" value={formatPrice(data.totalRevenue, "MNT")} />
          <Card label="Нийт захиалга" value={data.totalOrders} />
          <Card label="Шинэ захиалга" value={data.pendingOrders} />
          <Card label="Идэвхтэй бараа" value={data.activeProducts} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">Сарын борлуулалт</h2>
              <p className="mt-1 text-sm text-slate-500">Сүүлийн 12 сарын захиалга, орлого, зарагдсан ширхэг.</p>
            </div>
            <div className="px-5 py-5">
              <div className="flex h-72 items-end gap-2 rounded-xl bg-slate-50 px-4 pb-4 pt-6">
                {data.monthlySales.map((month) => (
                  <div key={month.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-48 w-full items-end justify-center">
                      <div
                        className="w-full rounded-t-lg bg-blue-600 transition-all"
                        style={{ height: `${Math.max((month.revenue / maxMonthlyRevenue) * 100, month.revenue > 0 ? 8 : 2)}%` }}
                        title={`${month.label}: ${formatPrice(month.revenue, "MNT")}`}
                      />
                    </div>
                    <p className="w-full truncate text-center text-xs font-bold text-slate-500">{month.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {data.monthlySales.slice(-3).map((month) => (
                  <article key={month.key} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{month.label}</p>
                    <p className="mt-2 text-sm font-bold text-slate-950">{formatPrice(month.revenue, "MNT")}</p>
                    <p className="mt-1 text-xs text-slate-500">{month.orders} захиалга · {month.quantity} ширхэг</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">Улирлын зураглал</h2>
              <p className="mt-1 text-sm text-slate-500">Аль улиралд борлуулалт илүү байгааг харна.</p>
            </div>
            <div className="space-y-4 px-5 py-5">
              {data.seasonalSales.map((season) => (
                <article key={season.season}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{season.season}</p>
                      <p className="text-xs text-slate-500">{season.orders} захиалга · {season.quantity} ширхэг</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{formatPrice(season.revenue, "MNT")}</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.max((season.revenue / maxSeasonRevenue) * 100, season.revenue > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">Барааны борлуулалтын эрэмбэ</h2>
              <p className="mt-1 text-sm text-slate-500">Хамгийн их зарагдсанаас бага зарагдсан руу, тоо ширхэгтэйгээ.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {data.soldProducts.map((product, index) => (
                <article key={product.name} className="grid gap-3 px-5 py-4 md:grid-cols-[48px_1fr_130px_150px] md:items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{index + 1}</span>
                  <div>
                    <h3 className="font-bold text-slate-950">{product.name}</h3>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max((product.quantity / maxProductQuantity) * 100, 8)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{product.orders} захиалгад орсон</p>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{product.quantity} ширхэг</p>
                  <p className="text-sm font-bold text-slate-950">{formatPrice(product.revenue, "MNT")}</p>
                </article>
              ))}
              {data.connected && data.soldProducts.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">Одоогоор зарагдсан бараа байхгүй байна.</div>
              ) : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">Сүүлийн захиалгууд</h2>
              <p className="mt-1 text-sm text-slate-500">Хэн юу авсныг товч харна.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {data.recentOrders.map((order) => (
                <article key={order.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-950">{formatPrice(order.total, "MNT")}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{orderStatusLabels[order.status]}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{order.items.join(", ")}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </article>
  );
}
