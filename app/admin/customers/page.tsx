import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCustomers() {
  try {
    const customerList = await prisma.$queryRaw<
      { name: string; phone: string; email: string | null; orders: number; total: number; lastOrderAt: Date }[]
    >`
      SELECT
        (array_agg("customerName" ORDER BY "createdAt" DESC))[1] AS name,
        "customerPhone" AS phone,
        (array_agg("customerEmail" ORDER BY "createdAt" DESC))[1] AS email,
        COUNT(*)::int AS orders,
        COALESCE(SUM(total), 0)::int AS total,
        MAX("createdAt") AS "lastOrderAt"
      FROM "Order"
      GROUP BY "customerPhone"
      ORDER BY total DESC
      LIMIT 100
    `;
    const totalRevenue = customerList.reduce((sum, customer) => sum + customer.total, 0);
    const repeatCustomers = customerList.filter((customer) => customer.orders > 1).length;

    return { connected: true, customers: customerList, totalRevenue, repeatCustomers };
  } catch {
    return { connected: false, customers: [], totalRevenue: 0, repeatCustomers: 0 };
  }
}

export default async function AdminCustomersPage() {
  await requireAdminSession();
  const data = await getCustomers();

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Customers</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Хэрэглэгч</h1>
          <p className="mt-2 text-sm text-slate-500">Захиалга өгсөн хэрэглэгчдийн худалдан авалтын товч бүртгэл.</p>
        </div>

        {!data.connected ? <Notice /> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Нийт хэрэглэгч" value={data.customers.length} />
          <StatCard label="Давтан авалттай" value={data.repeatCustomers} />
          <StatCard label="Нийт худалдан авалт" value={formatPrice(data.totalRevenue, "MNT")} />
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="hidden grid-cols-[1fr_140px_160px_150px] border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-500 md:grid">
            <span>Хэрэглэгч</span>
            <span>Захиалга</span>
            <span>Нийт дүн</span>
            <span>Сүүлийн авалт</span>
          </div>
          {data.customers.map((customer) => (
            <article key={customer.phone} className="grid gap-3 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_140px_160px_150px] md:items-center">
              <div>
                <h2 className="font-bold text-slate-950">{customer.name}</h2>
                <p className="mt-1 text-slate-500">
                  {customer.phone}
                  {customer.email ? ` · ${customer.email}` : ""}
                </p>
              </div>
              <span className="font-semibold text-slate-900">{customer.orders}</span>
              <span className="font-bold text-slate-950">{formatPrice(customer.total, "MNT")}</span>
              <span className="text-slate-500">{customer.lastOrderAt.toLocaleDateString("mn-MN")}</span>
            </article>
          ))}

          {data.connected && data.customers.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">Одоогоор хэрэглэгчийн захиалга байхгүй байна.</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </article>
  );
}

function Notice() {
  return <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Database холбогдоогүй байна.</div>;
}
