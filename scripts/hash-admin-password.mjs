// Makes the ADMIN_PASSWORD_HASH value for Vercel, plus a fresh ADMIN_SESSION_SECRET.
// Usage: node scripts/hash-admin-password.mjs "your new password"
import { randomBytes, scryptSync } from "node:crypto";

const pw = process.argv[2];
if (!pw || pw.length < 12) {
  console.error("Give a password of at least 12 characters, in quotes.");
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${scryptSync(pw, salt, 32).toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
