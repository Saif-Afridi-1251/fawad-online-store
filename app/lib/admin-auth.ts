import { env } from "cloudflare:workers";

export type AdminIdentity = { id: string; email: string };

function configuredAdminUserId() {
  return String((env as unknown as { ADMIN_USER_ID?: string }).ADMIN_USER_ID ?? "").trim();
}

function configuredAdminEmail() {
  return String((env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export function isAdminUser(userId: string, email: string) {
  const adminUserId = configuredAdminUserId();
  const adminEmail = configuredAdminEmail();
  return (Boolean(adminUserId) && userId === adminUserId) ||
    (Boolean(adminEmail) && email.trim().toLowerCase() === adminEmail);
}

export function verifyAdminRequest(request: Request):
  | { ok: true; user: AdminIdentity }
  | { ok: false; response: Response } {
  const id = request.headers.get("oai-authenticated-user-id") ?? "";
  const email = request.headers.get("oai-authenticated-user-email") ?? "";
  if (!id || !email) {
    return { ok: false, response: Response.json({ ok: false, error: "Sign in is required." }, { status: 401 }) };
  }
  if (!isAdminUser(id, email)) {
    return { ok: false, response: Response.json({ ok: false, error: "Owner access is required." }, { status: 403 }) };
  }
  return { ok: true, user: { id, email } };
}
