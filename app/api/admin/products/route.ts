import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яө үүё-]+/gi, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: String(body.slug ?? "").trim() || slugify(name),
      category: String(body.category ?? "Ерөнхий"),
      description: String(body.description ?? ""),
      price: Number(body.price ?? 0),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
      currency: "MNT",
      image: String(body.image ?? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"),
      stock: Number(body.stock ?? 0),
      isFeatured: Boolean(body.isFeatured),
      isActive: body.isActive ?? true
    }
  });

  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: String(body.id) },
    data: {
      name: body.name === undefined ? undefined : String(body.name),
      slug: body.slug === undefined ? undefined : String(body.slug),
      category: body.category === undefined ? undefined : String(body.category),
      description: body.description === undefined ? undefined : String(body.description),
      price: body.price === undefined ? undefined : Number(body.price),
      compareAtPrice: body.compareAtPrice === undefined || body.compareAtPrice === "" ? undefined : Number(body.compareAtPrice),
      image: body.image === undefined ? undefined : String(body.image),
      stock: body.stock === undefined ? undefined : Number(body.stock),
      isFeatured: body.isFeatured === undefined ? undefined : Boolean(body.isFeatured),
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive)
    }
  });

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
