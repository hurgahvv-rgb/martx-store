import { redirect } from "next/navigation";

import { createAdminSession, isAdminSessionValid, validateAdminLogin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function loginAdmin(formData: FormData) {
  "use server";

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateAdminLogin(username, password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminSessionValid()) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
        <div className="bg-slate-950 px-8 py-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-blue-200">MartX Admin</p>
          <h1 className="mt-3 text-3xl font-bold">Удирдлагын хэсэг</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Захиалга, бараа, үлдэгдлээ нэг газраас хянахын тулд нэвтэрнэ үү.
          </p>
        </div>

        <form action={loginAdmin} className="space-y-5 p-8">
          {params.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              Нэвтрэх нэр эсвэл нууц үг буруу байна.
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Нэвтрэх нэр</span>
            <input
              name="username"
              autoComplete="username"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="admin"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Нууц үг</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="••••••••"
              required
            />
          </label>

          <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            Нэвтрэх
          </button>

          <p className="text-center text-xs leading-5 text-slate-400">
            Нэвтрэх мэдээллийг Vercel Environment Variables дээр `ADMIN_USERNAME`, `ADMIN_PASSWORD` гэж солино.
          </p>
        </form>
      </div>
    </main>
  );
}
