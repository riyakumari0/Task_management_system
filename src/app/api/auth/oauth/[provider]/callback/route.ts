import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { OAUTH_COOKIE, appUrl, callbackUrl, fetchProfile, getProvider } from '@/lib/oauth';
import { prisma } from '@/lib/prisma';

// Google, X or Facebook sends the person back here after they log in
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await params;
  const fail = (error: string) => NextResponse.redirect(`${appUrl(req)}/?error=${error}`);

  const provider = getProvider(name);
  if (!provider) return fail('oauth_not_configured');

  const cookieStore = await cookies();
  const [savedName, savedState, verifier] = (cookieStore.get(OAUTH_COOKIE)?.value || '').split('.');
  cookieStore.set(OAUTH_COOKIE, '', { maxAge: 0, path: '/' }); // single use

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code || !savedState || !verifier || savedName !== name || savedState !== searchParams.get('state')) {
    return fail('oauth_failed');
  }

  try {
    const profile = await fetchProfile(provider, code, callbackUrl(req, name), verifier);

    const account = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: name, providerAccountId: profile.id } },
      include: { user: { select: { id: true, role: true, isApproved: true } } }
    });
    if (account) {
      if (!account.user.isApproved) return fail('oauth_pending');
      await createSession(account.user.id, account.user.role);
      return NextResponse.redirect(`${appUrl(req)}/dashboard`);
    }

    if (!profile.email) return fail('oauth_no_email');

    // Never join an existing account just because the email matches: sign-up
    // emails aren't verified, so that could hand an account to the wrong person.
    const existing = await prisma.user.findUnique({ where: { email: profile.email }, select: { id: true } });
    if (existing) return fail('oauth_email_exists');

    await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name || profile.email,
        // A random password nobody knows: this account logs in through the provider
        passwordHash: await bcrypt.hash(randomBytes(32).toString('base64url'), 10),
        role: 'MEMBER',
        isApproved: false,
        oauthAccounts: { create: { provider: name, providerAccountId: profile.id } }
      }
    });
    return fail('oauth_pending');
  } catch (error) {
    console.error('OAUTH ERROR', name, error);
    return fail('oauth_failed');
  }
}
