import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "nara_customer_session";
const OAUTH_STATE_COOKIE = "nara_google_oauth_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const STATE_MAX_AGE = 60 * 10;

type CustomerSessionPayload = {
  userId: string;
  email: string;
  name?: string | null;
  exp: number;
};

export function hasCustomerAuthSecret() {
  return Boolean(process.env.AUTH_SECRET || process.env.CUSTOMER_AUTH_SECRET);
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.CUSTOMER_AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET for customer authentication.");
  }

  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeSession(payload: CustomerSessionPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function decodeSession(token?: string) {
  if (!token || !hasCustomerAuthSecret()) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as CustomerSessionPayload;
    if (!payload.userId || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createCustomerSession(user: { id: string; email: string; name?: string | null }) {
  const cookieStore = await cookies();
  const payload: CustomerSessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  };

  cookieStore.set(SESSION_COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const payload = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);

  if (!payload) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, phone: true }
    });
  } catch {
    return null;
  }
}

export async function createGoogleOAuthState() {
  const state = randomBytes(24).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, `${state}.${sign(state)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE
  });

  return state;
}

export async function verifyGoogleOAuthState(state: string | null) {
  if (!state || !hasCustomerAuthSecret()) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!token) {
    return false;
  }

  const [storedState, signature] = token.split(".");
  return Boolean(storedState && signature && safeEqual(storedState, state) && safeEqual(signature, sign(storedState)));
}

export function hashCustomerPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64).toString("base64url");

  return `scrypt:${salt}:${hash}`;
}

export function verifyCustomerPassword(password: string, storedPassword?: string | null) {
  if (!storedPassword) {
    return false;
  }

  const [algorithm, salt, hash] = storedPassword.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const computedHash = scryptSync(password, salt, 64).toString("base64url");
  return safeEqual(computedHash, hash);
}
