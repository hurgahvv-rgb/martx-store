import Link from "next/link";
import { redirect } from "next/navigation";

import { createCustomerSession, getCustomerSession, verifyCustomerPassword } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const orders = [
  { id: "NR-1024", status: "Připravuje se", total: "4 380 Kč" },
  { id: "NR-1021", status: "Doručeno", total: "1 290 Kč" }
];

const errorMessages: Record<string, string> = {
  google_config: "Google přihlášení ještě není nastavené. Doplňte GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET a AUTH_SECRET.",
  google_state: "Přihlášení se nepodařilo ověřit. Zkuste to prosím znovu.",
  google_token: "Google přihlášení se nepodařilo dokončit. Zkuste to prosím znovu.",
  google_profile: "Z Google účtu se nepodařilo načíst ověřený e-mail.",
  invalid_credentials: "E-mail nebo heslo není správné.",
  password_required: "Tento účet zatím nemá nastavené heslo. Přihlaste se přes Google nebo si vytvořte nový účet.",
  magic_unavailable: "Odkaz na přihlášení zatím není aktivní. Použijte prosím Google nebo e-mail a heslo."
};

async function loginWithPassword(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/account?error=invalid_credentials");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, password: true }
  });

  if (!user?.password) {
    redirect("/account?error=password_required");
  }

  if (!verifyCustomerPassword(password, user.password)) {
    redirect("/account?error=invalid_credentials");
  }

  await createCustomerSession(user);
  redirect("/account");
}

export default async function AccountPage({ searchParams }: { searchParams?: Promise<{ error?: string; details?: string }> }) {
  const params = await searchParams;
  const error = params?.error
    ? `${errorMessages[params.error] ?? "Přihlášení se nepodařilo."}${params.details ? ` (${params.details})` : ""}`
    : null;
  const user = await getCustomerSession();

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <p className="section-title text-sm text-stone-500">Účet</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">Přihlášení</h1>
          <p className="mt-3 text-sm text-stone-600">Vítejte zpět.</p>

          {error ? <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

          <div className="mt-8 space-y-4">
            <Link
              href="/api/auth/google"
              className="flex h-12 w-full items-center justify-center border border-stone-200 bg-white text-sm font-semibold text-stone-950 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Pokračovat přes Google
            </Link>

            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              <span className="h-px flex-1 bg-stone-200" />
              Nebo
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            <form action={loginWithPassword} className="space-y-5">
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
                  required
                />
              </label>
              <button className="h-12 w-full bg-[#2a211d] text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black">
                Přihlásit se
              </button>
            </form>

            <Link
              href="/account?error=magic_unavailable"
              className="flex h-12 w-full items-center justify-center border border-stone-200 bg-white text-sm text-stone-950 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Poslat odkaz na přihlášení
            </Link>

            <p className="text-center text-sm text-stone-500">
              Nemáte účet?{" "}
              <Link href="/register" className="font-medium text-stone-950 underline underline-offset-4">
                Registrace
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title text-sm text-stone-500">Účet</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Můj účet</h1>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="border border-stone-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-stone-400">
            Odhlásit se
          </button>
        </form>
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel rounded-[2rem] p-6">
          <p className="text-lg font-semibold text-ink">{user.name || "Zákazník"}</p>
          <p className="mt-2 text-sm text-stone-600">{user.email}</p>
        </aside>
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="section-title text-sm text-stone-500">Objednávky</p>
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{order.id}</p>
                    <p className="text-sm text-stone-600">{order.status}</p>
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
