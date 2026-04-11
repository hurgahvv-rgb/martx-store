const orders = [
  { id: "MX-1024", status: "Бэлтгэж байна", total: "438,000 ₮" },
  { id: "MX-1021", status: "Хүргэгдсэн", total: "129,000 ₮" }
];

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="section-title text-sm text-slate-500">Хэрэглэгч</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Миний бүртгэл</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel rounded-[2rem] p-6">
          <p className="text-lg font-semibold text-ink">Bat-Erdene</p>
          <p className="mt-2 text-sm text-slate-600">bat@example.com</p>
        </aside>
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="section-title text-sm text-slate-500">Захиалгууд</p>
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{order.id}</p>
                    <p className="text-sm text-slate-600">{order.status}</p>
                  </div>
                  <p className="font-semibold text-pine">{order.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
