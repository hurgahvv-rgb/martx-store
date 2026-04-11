import { NextResponse } from "next/server";

import { CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/data";

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
  items: CartItem[];
};

const bankAccount = {
  bank: "Хаан банк",
  owner: "Сайнбаяр Даваа",
  number: "5015262578"
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderOrderEmail(order: OrderRequest) {
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
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
      <h1 style="margin: 0 0 12px;">Шинэ захиалга: ${escapeHtml(order.orderCode)}</h1>
      <p style="margin: 0 0 24px;">MartX checkout дээр шинэ захиалга бүртгэгдлээ.</p>

      <h2>Хэрэглэгч</h2>
      <p>
        <strong>Нэр:</strong> ${escapeHtml(customerName || "Нэр оруулаагүй")}<br />
        <strong>Утас:</strong> ${escapeHtml(order.customer.phone)}<br />
        <strong>И-мэйл:</strong> ${escapeHtml(order.customer.email)}<br />
        <strong>Хот/Аймаг:</strong> ${escapeHtml(order.customer.city)}<br />
        <strong>Дүүрэг/Сум:</strong> ${escapeHtml(order.customer.district)}<br />
        <strong>Хаяг:</strong> ${escapeHtml(order.customer.address)}
      </p>

      <h2>Бараанууд</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Бараа</th>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Сонголт</th>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Тоо</th>
            <th align="left" style="padding: 10px; border-bottom: 2px solid #111827;">Дүн</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>

      <h2>Төлбөр</h2>
      <p>
        <strong>Барааны дүн:</strong> ${formatPrice(order.subtotal, "MNT")}<br />
        <strong>Хүргэлт:</strong> ${formatPrice(order.shippingFee, "MNT")}<br />
        <strong>Нийт:</strong> ${formatPrice(order.total, "MNT")}<br />
        <strong>Гүйлгээний утга:</strong> ${escapeHtml(order.orderCode)}
      </p>

      <h2>Данс</h2>
      <p>
        <strong>${bankAccount.bank}</strong><br />
        ${bankAccount.owner}<br />
        ${bankAccount.number}
      </p>
    </div>
  `;
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const orderEmail = process.env.ORDER_EMAIL;
  const fromEmail = process.env.ORDER_FROM_EMAIL ?? "MartX <onboarding@resend.dev>";

  if (!resendApiKey || !orderEmail) {
    return NextResponse.json(
      { error: "Email тохиргоо дутуу байна. RESEND_API_KEY болон ORDER_EMAIL хэрэгтэй." },
      { status: 500 }
    );
  }

  const order = (await request.json()) as OrderRequest;

  if (!order.orderCode || !order.items?.length) {
    return NextResponse.json({ error: "Захиалгын мэдээлэл дутуу байна." }, { status: 400 });
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
      subject: `MartX шинэ захиалга ${order.orderCode}`,
      html: renderOrderEmail(order)
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
