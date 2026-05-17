import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Prisma } from "@prisma/client";

import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { orderStatusLabels, orderStatuses } from "@/lib/order-status";
import { getPaymentStatusLabel } from "@/lib/payment-status";
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
  revalidatePath("/admin/notifications");
}

async function deleteOrder(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.order.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/customers");
}

async function getOrders(query: string) {
  try {
    const search = query.trim();
    const searchFilter = search
      ? Prisma.sql`
        WHERE
          o."customerPhone" ILIKE ${`%${search}%`}
          OR o."customerName" ILIKE ${`%${search}%`}
          OR o."customerEmail" ILIKE ${`%${search}%`}
          OR o."orderNumber" ILIKE ${`%${search}%`}
          OR EXISTS (
            SELECT 1
            FROM "OrderItem" si
            WHERE si."orderId" = o.id
              AND (
                si."productName" ILIKE ${`%${search}%`}
                OR COALESCE(si.variant, '') ILIKE ${`%${search}%`}
              )
          )
      `
      : Prisma.empty;

    const orders = await prisma.$queryRaw<
      {
        id: string;
        orderNumber: string;
        status: string;
        paymentStatus: string;
        total: number;
        shippingFee: number;
        paymentMethod: string;
        customerName: string;
        customerEmail: string | null;
        customerPhone: string;
        shippingCity: string;
        shippingDistrict: string | null;
        shippingAddress: string;
        createdAt: Date;
        items: { productName: string; quantity: number }[];
      }[]
    >`
      SELECT
        o.id,
        o."orderNumber",
        o.status::text AS status,
        o."paymentStatus",
        o.total,
        o."shippingFee",
        o."paymentMethod",
        o."customerName",
        o."customerEmail",
        o."customerPhone",
        o."shippingCity",
        o."shippingDistrict",
        o."shippingAddress",
        o."createdAt",
        COALESCE(
          json_agg(json_build_object('productName', i."productName", 'quantity', i.quantity)) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) AS items
      FROM "Order" o
      LEFT JOIN "OrderItem" i ON i."orderId" = o.id
      ${searchFilter}
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
      LIMIT 50
    `;

    return { connected: true, orders };
  } catch {
    return { connected: false, orders: [] };
  }
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const query = String(params.q ?? "").trim();
  const { connected, orders } = await getOrders(query);

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Захиалга</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Захиалгын жагсаалт</h1>
            <p className="mt-2 text-sm text-slate-500">Ирсэн захиалгаа шалгаж, утасны дугаараар хайж, хэрэггүй test захиалгыг устгаж болно.</p>
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

        <form action="/admin/orders" className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Хайх</span>
              <input
                name="q"
                defaultValue={query}
                placeholder="Утас, захиалгын код, нэр, email, барааны нэрээр хайна"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </label>
            <div className="flex gap-2 md:pt-6">
              <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                Хайх
              </button>
              {query ? (
                <Link href="/admin/orders" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600">
                  Цэвэрлэх
                </Link>
              ) : null}
            </div>
          </div>
          {query ? (
            <p className="mt-3 text-sm text-slate-500">
              <strong className="text-slate-950">{query}</strong> хайлтаар {orders.length} захиалга олдлоо.
            </p>
          ) : null}
        </form>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_1fr_0.75fr_0.75fr_0.8fr_0.55fr] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 max-lg:hidden">
            <span>Захиалга</span>
            <span>Хэрэглэгч</span>
            <span>Дүн</span>
            <span>Төлбөр</span>
            <span>Төлөв</span>
            <span>Устгах</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <article key={order.id} className="grid gap-5 px-5 py-5 lg:grid-cols-[1.1fr_1fr_0.75fr_0.75fr_0.8fr_0.55fr] lg:items-start">
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

                <div>
                  <p className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                  <p className="mt-2 w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </p>
                  <Link href={`/admin/orders/${order.id}`} className="mt-3 inline-flex text-sm font-bold text-blue-600">
                    Дэлгэрэнгүй
                  </Link>
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
                  <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Хадгалах</button>
                </form>

                <details className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                  <summary className="cursor-pointer list-none text-sm font-bold text-red-600 [&::-webkit-details-marker]:hidden">
                    Устгах
                  </summary>
                  <form action={deleteOrder} className="mt-3">
                    <input type="hidden" name="id" value={order.id} />
                    <p className="mb-3 text-xs leading-5 text-red-700">Энэ захиалгыг бүр устгана.</p>
                    <button className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">
                      Бүр устгах
                    </button>
                  </form>
                </details>
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

function getPaymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    bank_transfer: "Дансаар",
    qpay: "QPay",
    socialpay: "SocialPay",
    storepay: "StorePay",
    cash_on_delivery: "Хүргэлтээр"
  };

  return labels[value] ?? value;
}
