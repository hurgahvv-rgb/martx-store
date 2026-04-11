import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/admin-auth";

export async function POST() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function GET(request: NextRequest) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
