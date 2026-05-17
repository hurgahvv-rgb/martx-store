"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingText,
  className
}: {
  children: ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className ?? ""} disabled:cursor-wait disabled:opacity-70`}>
      {pending ? pendingText : children}
    </button>
  );
}
