import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, PackageCheck, Truck } from "lucide-react";

import { SaveNotice } from "@/components/save-notice";
import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { getFile, saveOrderScreenshot } from "@/lib/order-media";
import { orderStatusLabels, orderStatuses } from "@/lib/order-status";
import { getPaymentStatusLabel, paymentStatuses } from "@/lib/payment-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentScreenshot: string | null;
  adminNote: string | null;
  paidAt: Date | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  shippingCity: string;
  shippingDistrict: string | null;
  shippingAddress: string;
  shippingNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productName: string;
    variant: string | null;
    quantity: number;
    price: number;
  }[];
};

async function updateOrderDetail(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!id || !orderStatuses.includes(status as never) || !paymentStatuses.includes(paymentStatus as never)) {
    return;
  }

  const screenshot = await saveOrderScreenshot(getFile(formData, "paymentScreenshot"));

  if (screenshot) {
    await prisma.$executeRaw`
      UPDATE "Order"
      SET
        status = ${status}::"OrderStatus",
        "paymentStatus" = ${paymentStatus},
        "paymentScreenshot" = ${screenshot},
        "adminNote" = ${adminNote || null},
        "paidAt" = CASE WHEN ${paymentStatus} = 'CONFIRMED' THEN COALESCE("paidAt", NOW()) ELSE "paidAt" END,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "Order"
      SET
        status = ${status}::"OrderStatus",
        "paymentStatus" = ${paymentStatus},
        "adminNote" = ${adminNote || null},
        "paidAt" = CASE WHEN ${paymentStatus} = 'CONFIRMED' THEN COALESCE("paidAt", NOW()) ELSE "paidAt" END,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?saved=1`);
}

async function getOrder(id: string) {
  try {
    const rows = await prisma.$queryRaw<OrderDetail[]>`
      SELECT
        o.id,
        o."orderNumber",
        o.status::text AS status,
        o."paymentStatus",
        o."paymentScreenshot",
        o."adminNote",
        o."paidAt",
        o.subtotal,
        o."shippingFee",
        o.total,
        o."paymentMethod",
        o."customerName",
        o."customerEmail",
        o."customerPhone",
        o."shippingCity",
        o."shippingDistrict",
        o."shippingAddress",
        o."shippingNotes",
        o."createdAt",
        o."updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'productName', i."productName",
              'variant', i.variant,
              'quantity', i.quantity,
              'price', i.price
            )
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) AS items
      FROM "Order" o
      LEFT JOIN "OrderItem" i ON i."orderId" = o.id
      WHERE o.id = ${id}
      GROUP BY o.id
      LIMIT 1
    `;

    return { connected: true, order: rows[0] ?? null };
  } catch {
    return { connected: false, order: null };
  }
}

