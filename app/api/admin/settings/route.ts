import { verifyAdminRequest } from "../../../lib/admin-auth";
import { getSocialLinks, saveSocialLinks, type SocialLinks } from "../../../lib/store-settings-db";

export const dynamic = "force-dynamic";

function socialUrl(value: unknown) {
  const text = String(value ?? "").trim().slice(0, 500);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  return Response.json({ ok: true, socialLinks: await getSocialLinks() });
}

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  let input: Record<string, unknown>;
  try { input = await request.json() as Record<string, unknown>; } catch { return Response.json({ ok: false, error: "Invalid settings." }, { status: 400 }); }
  const links: SocialLinks = {
    facebook: socialUrl(input.facebook) ?? "__invalid__",
    instagram: socialUrl(input.instagram) ?? "__invalid__",
    youtube: socialUrl(input.youtube) ?? "__invalid__",
    x: socialUrl(input.x) ?? "__invalid__",
  };
  if (Object.values(links).includes("__invalid__")) {
    return Response.json({ ok: false, error: "Use complete secure links beginning with https://" }, { status: 400 });
  }
  return Response.json({ ok: true, socialLinks: await saveSocialLinks(links) });
}
