import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;

function getKey(): Buffer {
  const raw = process.env.HN_COOKIE_ENCRYPTION_KEY;
  if (!raw) throw new Error("HN_COOKIE_ENCRYPTION_KEY env var missing");
  const buf = Buffer.from(raw, "hex");
  if (buf.length !== KEY_BYTES)
    throw new Error(
      `HN_COOKIE_ENCRYPTION_KEY must be ${KEY_BYTES * 2} hex chars (got ${raw.length})`
    );
  return buf;
}

export interface Encrypted {
  ciphertext: string; // base64
  iv: string;         // base64
  authTag: string;    // base64
}

export function encryptCookie(plaintext: string): Encrypted {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptCookie(ciphertext: string, iv: string, authTag: string): string {
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
