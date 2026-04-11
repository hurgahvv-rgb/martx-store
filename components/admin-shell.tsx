"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Box,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  Settings,
  Shirt,
  Store,
  Users
} from "lucide-react";

const mainNav = [
  { href: "/admin", label: "Нүүр", icon: Home },
  { href: "/admin/orders", label: "Захиалга", icon: ClipboardList },
  { href: "/admin/products", label: "Бараа", icon: Package },
  { href: "/admin/products", label: "Ангилал", icon: Box },
  { href: "/admin/products", label: "Үлдэгдэл", icon: Shirt },
  { href: "/admin/orders", label: "Тайлан", icon: BarChart3 },
  { href: "/admin", label: "Хэрэглэгч", icon: Users },
  { href: "/admin", label: "Мэдэгдэл", icon: Bell }
];

const supportNav = [
  { href: "/admin", label: "Заавар", icon: HelpCircle },
  { href: "/admin", label: "Тохиргоо", icon: Settings },
  { href: "/admin", label: "Тусламж", icon: MessageSquare }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="admin-root min-h-screen bg-[#eef2f7]">{children}</div>;
  }

  return (
    <div className="admin-root min-h-screen bg-[#eef2f7] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 p-5">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-400">Салбар</p>
            <button className="mt-1 flex w-full items-center justify-between text-sm font-semibold">
              Бүгд
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Бараа</p>
            <div className="mt-2 space-y-1 pl-9 text-sm font-semibold text-slate-500">
              {["Ангилал", "Коллекц", "Барааны жагсаалт", "Барааны дэлгэрэнгүй", "Татан авалт", "Барааны шилжүүлэг", "Засвар", "Нийлүүлэгч", "Үйлдвэрлэгч", "Таг", "Тооллого"].map((item) => (
                <Link key={item} href="/admin/products" className="block rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-slate-900">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-100 p-3">
          {supportNav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Plus size={24} />
              </div>
              <div>
                <p className="text-xl font-bold">MartX</p>
                <p className="text-sm text-slate-500">martx.market.shop</p>
              </div>
              <Link
                href="/"
                className="ml-2 hidden rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:block"
              >
                Дэлгүүр үзэх
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-5 xl:flex">
              <div className="w-full max-w-xl rounded-xl border border-blue-400 bg-white px-5 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Одоогийн багц</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Туршилтын багц</span>
                </div>
                <div className="mt-1 text-xl font-semibold tracking-[0.08em]">2026-04-15</div>
              </div>
              <Link href="/admin/products" className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                + Бараа авах
              </Link>
            </div>

            <form action="/admin/logout" method="post">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                <LogOut size={17} />
                Гарах
              </button>
            </form>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
