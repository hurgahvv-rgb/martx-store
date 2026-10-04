import Link from "next/link";

const infoLinks = [
  { label: "Doprava a platba", href: "/info/doprava" },
  { label: "Vrácení", href: "/info/vraceni" },
  { label: "Odstoupení od smlouvy", href: "/info/odstoupeni" },
  { label: "Péče o kůži", href: "/info/starostlivost" },
  { label: "Obchodní podmínky", href: "/info/obchodni-podminky" },
  { label: "Ochrana osobních údajů", href: "/info/ochrana-osobnich-udaju" },
  { label: "Kontakt", href: "/info/kontakt" }
];

const brandLinks = [
  { label: "Náš příběh", href: "/about" },
  { label: "Kolekce", href: "/products?filter=featured" },
  { label: "Ateliér", href: "/about" }
];

export function SiteFooter() {
  return (
    <footer className="public-shell bg-[#161311] text-[#f7f1e8]">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.35fr_0.9fr_0.75fr]">
          <div className="space-y-8">
            <div>
              <Link href="/" className="text-3xl font-bold tracking-[0.08em] text-[#f8efe3]">
                NaRa
              </Link>
              <p className="mt-7 max-w-60 text-sm font-medium leading-7 text-[#e8d9c7]">
                Navržené a ručně šité v ateliéru z poctivé kůže.
              </p>
            </div>

            <div className="space-y-2 text-sm leading-6 text-[#e8d9c7]">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9f8767]">Provozovatel</p>
              <p>LSHK lab s. r. o.</p>
              <p>Ratibořská 751/32, Bohnice, Praha 8, Česká republika</p>
              <p>IČO: 55602088</p>
              <p>+420 736 924 533</p>
              <p>narastore.help@gmail.com</p>
            </div>
          </div>

          <FooterColumn title="Info" links={infoLinks} />
          <FooterColumn title="Značka" links={brandLinks} />
        </div>

        <div className="mt-14 border-t border-[#9f8767]/35 pt-8">
          <div className="grid gap-6 text-xs text-[#b7a999] md:grid-cols-3 md:items-center">
            <p>© 2026 NaRa. Všechna práva vyhrazena.</p>
            <div className="flex items-center gap-4 md:justify-center">
              <span className="font-bold italic text-[#f8efe3]">VISA</span>
              <span className="relative inline-flex h-4 w-8 items-center">
                <span className="absolute left-0 h-4 w-4 rounded-full bg-[#eb001b]" />
                <span className="absolute right-0 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-screen" />
              </span>
            </div>
            <p className="font-semibold uppercase tracking-[0.22em] md:text-right">100% ruční práce</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9f8767]">{title}</p>
      <nav className="mt-7 grid gap-5 text-sm font-medium text-[#e8d9c7]">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="transition hover:text-[#f8efe3]">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
