import { NextResponse } from "next/server";

import { createGoogleOAuthState, hasCustomerAuthSecret } from "@/lib/customer-auth";

function hasGoogleClientId(clientId?: string) {
  return Boolean(clientId && clientId !== "your-google-oauth-client-id");
}

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  return host ? `${protocol}://${host}` : new URL(request.url).origin;
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!hasGoogleClientId(clientId) || !hasCustomerAuthSecret()) {
    return NextResponse.redirect(new URL("/account?error=google_config", request.url));
  }

  const state = await createGoogleOAuthState();
  const redirectUri = `${getRequestOrigin(request)}/api/auth/google/callback`;
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authorizationUrl.searchParams.set("client_id", clientId as string);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorizationUrl);
}
