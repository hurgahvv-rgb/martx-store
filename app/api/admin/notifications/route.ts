import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({
    pendingOrders: pendingOrders.length,
    pendingOrderEvents: pendingOrders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt.toISOString()
    }))
  });
}
