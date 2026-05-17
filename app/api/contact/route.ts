import { NextResponse } from "next/server";

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
    return NextResponse.json({ error: "И-мэйл болон сэтгэгдэл заавал бөглөнө үү." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "И-мэйл хаяг зөв оруулна уу." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL || process.env.ORDER_EMAIL;
  const fromEmail = process.env.ORDER_FROM_EMAIL ?? "MartX <onboarding@resend.dev>";

  if (!resendApiKey || !contactEmail) {
    return NextResponse.json(
      { error: "Email тохиргоо дутуу байна. RESEND_API_KEY болон CONTACT_EMAIL эсвэл ORDER_EMAIL хэрэгтэй." },
      { status: 500 }
    );
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="margin: 0 0 16px;">MartX холбоо барих хүсэлт</h1>
      <p><strong>Нэр:</strong> ${escapeHtml(name || "Нэр оруулаагүй")}</p>
      <p><strong>И-мэйл:</strong> ${escapeHtml(email)}</p>
      <p><strong>Утас:</strong> ${escapeHtml(phone || "Утас оруулаагүй")}</p>
      <p><strong>Сэтгэгдэл:</strong></p>
      <p style="white-space: pre-wrap; padding: 12px; background: #f5f5f4; border-radius: 8px;">${escapeHtml(comment)}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [contactEmail],
      reply_to: email,
      subject: `MartX холбоо барих хүсэлт${name ? ` - ${name}` : ""}`,
      html
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
