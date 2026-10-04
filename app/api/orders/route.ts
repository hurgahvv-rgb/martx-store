import { NextResponse } from "next/server";

import { CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

type OrderRequest = {
  orderCode: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    address: string;
  };
  paymentMethod?: string;
  items: CartItem[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createOrderCode() {
  return `MX-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
}

function getVariantLabel(variant: { color: string | null; size: string | null } | null, fallback: string) {
  if (!variant) {
    return fallback || "Standard";
  }

  return [variant.color, variant.size].filter(Boolean).join(" / ") || fallback || "Standard";
}

async function verifyOrder(order: OrderRequest): Promise<OrderRequest> {
  const settings = await getStoreSettings();
  const incomingItems = Array.isArray(order.items) ? order.items : [];

  if (incomingItems.length === 0) {
    throw new Error("Košík je prázdný.");
  }

  if (incomingItems.length > 50) {
    throw new Error("V jedné objednávce je příliš mnoho položek.");
  }

  const productIds = Array.from(new Set(incomingItems.map((item) => item.productId).filter(Boolean)));
  const slugs = Array.from(new Set(incomingItems.map((item) => item.slug).filter(Boolean)));

  if (productIds.length === 0 && slugs.length === 0) {
    throw new Error("V košíku je nerozpoznaný produkt.");
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        ...(productIds.length ? [{ id: { in: productIds } }] : []),
        ...(slugs.length ? [{ slug: { in: slugs } }] : [])
      ]
    },
    include: {
      variants: {
        where: { isActive: true }
      }
    }
  });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  const verifiedItems = incomingItems.map((item) => {
    const product = productsById.get(item.productId) ?? productsBySlug.get(item.slug);
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 0)));

    if (!product) {
      throw new Error("V košíku je neaktivní nebo nedostupný produkt.");
    }

    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) ?? null : null;
    const availableStock = variant ? variant.stock : product.stock;

    if (quantity > availableStock) {
      throw new Error(`Produkt ${product.name} není skladem v požadovaném množství.`);
    }

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: variant?.price ?? product.price,
      currency: product.currency,
      image: variant?.image ?? product.image,
      variantId: variant?.id,
      variant: getVariantLabel(variant, item.variant),
      quantity
    };
  });
  const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const qualifiesForFreeShipping = settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold;
  const isUlaanbaatar = order.customer.city === "Ulaanbaatar";
  const shippingFee = qualifiesForFreeShipping ? 0 : isUlaanbaatar ? settings.shippingUlaanbaatarFee : settings.shippingProvinceFee;

  return {
    ...order,
    orderCode: createOrderCode(),
    items: verifiedItems,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee
  };
}

async function saveOrder(order: OrderRequest) {
  return prisma.$transaction(async (tx) => {
    const savedOrder = await tx.order.create({
      data: {
        orderNumber: order.orderCode,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        paymentMethod: order.paymentMethod || "bank_transfer",
        customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim() || "Jméno neuvedeno",
        customerEmail: order.customer.email || null,
        customerPhone: order.customer.phone,
        shippingCity: order.customer.city,
        shippingDistrict: order.customer.district || null,
        shippingAddress: order.customer.address,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId || undefined,
            productName: item.name,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant
          .updateMany({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
          .catch(() => null);
      }

      await tx.product
        .updateMany({
          where: { slug: item.slug },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
        .catch(() => null);
    }

    return savedOrder;
  });
}

async function renderOrderEmail(order: OrderRequest, savedToDatabase: boolean) {
  const settings = await getStoreSettings();
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
  const paymentMethod = settings.paymentMethods.find((method) => method.id === order.paymentMethod);
  const paymentAccounts = settings.paymentAccounts.filter((account) => account.isActive);
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(item.variant)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${formatPrice(item.price * item.quantity, item.currency)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="margin: 0 0 12px;">Nová objednávka: ${escapeHtml(order.orderCode)}</h1>
      <p style="margin: 0 0 24px;">V obchodě NaRa byla vytvořena nová objednávka.</p>
      <p><strong>Database:</strong> ${savedToDatabase ? "Uloženo" : "Neuloženo, zkontrolujte DATABASE_URL"}</p>

      <h2>Zákazník</h2>
      <p>
        <strong>Jméno:</strong> ${escapeHtml(customerName || "Jméno neuvedeno")}<br />
        <strong>Telefon:</strong> ${escapeHtml(order.customer.phone)}<br />
        <strong>E-mail:</strong> ${escapeHtml(order.customer.email)}<br />
        <strong>Město:</strong> ${escapeHtml(order.customer.city)}<br />
        <strong>Doplňující údaj:</strong> ${escapeHtml(order.customer.district)}<br />
        <strong>Adresa:</strong> ${escapeHtml(order.customer.address)}
      </p>

      <h2>Produkty</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Produkt</th>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Varianta</th>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Množství</th>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Cena</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>

      <h2>Platba</h2>
      <p>
        <strong>Mezisoučet:</strong> ${formatPrice(order.subtotal, "CZK")}<br />
        <strong>Doprava:</strong> ${formatPrice(order.shippingFee, "CZK")}<br />
        <strong>Celkem:</strong> ${formatPrice(order.total, "CZK")}<br />
        <strong>Způsob platby:</strong> ${escapeHtml(paymentMethod?.label ?? "Bankovní převod")}<br />
        <strong>Zpráva pro příjemce:</strong> ${escapeHtml(order.customer.phone)}
      </p>

      <h2>Účet</h2>
      ${paymentAccounts
        .map(
          (account) => `
            <p>
              <strong>${escapeHtml(account.bank)}</strong><br />
              ${escapeHtml(account.owner)}<br />
              ${escapeHtml(account.number)}
            </p>
          `
        )
        .join("")}
      <p>Zákazník při bankovním převodu uvede do zprávy pro příjemce telefon z objednávky.</p>
    </div>
  `;
}

async function sendOrderEmail(order: OrderRequest, savedToDatabase: boolean) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const orderEmail = process.env.ORDER_EMAIL;
  const fromEmail = process.env.ORDER_FROM_EMAIL ?? "NaRa <onboarding@resend.dev>";

  if (!resendApiKey || !orderEmail) {
    throw new Error("Chybí nastavení e-mailu. Je potřeba RESEND_API_KEY a ORDER_EMAIL.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [orderEmail],
      subject: `NaRa nová objednávka ${order.orderCode}`,
      html: await renderOrderEmail(order, savedToDatabase)
    })
  });

  if (!response.ok) {
    console.error("Order email send failed", await response.text());
    throw new Error("E-mailové oznámení se nepodařilo odeslat. E-mailová služba ještě není plně nastavena.");
  }
}

export async function POST(request: Request) {
  const rawOrder = (await request.json()) as OrderRequest;

  if (!rawOrder.customer || !rawOrder.items?.length) {
    return NextResponse.json({ error: "Chybí údaje objednávky." }, { status: 400 });
  }

  if (!/^[+\d][\d\s-]{5,19}$/.test(rawOrder.customer.phone)) {
    return NextResponse.json({ error: "Zadejte platné telefonní číslo." }, { status: 400 });
  }

  let order: OrderRequest;

  try {
    order = await verifyOrder(rawOrder);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Údaje objednávky nejsou správné." },
      { status: 400 }
    );
  }

  let savedToDatabase = false;

  try {
    await saveOrder(order);
    savedToDatabase = true;
  } catch (error) {
    console.error("Order database save failed", error);
  }

  try {
    await sendOrderEmail(order, savedToDatabase);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "E-mail se nepodařilo odeslat." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, savedToDatabase, orderCode: order.orderCode, total: order.total });
}
