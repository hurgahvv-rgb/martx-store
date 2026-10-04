import { NextResponse } from "next/server";

import { createCustomerSession, hasCustomerAuthSecret, verifyGoogleOAuthState } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function hasGoogleCredentials(clientId?: string, clientSecret?: string) {
  return Boolean(
    clientId &&
      clientSecret &&
      clientId !== "your-google-oauth-client-id" &&
      clientSecret !== "your-google-oauth-client-secret"
  );
}

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  return host ? `${protocol}://${host}` : new URL(request.url).origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const origin = getRequestOrigin(request);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!hasGoogleCredentials(clientId, clientSecret) || !code || !hasCustomerAuthSecret()) {
    return NextResponse.redirect(new URL("/account?error=google_config", origin));
  }

  const validState = await verifyGoogleOAuthState(state);
  if (!validState) {
    return NextResponse.redirect(new URL("/account?error=google_state", origin));
  }

  const redirectUri = new URL("/api/auth/google/callback", origin).toString();
  const googleClientId = clientId as string;
  const googleClientSecret = clientSecret as string;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  });

  const token = (await tokenResponse.json()) as GoogleTokenResponse;
  if (!tokenResponse.ok || !token.access_token) {
    const errorUrl = new URL("/account", origin);
    errorUrl.searchParams.set("error", "google_token");
    if (token.error) {
      errorUrl.searchParams.set("details", token.error);
    }
    return NextResponse.redirect(errorUrl);
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  const profile = (await profileResponse.json()) as GoogleUserInfo;

  if (!profileResponse.ok || !profile.email || profile.email_verified === false) {
    return NextResponse.redirect(new URL("/account?error=google_profile", origin));
  }

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: { name: profile.name ?? undefined },
    create: {
      email: profile.email,
      name: profile.name ?? null,
      role: "customer"
    },
    select: { id: true, email: true, name: true }
  });

  await createCustomerSession(user);

  return NextResponse.redirect(new URL("/account", origin));
}
