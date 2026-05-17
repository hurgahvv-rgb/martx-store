import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message?: string;
      stack?: string;
      source?: string;
      lineno?: number;
      colno?: number;
      href?: string;
      userAgent?: string;
    };

    console.error("CLIENT_ERROR", {
      message: body.message,
      stack: body.stack,
      source: body.source,
      lineno: body.lineno,
      colno: body.colno,
      href: body.href,
      userAgent: body.userAgent
    });
  } catch (error) {
    console.error("CLIENT_ERROR_LOG_FAILED", error);
  }

  return NextResponse.json({ ok: true });
}
