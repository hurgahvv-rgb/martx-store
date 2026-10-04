"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "sending" | "success" | "error";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        comment: String(formData.get("comment") ?? "")
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data?.error ?? "Odeslání se nepodařilo. Zkuste to prosím znovu za chvíli.");
      return;
    }

    form.reset();
    setStatus("success");
    setMessage("Vaše zpráva byla odeslána. Brzy se vám ozveme.");
  }

  return (
    <section className={compact ? "mt-8" : "mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8"}>
      <form onSubmit={handleSubmit} className={compact ? "grid gap-5" : "mx-auto grid max-w-3xl gap-5"}>
        <div className="grid gap-5 sm:grid-cols-2">
          <input
            name="name"
            type="text"
            placeholder={compact ? "Jméno *" : "Jméno"}
            className="h-14 border border-stone-300 bg-white px-5 text-sm text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-stone-950"
          />
          <input
            name="email"
            type="email"
            placeholder="E-mail *"
            required
            className="h-14 border border-stone-300 bg-white px-5 text-sm text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-stone-950"
          />
        </div>

        <input
          name="phone"
          type="tel"
          placeholder="Telefon"
          className="h-14 border border-stone-300 bg-white px-5 text-sm text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-stone-950"
        />

        <textarea
          name="comment"
          placeholder="Zpráva"
          required
          rows={5}
          className="min-h-32 resize-y border border-stone-300 bg-white px-5 py-4 text-sm text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-stone-950"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === "sending"}
            className={
              compact
                ? "inline-flex h-14 items-center justify-center bg-[#2d241f] px-8 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
                : "inline-flex h-14 w-36 items-center justify-center bg-stone-950 px-6 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            }
          >
            {status === "sending" ? "Odesílám" : compact ? "Odeslat zprávu" : "Odeslat"}
          </button>

          {message ? (
            <p className={["text-sm", status === "error" ? "text-red-600" : "text-stone-600"].join(" ")}>
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
