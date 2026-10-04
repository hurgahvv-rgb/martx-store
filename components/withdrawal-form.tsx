"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "sending" | "success" | "error";

export function WithdrawalForm() {
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/withdrawal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data?.error ?? "Odeslání se nepodařilo. Zkuste to prosím znovu.");
      return;
    }

    form.reset();
    setStatus("success");
    setMessage("Formulář byl odeslán. Potvrzení najdete ve svém e-mailu.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="border border-[#d8c8b9] px-5 py-4 text-sm leading-7 text-stone-600">
        <strong className="font-semibold text-stone-950">Máte u nás účet?</strong>{" "}
        Přihlášeným zákazníkům hned po odeslání tohoto formuláře vydáme kód na vrácení - štítek netisknete a zpětné poštovné platíme my.{" "}
        <a href="/account" className="underline">
          Přihlásit se
        </a>
      </div>

      <PolicyInput label="Číslo objednávky *" name="orderNumber" placeholder="např. 2606051847" required />
      <PolicyInput label="Jméno a příjmení *" name="customerName" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <PolicyInput label="E-mail *" name="email" type="email" required />
        <PolicyInput label="Telefon" name="phone" />
      </div>
      <PolicyInput label="Ulice a číslo *" name="street" required />
      <div className="grid gap-5 sm:grid-cols-3">
        <PolicyInput label="PSČ *" name="postalCode" required />
        <PolicyInput label="Město *" name="city" required />
        <PolicyInput label="Země *" name="country" defaultValue="Česko" required />
      </div>
      <PolicyInput label="IBAN pro vrácení platby *" name="iban" placeholder="CZ00 0000 0000 0000 0000 0000" required />
      <PolicyTextarea label="Zboží, kterého se odstoupení týká *" name="products" placeholder="Název produktu / produkty" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <PolicyInput label="Datum objednání" name="orderedAt" type="date" />
        <PolicyInput label="Datum převzetí zboží" name="receivedAt" type="date" />
      </div>
      <PolicyTextarea label="Důvod (nepovinné)" name="reason" />

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-[#2d241f] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {status === "sending" ? "Odesílám" : "Potvrdit odstoupení od smlouvy"}
        </button>
        {message ? (
          <p className={["text-sm", status === "error" ? "text-red-600" : "text-stone-600"].join(" ")}>
            {message}
          </p>
        ) : null}
      </div>

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
  name,
  placeholder,
  type = "text",
  defaultValue,
  required = false
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-950"
      />
    </label>
  );
}

function PolicyTextarea({
  label,
  name,
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        className="mt-2 min-h-24 w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
      />
    </label>
  );
}
