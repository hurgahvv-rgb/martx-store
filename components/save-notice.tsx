"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SaveNotice({ message }: { message: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("saved");
      const nextQuery = nextParams.toString();

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams]);

  if (!visible) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
      {message}
    </div>
  );
}
