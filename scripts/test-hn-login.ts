#!/usr/bin/env npx tsx
/**
 * CLI smoke test for HN login flow.
 * Usage: npx tsx scripts/test-hn-login.ts <username> <password>
 *
 * Requires HN_COOKIE_ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
 * Generates a random key automatically if not set (for quick testing).
 */
import { randomBytes } from "crypto";

if (!process.env.HN_COOKIE_ENCRYPTION_KEY) {
  process.env.HN_COOKIE_ENCRYPTION_KEY = randomBytes(32).toString("hex");
  console.log(`[test] Generated random key: ${process.env.HN_COOKIE_ENCRYPTION_KEY}`);
}

// Dynamic import after env var is set
const { encryptCookie, decryptCookie } = await import("../src/lib/crypto.js");

const [,, username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: npx tsx scripts/test-hn-login.ts <username> <password>");
  process.exit(1);
}

console.log(`\n[1] POSTing to news.ycombinator.com/login as "${username}"...`);

const body = new URLSearchParams({ acct: username, pw: password, goto: "news" });
const res = await fetch("https://news.ycombinator.com/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (compatible; minimal-hn-test/1.0)",
  },
  body: body.toString(),
  redirect: "manual",
});

console.log(`    Status: ${res.status} ${res.statusText}`);

const setCookieHeader = res.headers.get("set-cookie") ?? "";
const userMatch = setCookieHeader.match(/\buser=([^;]+)/);
const isRedirect = res.status >= 300 && res.status < 400;

if (!userMatch || !isRedirect) {
  const text = await res.text().catch(() => "");
  if (text.includes("Bad login")) {
    console.error("[FAIL] HN returned Bad login.");
  } else {
    console.error("[FAIL] No user cookie in response.");
    console.error("       set-cookie:", setCookieHeader || "(empty)");
  }
  process.exit(1);
}

const hnCookie = userMatch[1];
console.log(`[2] Got HN cookie (first 12 chars): ${hnCookie.slice(0, 12)}...`);

console.log("[3] Encrypting...");
const encrypted = encryptCookie(hnCookie);
console.log(`    ciphertext (first 12): ${encrypted.ciphertext.slice(0, 12)}...`);

console.log("[4] Decrypting roundtrip...");
const decrypted = decryptCookie(encrypted.ciphertext, encrypted.iv, encrypted.authTag);

if (decrypted === hnCookie) {
  console.log("[PASS] Encrypt/decrypt roundtrip matches.");
} else {
  console.error("[FAIL] Roundtrip mismatch!");
  process.exit(1);
}

console.log("\n✓ Login flow works. Cookie obtained and encryption roundtrip verified.\n");
