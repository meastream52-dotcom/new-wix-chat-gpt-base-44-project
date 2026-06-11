import { createHash } from "crypto";

const SALT = process.env.ENGAGEMENT_HASH_SALT ?? "echoblog-dev-salt";

function sha256(input: string): string {
  return createHash("sha256").update(`${SALT}:${input}`).digest("hex").slice(0, 32);
}

export function hashIp(req: Request): string | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip");
  return ip ? sha256(ip) : null;
}

export function hashUa(req: Request): string | null {
  const ua = req.headers.get("user-agent");
  return ua ? sha256(ua) : null;
}
