import { NextRequest } from "next/server";

export function isAdminRequest(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return true;
  }

  return request.headers.get("x-admin-token") === adminToken;
}
