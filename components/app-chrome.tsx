"use client";

import { usePathname } from "next/navigation";

import { InstallAppBanner } from "@/components/install-app-banner";
import { MobileAppNav } from "@/components/mobile-app-nav";
import { ServiceHighlights } from "@/components/service-highlights";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <ServiceHighlights />
      <SiteFooter />
      <InstallAppBanner />
      <MobileAppNav />
    </>
  );
}