export default async function AdminOrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const query = await searchParams;
  const { connected, order } = await getOrder(id);

  if (!connected) {
    return <Notice text="Database холбогдоогүй байна." />;
  }

  if (!order) {
    return <Notice text="Захиалга олдсонгүй." />;
  }

  const timeline = [
    { label: "Захиалга ирсэн", value: formatDate(order.createdAt), icon: Clock3, done: true },
    { label: "Төлбөр", value: getPaymentStatusLabel(order.paymentStatus), icon: CreditCard, done: order.paymentStatus === "CONFIRMED" },
    { label: "Бэлтгэл", value: orderStatusLabels[order.status as keyof typeof orderStatusLabels], icon: PackageCheck, done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) },
    { label: "Хүргэлт", value: orderStatusLabels[order.status as keyof typeof orderStatusLabels], icon: Truck, done: ["SHIPPED", "DELIVERED"].includes(order.status) }
  ];

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600">
          <ArrowLeft size={16} />
          Захиалга руу буцах
        </Link>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Order detail</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-500">{formatDate(order.createdAt)} үүссэн захиалга</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={orderStatusLabels[order.status as keyof typeof orderStatusLabels]} tone="blue" />
            <Badge label={getPaymentStatusLabel(order.paymentStatus)} tone={order.paymentStatus === "CONFIRMED" ? "green" : "amber"} />
          </div>
        </div>

        {query.saved ? (
          <SaveNotice message="Захиалгын өөрчлөлт амжилттай хадгалагдлаа." />
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {timeline.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                    <p className="mt-2 text-sm font-bold text-slate-950">{item.value}</p>
                  </div>
                  <span className={item.done ? "text-emerald-600" : "text-slate-300"}>
                    {item.done ? <CheckCircle2 size={21} /> : <Icon size={21} />}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Бараанууд</h2>
              <div className="mt-5 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_90px_140px] md:items-center">
                    <div>
                      <p className="font-bold text-slate-950">{item.productName}</p>
                      <p className="mt-1 text-slate-500">{item.variant || "Сонголтгүй"}</p>
                    </div>
                    <p className="font-semibold text-slate-700">{item.quantity}ш</p>
                    <p className="font-bold text-slate-950">{formatPrice(item.price * item.quantity, "MNT")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
                <SummaryRow label="Барааны дүн" value={formatPrice(order.subtotal, "MNT")} />
                <SummaryRow label="Хүргэлт" value={formatPrice(order.shippingFee, "MNT")} />
                <SummaryRow label="Нийт" value={formatPrice(order.total, "MNT")} strong />
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Төлбөр баталгаажуулах</h2>
              <form action={updateOrderDetail} encType="multipart/form-data" className="mt-5 space-y-5">
                <input type="hidden" name="id" value={order.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Захиалгын төлөв">
                    <select name="status" defaultValue={order.status} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500">
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {orderStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Төлбөрийн төлөв">
                    <select name="paymentStatus" defaultValue={order.paymentStatus} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500">
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getPaymentStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Payment screenshot">
                  <input name="paymentScreenshot" type="file" accept="image/*" className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm" />
                </Field>

                {order.paymentScreenshot ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Одоогийн screenshot</p>
                    <img src={order.paymentScreenshot} alt="Payment screenshot" className="max-h-80 rounded-lg border border-slate-200 bg-white object-contain" />
                  </div>
                ) : null}

                <Field label="Admin note">
                  <textarea name="adminNote" defaultValue={order.adminNote ?? ""} className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
                </Field>

                <div className="flex justify-end">
                  <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                    Захиалгыг хадгалах
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Хэрэглэгч</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Info label="Нэр" value={order.customerName} />
                <Info label="Утас" value={order.customerPhone} />
                <Info label="И-мэйл" value={order.customerEmail ?? "email байхгүй"} />
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Хүргэлт</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Info label="Хот/Аймаг" value={order.shippingCity} />
                <Info label="Дүүрэг/Сум" value={order.shippingDistrict ?? "-"} />
                <Info label="Хаяг" value={order.shippingAddress} />
                {order.shippingNotes ? <Info label="Тайлбар" value={order.shippingNotes} /> : null}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Төлбөр</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Info label="Арга" value={getPaymentMethodLabel(order.paymentMethod)} />
                <Info label="Төлөв" value={getPaymentStatusLabel(order.paymentStatus)} />
                <Info label="Баталгаажсан" value={order.paidAt ? formatDate(order.paidAt) : "-"} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between text-lg font-bold text-slate-950" : "flex justify-between text-slate-600"}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "blue" | "green" | "amber" }) {
  const className = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700"
  }[tone];

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}

function Notice({ text }: { text: string }) {
  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{text}</div>
    </section>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function getPaymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    bank_transfer: "Дансаар шилжүүлэх",
    qpay: "QPay",
    socialpay: "SocialPay",
    storepay: "StorePay",
    cash_on_delivery: "Хүргэлтийн үед төлөх"
  };

  return labels[value] ?? value;
}
