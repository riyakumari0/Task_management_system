import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { OAUTH_COOKIE, appUrl, callbackUrl, getProvider } from '@/lib/oauth';

// Sends the person to Google, X or Facebook to log in
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await params;
  const provider = getProvider(name);
  if (!provider) return NextResponse.redirect(`${appUrl(req)}/?error=oauth_not_configured`);

  // Checked when they come back, so nobody can start a login on someone else's behalf
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_COOKIE, `${name}.${state}.${verifier}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  const url = new URL(provider.authUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', provider.clientId);
  url.searchParams.set('redirect_uri', callbackUrl(req, name));
  url.searchParams.set('scope', provider.scope);
  url.searchParams.set('state', state);
  if (provider.pkce) {
    url.searchParams.set('code_challenge', createHash('sha256').update(verifier).digest('base64url'));
    url.searchParams.set('code_challenge_method', 'S256');
  }
  return NextResponse.redirect(url);
}
