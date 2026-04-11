import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { orderStatusLabels, orderStatuses } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function updateOrderStatus(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !orderStatuses.includes(status as never)) {
    return;
  }

  await prisma.order.update({
    where: { id },
    data: { status: status as never }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true }
    });

    return { connected: true, orders };
  } catch {
    return { connected: false, orders: [] };
  }
}

export default async function AdminOrdersPage() {
  await requireAdminSession();
  const { connected, orders } = await getOrders();

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Захиалга</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Захиалгын жагсаалт</h1>
            <p className="mt-2 text-sm text-slate-500">Ирсэн захиалгаа шалгаж, төлөвийг нь сольж болно.</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
            Нийт: <span className="text-slate-950">{orders.length}</span>
          </div>
        </div>

        {!connected ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Database холбогдоогүй байна. `DATABASE_URL` тохируулаад дахин deploy хийгээрэй.
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 max-lg:hidden">
            <span>Захиалга</span>
            <span>Хэрэглэгч</span>
            <span>Дүн</span>
            <span>Төлөв</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <article key={order.id} className="grid gap-5 px-5 py-5 lg:grid-cols-[1.1fr_1fr_0.8fr_0.8fr] lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{order.orderNumber}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {order.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-950">{order.customerName}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {order.customerPhone} · {order.customerEmail ?? "email байхгүй"}
                  </p>
                  <p className="text-sm leading-6 text-slate-500">
                    {order.shippingCity}
                    {order.shippingDistrict ? `, ${order.shippingDistrict}` : ""} · {order.shippingAddress}
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-950">{formatPrice(order.total, "MNT")}</p>
                  <p className="mt-1 text-xs text-slate-500">Хүргэлт: {formatPrice(order.shippingFee, "MNT")}</p>
                </div>

                <form action={updateOrderStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">OK</button>
                </form>
              </article>
            ))}

            {connected && orders.length === 0 ? (
              <div className="px-5 py-14 text-center text-sm text-slate-500">Одоогоор захиалга байхгүй байна.</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
