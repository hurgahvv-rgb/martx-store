type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: {
    title: string;
    body: string;
  }[];
};

export function InfoPage({ eyebrow, title, description, sections }: InfoPageProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-title text-sm text-stone-500">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-8 text-stone-600">{description}</p>
      </div>

      <div className="mt-12 grid gap-5">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-card"
          >
            <h2 className="text-xl font-semibold text-stone-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
