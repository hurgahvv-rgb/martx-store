const categories = [
  {
    name: "Хувцас",
    description: "Ноолуур, гадуур хувцас, өдөр тутмын premium загварууд."
  },
  {
    name: "Гэр ахуй",
    description: "Үнэртэн, керамик болон өдөр тутмын тав тух нэмэх бүтээгдэхүүн."
  },
  {
    name: "Цүнх",
    description: "Аялал, ажил, амралтад тохирсон загварлаг сонголтууд."
  }
];

export default function CategoriesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <p className="section-title text-sm text-slate-500">Ангилал</p>
        <h1 className="text-4xl font-semibold text-ink">Ангиллаар сонгох</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.name}
            className="glass-panel rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1"
          >
            <p className="section-title text-sm text-slate-500">Ангилал</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">{category.name}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
