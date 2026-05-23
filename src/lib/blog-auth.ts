import { cookies } from 'next/headers';
import { db } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'cinemarant-secret-dev-only';

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}

export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h);
}

export function createSessionToken(userId: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}:${nonce}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function parseSessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    return payload.split(':')[0];
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('blog_session')?.value;
  if (!token) return null;
  const userId = parseSessionToken(token);
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}
