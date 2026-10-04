import Link from "next/link";
import { redirect } from "next/navigation";

import { createCustomerSession, hashCustomerPassword } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const errorMessages: Record<string, string> = {
  missing_fields: "Vyplňte prosím e-mail a heslo.",
  short_password: "Heslo musí mít alespoň 8 znaků.",
  user_exists: "Účet s tímto e-mailem už existuje. Přihlaste se prosím."
};

async function registerWithPassword(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/register?error=missing_fields");
  }

  if (password.length < 8) {
    redirect("/register?error=short_password");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    redirect("/register?error=user_exists");
  }

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashCustomerPassword(password),
      role: "customer"
    },
    select: { id: true, email: true, name: true }
  });

  await createCustomerSession(user);
  redirect("/account");
}

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error ? errorMessages[params.error] : null;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <p className="section-title text-sm text-stone-500">Účet</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Registrace</h1>
        <p className="mt-3 text-sm text-stone-600">Vytvořte si účet pro rychlejší nákupy a přehled objednávek.</p>

        {error ? <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

        <form action={registerWithPassword} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Jméno</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vas@email.cz"
              className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Heslo</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="alespoň 8 znaků"
              className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
              required
            />
          </label>
          <button className="h-12 w-full bg-[#2a211d] text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black">
            Vytvořit účet
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Už máte účet?{" "}
          <Link href="/account" className="font-medium text-stone-950 underline underline-offset-4">
            Přihlášení
          </Link>
        </p>
      </div>
    </section>
  );
}
