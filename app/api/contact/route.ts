import { NextResponse } from "next/server";

import { sendGmailMessage } from "@/lib/gmail-smtp";

export const runtime = "nodejs";

type ContactRequest = {
  name?: string;
  email?: string;
  phone?: string;
  comment?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value: string | undefined) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactRequest | null;
  const name = clean(body?.name);
  const email = clean(body?.email);
  const phone = clean(body?.phone);
  const comment = clean(body?.comment);

  if (!email || !comment) {
    return NextResponse.json({ error: "E-mail a zpráva jsou povinné." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Zadejte platnou e-mailovou adresu." }, { status: 400 });
  }

  const contactEmail = process.env.CONTACT_EMAIL;

  if (!contactEmail) {
    return NextResponse.json(
      { error: "Chybí nastavení e-mailu. Je potřeba CONTACT_EMAIL." },
      { status: 500 }
    );
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="margin: 0 0 16px;">NaRa kontaktní zpráva</h1>
      <p><strong>Jméno:</strong> ${escapeHtml(name || "Jméno neuvedeno")}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(phone || "Telefon neuveden")}</p>
      <p><strong>Zpráva:</strong></p>
      <p style="white-space: pre-wrap; padding: 12px; background: #f5f5f4; border-radius: 8px;">${escapeHtml(comment)}</p>
    </div>
  `;

  try {
    await sendGmailMessage({
      to: contactEmail,
      fromName: "NaRa",
      replyTo: email,
      subject: `NaRa kontaktní zpráva${name ? ` - ${name}` : ""}`,
      html
    });
  } catch (error) {
    console.error("Contact email send failed", error);
    return NextResponse.json(
      { error: "Zprávu se nepodařilo odeslat. E-mailová služba ještě není plně nastavena." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
