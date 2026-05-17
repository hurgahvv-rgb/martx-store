"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Box,
  ClipboardList,
  Home,
  LogOut,
  Package,
  Plus,
  Settings,
  Shirt,
  Users
} from "lucide-react";

const mainNav = [
  { href: "/admin", label: "Нүүр", icon: Home },
  { href: "/admin/orders", label: "Захиалга", icon: ClipboardList },
  { href: "/admin/products", label: "Бараа", icon: Package },
  { href: "/admin/categories", label: "Ангилал", icon: Box },
  { href: "/admin/inventory", label: "Үлдэгдэл", icon: Shirt },
  { href: "/admin/reports", label: "Тайлан", icon: BarChart3 },
  { href: "/admin/customers", label: "Хэрэглэгч", icon: Users },
  { href: "/admin/notifications", label: "Мэдэгдэл", icon: Bell },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings }
];

const notificationSeenKey = "martx-admin-notifications-seen-at";

type StoreProfile = {
  storeName: string;
  storeSubtitle: string;
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [pendingOrders, setPendingOrders] = useState(0);
  const [profile, setProfile] = useState<StoreProfile>({ storeName: "MartX", storeSubtitle: "martx.market.shop" });

  useEffect(() => {
    if (isLogin) {
      return;
    }

    let active = true;

    async function loadNotificationCount() {
      try {
        const response = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          pendingOrders?: number;
          pendingOrderEvents?: { id: string; createdAt: string }[];
        };
        if (active) {
          const seenAt = Number(window.localStorage.getItem(notificationSeenKey) ?? 0);
          const unreadOrders =
            data.pendingOrderEvents?.filter((order) => new Date(order.createdAt).getTime() > seenAt).length ?? data.pendingOrders ?? 0;

          setPendingOrders(unreadOrders);
        }
      } catch {
        // Notification badge should never block the admin UI.
      }
    }

    loadNotificationCount();
    const interval = window.setInterval(loadNotificationCount, 30000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isLogin]);

  useEffect(() => {
    if (isLogin || pathname !== "/admin/notifications") {
      return;
    }

    window.localStorage.setItem(notificationSeenKey, String(Date.now()));
    setPendingOrders(0);
  }, [isLogin, pathname]);

  useEffect(() => {
    if (isLogin) {
      return;
    }

    let active = true;

    async function loadStoreProfile() {
      try {
        const response = await fetch("/api/settings/store", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as StoreProfile;
        if (active) {
          setProfile(data);
        }
      } catch {
        // Admin shell can keep the default profile text.
      }
    }

    loadStoreProfile();

    return () => {
      active = false;
    };
  }, [isLogin]);

  if (isLogin) {
    return <div className="admin-root min-h-screen bg-[#eef2f7]">{children}</div>;
  }

  return (
    <div className="admin-root min-h-screen bg-[#eef2f7] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
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
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/admin/notifications" && pendingOrders > 0 ? (
                    <span className="min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
                      {pendingOrders > 99 ? "99+" : pendingOrders}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 border-t border-slate-100 px-4 pt-5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Дэлгүүр харах
            </Link>
          </div>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Plus size={24} />
              </div>
              <div>
                <p className="text-xl font-bold">{profile.storeName}</p>
                <p className="text-sm text-slate-500">{profile.storeSubtitle}</p>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-3 xl:flex">
              <Link href="/admin/products?new=1" className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                + Бараа нэмэх
              </Link>
            </div>

            <Link
              href="/admin/notifications"
              className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Мэдэгдэл"
            >
              <Bell size={19} />
              {pendingOrders > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                  {pendingOrders > 99 ? "99+" : pendingOrders}
                </span>
              ) : null}
            </Link>

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
