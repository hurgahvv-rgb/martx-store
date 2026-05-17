import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";

const adminCookieName = "martx_admin_session";

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "martx2026";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || "martx-local-secret";
}

function signSession(username: string) {
  return createHmac("sha256", getSessionSecret()).update(username).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateAdminLogin(username: string, password: string) {
  return safeEqual(username, getAdminUsername()) && safeEqual(password, getAdminPassword());
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

  return username === getAdminUsername() && safeEqual(signature, signSession(username));
}

export async function requireAdminSession() {
  if (!(await isAdminSessionValid())) {
    redirect("/admin/login");
  }
}

export function isAdminRequest(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return true;
  }

  return request.headers.get("x-admin-token") === adminToken;
}
