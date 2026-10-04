import { ContactForm as ContactMessageForm } from "@/components/contact-form";
import { WithdrawalForm as WithdrawalMessageForm } from "@/components/withdrawal-form";
import { InfoPageContent } from "@/lib/info-pages";

export function PolicyPage({ page }: { page: InfoPageContent }) {
  return (
    <section className="public-shell bg-white">
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Informace</p>
        <h1 className="font-serif text-5xl font-normal tracking-tight text-stone-950">{page.title}</h1>
        {page.intro ? <p className="mt-8 text-base leading-8 text-stone-600">{page.intro}</p> : null}

        <div className="mt-12 space-y-11">
          {page.blocks.map((block, index) => (
            <section
              key={`${block.title ?? "block"}-${index}`}
              className={
                block.variant === "callout"
                  ? "border border-stone-300 px-6 py-7"
                  : block.variant === "note"
                    ? "bg-[#e8ded0] px-5 py-4"
                  : "border-t border-stone-200 pt-8"
              }
            >
              {block.eyebrow ? (
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9f8767]">
                  {block.eyebrow}
                </p>
              ) : null}
              {block.title ? <h2 className="text-2xl font-medium text-stone-950">{block.title}</h2> : null}
              {block.body?.map((paragraph) => (
                <p key={paragraph} className="mt-5 text-sm leading-8 text-stone-600">
                  {paragraph}
                </p>
              ))}
              {block.bullets ? (
                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-stone-600">
                  {block.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {block.actions ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {block.actions.map((action) => (
                    <a
                      key={action.label}
                      href={action.href}
                      className={
                        action.tone === "secondary"
                          ? "border border-stone-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 transition hover:border-stone-950 hover:text-stone-950"
                          : "border border-stone-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-950 transition hover:bg-stone-950 hover:text-white"
                      }
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
        {page.form === "withdrawal" ? <WithdrawalMessageForm /> : null}
        {page.form === "contact" ? <ContactSection /> : null}
      </article>
    </section>
  );
}

function ContactSection() {
  return (
    <>
      <ContactMessageForm compact />

      <div className="mt-8 border-t border-stone-200 pt-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <ContactCard label="E-mail" value="narastore.help@gmail.com" href="mailto:narastore.help@gmail.com" />
          <ContactCard label="Telefon" value="+420 736 924 533" href="tel:+420736924533" />
        </div>
      </div>
    </>
  );
}

function ContactCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a href={href} className="block min-w-0 bg-stone-50 px-5 py-6 transition hover:bg-stone-100">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{label}</p>
      <p className="mt-4 break-words font-serif text-xl text-stone-950">{value}</p>
    </a>
  );
}

function WithdrawalForm() {
  return (
    <form className="mt-8 space-y-6">
      <div className="border border-[#d8c8b9] px-5 py-4 text-sm leading-7 text-stone-600">
        <strong className="font-semibold text-stone-950">Máte u nás účet?</strong>{" "}
        Přihlášeným zákazníkům hned po odeslání tohoto formuláře vydáme kód na vrácení - štítek netisknete a zpětné poštovné platíme my.{" "}
        <a href="/account" className="underline">
          Přihlásit se
        </a>
      </div>

      <PolicyInput label="Číslo objednávky *" placeholder="např. 2606051847" />
      <PolicyInput label="Jméno a příjmení *" />
      <div className="grid gap-5 sm:grid-cols-2">
        <PolicyInput label="E-mail *" />
        <PolicyInput label="Telefon" />
      </div>
      <PolicyInput label="Ulice a číslo *" />
      <div className="grid gap-5 sm:grid-cols-3">
        <PolicyInput label="PSČ *" />
        <PolicyInput label="Město *" />
        <PolicyInput label="Země *" defaultValue="Česko" />
      </div>
      <PolicyInput label="IBAN pro vrácení platby *" placeholder="CZ00 0000 0000 0000 0000 0000" />
      <PolicyTextarea label="Zboží, kterého se odstoupení týká *" placeholder="Název produktu / produkty" />
      <div className="grid gap-5 sm:grid-cols-2">
        <PolicyInput label="Datum objednání" type="date" />
        <PolicyInput label="Datum převzetí zboží" type="date" />
      </div>
      <PolicyTextarea label="Důvod (nepovinné)" />

      <button
        type="button"
        className="w-full bg-[#2d241f] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black"
      >
        Potvrdit odstoupení od smlouvy
      </button>
      <p className="text-xs leading-6 text-stone-500">
        Pole označená hvězdičkou jsou povinná. Po odeslání vám na e-mail pošleme potvrzení o přijetí s datem a časem. Zboží neposílejte na dobírku.
      </p>

      <div className="border-t border-stone-200 pt-8">
        <a href="/info/obchodni-podminky" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-950 underline">
          Obchodní podmínky
        </a>
      </div>
    </form>
  );
}

function PolicyInput({
  label,
  placeholder,
  type = "text",
  defaultValue
}: {
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-950"
      />
    </label>
  );
}

function PolicyTextarea({ label, placeholder, large = false }: { label: string; placeholder?: string; large?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <textarea
        placeholder={placeholder}
        className={`${large ? "min-h-36" : "min-h-24"} mt-2 w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950`}
      />
    </label>
  );
}
