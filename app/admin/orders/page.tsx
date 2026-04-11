import { revalidatePath } from "next/cache";

import { formatPrice } from "@/lib/data";
import { orderStatusLabels, orderStatuses } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function updateOrderStatus(formData: FormData) {
  "use server";

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
  const { connected, orders } = await getOrders();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="section-title text-sm text-slate-500">Захиалга</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Захиалгын жагсаалт</h1>
      </div>

      {!connected ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
          Database холбогдоогүй байна. `DATABASE_URL` тохируулж migration ажиллуулсны дараа захиалгууд энд харагдана.
        </div>
      ) : null}

      <div className="space-y-5">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{order.orderNumber}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{order.customerName}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {order.customerPhone} · {order.customerEmail ?? "email байхгүй"} · {order.shippingCity}
                  {order.shippingDistrict ? `, ${order.shippingDistrict}` : ""}
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-600">{order.shippingAddress}</p>
              </div>
              <form action={updateOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                  ))}
                </select>
                <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">
                  Хадгалах
                </button>
              </form>
            </div>

            <div className="mt-5 rounded-2xl bg-stone-50 p-4">
              <div className="grid gap-2 text-sm text-slate-600">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.productName} {item.variant ? `(${item.variant})` : ""} · {item.quantity}ш
                    </span>
                    <span className="font-semibold text-ink">{formatPrice(item.price * item.quantity, "MNT")}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-base font-semibold text-ink">
                <span>Нийт</span>
                <span>{formatPrice(order.total, "MNT")}</span>
              </div>
            </div>
          </article>
        ))}

        {connected && orders.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center text-slate-600">
            Одоогоор захиалга байхгүй байна.
          </div>
        ) : null}
      </div>
    </section>
  );
}
