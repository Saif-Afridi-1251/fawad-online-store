import { env } from "cloudflare:workers";
import { verifyAdminRequest } from "../../../lib/admin-auth";

type StoreBucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
};

const CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const form = await request.formData();
  const value = form.get("file");
  if (!(value instanceof File)) return Response.json({ ok: false, error: "Choose an image to upload." }, { status: 400 });
  const extension = CONTENT_TYPES[value.type];
  if (!extension || value.size < 1 || value.size > 5 * 1024 * 1024) {
    return Response.json({ ok: false, error: "Use a JPG, PNG or WebP image up to 5 MB." }, { status: 400 });
  }
  const bucket = (env as unknown as { BUCKET?: StoreBucket }).BUCKET;
  if (!bucket) return Response.json({ ok: false, error: "Image storage is unavailable." }, { status: 503 });
  const key = `products/${crypto.randomUUID()}.${extension}`;
  await bucket.put(key, await value.arrayBuffer(), { httpMetadata: { contentType: value.type } });
  return Response.json({ ok: true, url: `/api/media?key=${encodeURIComponent(key)}` });
}
