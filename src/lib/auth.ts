import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const MIN_PASSWORD_LENGTH = 8;

// Read when needed (not at import time) so `next build` works without the secret.
function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters. See .env.example.');
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: string;
  exp?: number;
};

export async function encrypt(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, getKey(), {
    algorithms: ['HS256'],
  });
  return payload as SessionPayload;
}

export async function createSession(userId: string, role: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expires,
    path: '/',
  });
}

// Checks the cookie, then the database, so removed or unapproved users lose
// access right away and the role is always the current one.
export async function getSession(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  let payload: SessionPayload;
  try {
    payload = await decrypt(token);
  } catch {
    return null;
  }
  if (typeof payload.userId !== 'string') return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isApproved: true },
  });
  if (!user || !user.isApproved) return null;
  return { userId: user.id, role: user.role };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
}
