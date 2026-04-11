import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { orderStatuses } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });

  return NextResponse.json({ orders });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; status?: string };

  if (!body.id || !body.status || !orderStatuses.includes(body.status as never)) {
    return NextResponse.json({ error: "Invalid order status request" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: body.id },
    data: { status: body.status as never },
    include: { items: true }
  });

  return NextResponse.json({ order });
}
