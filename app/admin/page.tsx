const adminSections = [
  "Бараа болон ангилал удирдах",
  "Үлдэгдэл, нөөцийн анхааруулга",
  "Захиалга болон хүргэлтийн төлөв",
  "Хямдрал, купоны удирдлага",
  "Хэрэглэгчийн дэмжлэгийн самбар"
];

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="section-title text-sm text-slate-500">Удирдлага</p>
          <h1 className="text-4xl font-semibold text-ink">Админ хэсгийн төлөвлөгөө</h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600">
            Энэ бүтэц нь storefront-оо хэрэглэгчийн хэсгээс салгаж өгсөн тул нэвтрэх систем
            нэмсний дараа хамгаалалттай жинхэнэ admin dashboard холбохөд амархан.
          </p>
        </div>
        <div className="glass-panel rounded-[2rem] p-6">
          <ul className="space-y-4 text-sm leading-7 text-slate-700">
            {adminSections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
