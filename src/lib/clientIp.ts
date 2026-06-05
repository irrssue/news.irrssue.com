import type { NextRequest } from "next/server";

/**
 * Resolve the real client IP for rate limiting.
 *
 * Deployment: Cloudflare Tunnel (cloudflared) terminates TLS at Cloudflare's
 * edge and proxies directly to the Next.js app on localhost:3000 — nginx is not
 * in the request path. cloudflared sets the true visitor IP in CF-Connecting-IP.
 *
 * CF-Connecting-IP is trustworthy ONLY because the app is reachable exclusively
 * through the tunnel; the port is not publicly exposed, so a client cannot forge
 * this header. If the app is ever exposed directly, this trust must be revisited.
 *
 * Fallbacks (X-Real-IP / X-Forwarded-For) cover non-tunnel/local access. We take
 * the FIRST value of XFF as last resort only — it is client-spoofable, hence last.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}
