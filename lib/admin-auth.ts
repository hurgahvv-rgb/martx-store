import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";

const adminCookieName = "martx_admin_session";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || (isProduction() ? "" : "admin");
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || (isProduction() ? "" : "martx2026");
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || (isProduction() ? "" : "martx-local-secret");
}

function signSession(username: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be configured.");
  }

  return createHmac("sha256", secret).update(username).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateAdminLogin(username: string, password: string) {
  const expectedUsername = getAdminUsername();
  const expectedPassword = getAdminPassword();

  return Boolean(expectedUsername && expectedPassword) && safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export async function createAdminSession() {
  const username = getAdminUsername();
  const value = `${username}.${signSession(username)}`;
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function isAdminSessionValid() {
  const cookieStore = await cookies();
  const value = cookieStore.get(adminCookieName)?.value;

  if (!value) {
    return false;
  }

  const [username, signature] = value.split(".");

  if (!username || !signature) {
    return false;
  }

  try {
    return username === getAdminUsername() && safeEqual(signature, signSession(username));
  } catch {
    return false;
  }
}

export async function requireAdminSession() {
  if (!(await isAdminSessionValid())) {
    redirect("/admin/login");
  }
}

export function isAdminRequest(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (adminToken && safeEqual(request.headers.get("x-admin-token") ?? "", adminToken)) {
    return true;
  }

  const value = request.cookies.get(adminCookieName)?.value;

  if (!value) {
    return false;
  }

  const [username, signature] = value.split(".");

  if (!username || !signature) {
    return false;
  }

  try {
    return username === getAdminUsername() && safeEqual(signature, signSession(username));
  } catch {
    return false;
  }
}
