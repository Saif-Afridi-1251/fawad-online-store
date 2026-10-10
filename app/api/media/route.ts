import { env } from "cloudflare:workers";

type R2Object = {
  body: ReadableStream;
  httpEtag?: string;
  httpMetadata?: { contentType?: string };
};

type StoreBucket = { get(key: string): Promise<R2Object | null> };

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!key.startsWith("products/") || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const bucket = (env as unknown as { BUCKET?: StoreBucket }).BUCKET;
  if (!bucket) return new Response("Media storage unavailable", { status: 503 });
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers({
    "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
}
