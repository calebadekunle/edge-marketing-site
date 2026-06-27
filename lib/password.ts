import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const candidateHash = crypto.scryptSync(password, salt, KEY_LENGTH);
  const storedHash = Buffer.from(hash, "hex");
  if (candidateHash.length !== storedHash.length) return false;

  return crypto.timingSafeEqual(candidateHash, storedHash);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  // Tokens are single-use and short-lived, so a fast hash is fine here —
  // unlike passwords, there's no need for scrypt's deliberate slowness.
  return crypto.createHash("sha256").update(token).digest("hex");
}
