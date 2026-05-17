import { NextRequest, NextResponse } from "next/server";

const adminCookieName = "martx_admin_session";

function redirectAfterLogout(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0
  };

  response.cookies.set(adminCookieName, "", {
    ...cookieOptions,
    path: "/"
  });
  response.cookies.set(adminCookieName, "", {
    ...cookieOptions,
    path: "/admin"
  });

  return response;
}

export async function GET(request: NextRequest) {
  return redirectAfterLogout(request);
}

export async function POST(request: NextRequest) {
  return redirectAfterLogout(request);
}
