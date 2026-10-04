import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";

const highlights = [
  {
    title: "RUČNÍ VÝROBA",
    description: "Produkty vznikají v malých sériích s důrazem na detail a materiál.",
    icon: Truck
  },
  {
    title: "KVALITNÍ KŮŽE",
    description: "Používáme přírodní materiály, které časem získávají charakter.",
    icon: BadgeCheck
  },
  {
    title: "PÉČE O PRODUKT",
    description: "Ke každému produktu najdete jednoduché doporučení k údržbě.",
    icon: ShieldCheck
  },
  {
    title: "PODPORA",
    description: "S výběrem, objednávkou nebo péčí o kůži vám rádi poradíme.",
    icon: Headphones
  }
];

export function ServiceHighlights() {
  return (
    <section className="public-shell border-t border-stone-200 bg-[#f7f4ee]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="rounded-[1.6rem] bg-white px-5 py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-xs font-semibold tracking-[0.18em] text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
