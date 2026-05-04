import { NextRequest, NextResponse } from "next/server";
import { encryptCookie } from "@/lib/crypto";
import { upsertHNSession, createIrrssueSession } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Enforce HTTPS in production
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  if (process.env.NODE_ENV === "production" && proto !== "https") {
    return NextResponse.json({ ok: false, error: "HTTPS required" }, { status: 400 });
  }

  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let username: string, password: string;
  try {
    const body = await req.json();
    username = (body.username ?? "").trim();
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Username and password required" }, { status: 400 });
  }

  // POST to HN — password never logged, never stored
  const hnBody = new URLSearchParams({ acct: username, pw: password, goto: "news" });
  let hnRes: Response;
  try {
    hnRes = await fetch("https://news.ycombinator.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (compatible; minimal-hn-reader/1.0)",
      },
      body: hnBody.toString(),
      redirect: "manual",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach Hacker News" }, { status: 502 });
  } finally {
    // Ensure password can be GC'd — explicitly clear reference
    password = "";
  }

  // Extract user cookie from Set-Cookie header
  const setCookieHeader = hnRes.headers.get("set-cookie") ?? "";
  const userCookieMatch = setCookieHeader.match(/\buser=([^;]+)/);
  const isRedirect = hnRes.status >= 300 && hnRes.status < 400;

  if (!userCookieMatch || !isRedirect) {
    // Check body for "Bad login" message as fallback
    const text = await hnRes.text().catch(() => "");
    if (text.includes("Bad login") || text.includes("login")) {
      return NextResponse.json({ ok: false, error: "Invalid HN credentials" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 401 });
  }

  const hnCookieValue = userCookieMatch[1];

  // Encrypt and persist — password is already cleared
  let encrypted;
  try {
    encrypted = encryptCookie(hnCookieValue);
  } catch (e) {
    console.error("Encryption error:", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 });
  }

  const hnSession = upsertHNSession(
    username,
    encrypted.ciphertext,
    encrypted.iv,
    encrypted.authTag
  );

  const irrssueSession = createIrrssueSession(hnSession.id);

  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(SESSION_COOKIE, irrssueSession.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
