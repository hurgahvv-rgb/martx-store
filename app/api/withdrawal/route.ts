import { NextResponse } from "next/server";

import { sendGmailMessage } from "@/lib/gmail-smtp";

export const runtime = "nodejs";

type WithdrawalRequest = Record<string, unknown>;

function clean(body: WithdrawalRequest, key: string) {
  return String(body[key] ?? "").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as WithdrawalRequest | null;

  if (!body) {
    return NextResponse.json({ error: "Chybí údaje formuláře." }, { status: 400 });
  }

  const orderNumber = clean(body, "orderNumber");
  const customerName = clean(body, "customerName");
  const email = clean(body, "email");
  const phone = clean(body, "phone");
  const street = clean(body, "street");
  const postalCode = clean(body, "postalCode");
  const city = clean(body, "city");
  const country = clean(body, "country");
  const iban = clean(body, "iban");
  const products = clean(body, "products");
  const orderedAt = clean(body, "orderedAt");
  const receivedAt = clean(body, "receivedAt");
  const reason = clean(body, "reason");

  if (!orderNumber || !customerName || !email || !street || !postalCode || !city || !country || !iban || !products) {
    return NextResponse.json({ error: "Vyplňte prosím všechna povinná pole." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Zadejte platnou e-mailovou adresu." }, { status: 400 });
  }

  const contactEmail = process.env.CONTACT_EMAIL;

  if (!contactEmail) {
    return NextResponse.json({ error: "Chybí nastavení e-mailu. Je potřeba CONTACT_EMAIL." }, { status: 500 });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="margin: 0 0 16px;">NaRa odstoupení od smlouvy</h1>
      <p><strong>Číslo objednávky:</strong> ${escapeHtml(orderNumber)}</p>
      <p><strong>Jméno:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(phone || "Telefon neuveden")}</p>
      <p><strong>Adresa:</strong> ${escapeHtml([street, postalCode, city, country].filter(Boolean).join(", "))}</p>
      <p><strong>IBAN:</strong> ${escapeHtml(iban)}</p>
      <p><strong>Datum objednání:</strong> ${escapeHtml(orderedAt || "Neuvedeno")}</p>
      <p><strong>Datum převzetí:</strong> ${escapeHtml(receivedAt || "Neuvedeno")}</p>
      <p><strong>Zboží:</strong></p>
      <p style="white-space: pre-wrap; padding: 12px; background: #f5f5f4; border-radius: 8px;">${escapeHtml(products)}</p>
      <p><strong>Důvod:</strong></p>
      <p style="white-space: pre-wrap; padding: 12px; background: #f5f5f4; border-radius: 8px;">${escapeHtml(reason || "Neuvedeno")}</p>
    </div>
  `;

  try {
    await sendGmailMessage({
      to: contactEmail,
      fromName: "NaRa",
      replyTo: email,
      subject: `NaRa odstoupení od smlouvy - ${orderNumber}`,
      html
    });
  } catch (error) {
    console.error("Withdrawal email send failed", error);
    return NextResponse.json(
      { error: "Formulář se nepodařilo odeslat. Zkuste to prosím znovu později." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
