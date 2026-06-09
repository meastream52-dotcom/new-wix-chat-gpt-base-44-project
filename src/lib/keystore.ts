import crypto from 'crypto';
import { prisma } from './db';

const ALGORITHM = 'aes-256-gcm';

function masterKey(): Buffer {
  const secret =
    process.env.NEXTAUTH_SECRET ??
    process.env.KEY_STORE_SECRET ??
    'evidence-ai-dev-key-please-set-NEXTAUTH_SECRET';
  return crypto.scryptSync(secret, 'evidence-ai-keystore-v1', 32);
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(data: string): string {
  const buf = Buffer.from(data, 'base64');
  const iv = buf.subarray(0, 16);
  const tag = buf.subarray(16, 32);
  const encrypted = buf.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

export function mask(value: string): string {
  if (!value || value.length <= 8) return '••••••••';
  return value.slice(0, 4) + '••••••' + value.slice(-2);
}

export async function loadVaultKeys(): Promise<void> {
  try {
    const keys = await prisma.configKey.findMany();
    for (const k of keys) {
      try {
        const plain = decrypt(k.value);
        if (!process.env[k.name]) {
          process.env[k.name] = plain;
        }
      } catch {
        // skip corrupted entries
      }
    }
  } catch {
    // DB not yet available — skip silently
  }
}

export async function getConfigKey(name: string): Promise<string | undefined> {
  if (process.env[name]) return process.env[name];
  try {
    const k = await prisma.configKey.findUnique({ where: { name } });
    if (!k) return undefined;
    return decrypt(k.value);
  } catch {
    return undefined;
  }
}
