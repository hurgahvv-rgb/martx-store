import tls from "tls";

type GmailMessage = {
  to: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  html: string;
};

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function dotStuff(value: string) {
  return value.replace(/^\./gm, "..");
}

export async function sendGmailMessage(message: GmailMessage) {
  const user = process.env.GMAIL_SMTP_USER;
  const password = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");

  if (!user || !password) {
    throw new Error("Chybí nastavení Gmail SMTP.");
  }

  const socket = tls.connect({
    host: "smtp.gmail.com",
    port: 465,
    servername: "smtp.gmail.com"
  });
  socket.setEncoding("utf8");

  let buffer = "";
  const waiters: (() => void)[] = [];

  socket.on("data", (chunk) => {
    buffer += chunk;
    waiters.splice(0).forEach((resolve) => resolve());
  });

  await new Promise<void>((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });

  async function readResponse() {
    const startedAt = Date.now();

    while (!/\r?\n\d{3} /.test(`\n${buffer}`)) {
      if (Date.now() - startedAt > 15000) {
        throw new Error("SMTP timeout.");
      }

      await new Promise<void>((resolve) => waiters.push(resolve));
    }

    const lines = buffer.split(/\r?\n/);
    let endIndex = -1;

    for (let index = 0; index < lines.length; index += 1) {
      if (/^\d{3} /.test(lines[index])) {
        endIndex = index;
        break;
      }
    }

    const response = lines.slice(0, endIndex + 1).join("\n");
    buffer = lines.slice(endIndex + 1).join("\n");
    return response;
  }

  async function command(value: string, expected: number | number[]) {
    socket.write(`${value}\r\n`);
    const response = await readResponse();
    const code = Number(response.slice(0, 3));
    const expectedCodes = Array.isArray(expected) ? expected : [expected];

    if (!expectedCodes.includes(code)) {
      throw new Error(`SMTP failed: ${response}`);
    }

    return response;
  }

  try {
    await readResponse();
    await command("EHLO nara.local", 250);
    await command("AUTH LOGIN", 334);
    await command(Buffer.from(user).toString("base64"), 334);
    await command(Buffer.from(password).toString("base64"), 235);
    await command(`MAIL FROM:<${user}>`, 250);
    await command(`RCPT TO:<${message.to}>`, [250, 251]);
    await command("DATA", 354);

    const headers = [
      `From: ${encodeHeader(message.fromName)} <${user}>`,
      `To: <${message.to}>`,
      message.replyTo ? `Reply-To: <${message.replyTo}>` : null,
      `Subject: ${encodeHeader(message.subject)}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8"
    ].filter(Boolean);

    socket.write(`${headers.join("\r\n")}\r\n\r\n${dotStuff(message.html)}\r\n.\r\n`);
    const response = await readResponse();

    if (Number(response.slice(0, 3)) !== 250) {
      throw new Error(`SMTP failed: ${response}`);
    }

    await command("QUIT", 221).catch(() => undefined);
  } finally {
    socket.end();
  }
}
