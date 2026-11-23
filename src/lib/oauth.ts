// Google, X and Facebook login (OAuth 2.0 authorization code flow).

export const OAUTH_COOKIE = 'oauth_state';

export type OAuthProfile = { id: string; name: string; email: string | null };

type Provider = {
  envPrefix: string;
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
  scope: string;
  pkce: boolean;
  basicAuth: boolean; // send the client id and secret in a header instead of the body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toProfile: (data: any) => OAuthProfile;
};

const PROVIDERS: Record<string, Provider> = {
  google: {
    envPrefix: 'GOOGLE',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    pkce: true,
    basicAuth: false,
    toProfile: (d) => ({ id: d.sub, name: d.name, email: d.email_verified ? d.email : null }),
  },
  x: {
    envPrefix: 'X',
    authUrl: 'https://x.com/i/oauth2/authorize',
    tokenUrl: 'https://api.x.com/2/oauth2/token',
    profileUrl: 'https://api.x.com/2/users/me?user.fields=confirmed_email',
    scope: 'users.read tweet.read users.email',
    pkce: true,
    basicAuth: true,
    toProfile: (d) => ({ id: d.data?.id, name: d.data?.name, email: d.data?.confirmed_email || null }),
  },
  facebook: {
    envPrefix: 'FACEBOOK',
    authUrl: 'https://www.facebook.com/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/oauth/access_token',
    profileUrl: 'https://graph.facebook.com/me?fields=id,name,email',
    scope: 'public_profile email',
    pkce: false,
    basicAuth: false,
    toProfile: (d) => ({ id: d.id, name: d.name, email: d.email || null }),
  },
};

// Returns the provider with its keys, or null if it's unknown or not set up.
export function getProvider(name: string) {
  if (!Object.hasOwn(PROVIDERS, name)) return null;
  const provider = PROVIDERS[name];
  const clientId = process.env[`${provider.envPrefix}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.envPrefix}_CLIENT_SECRET`];
  if (!clientId || !clientSecret) return null;
  return { ...provider, clientId, clientSecret };
}

export type ConfiguredProvider = NonNullable<ReturnType<typeof getProvider>>;

// Set APP_URL when hosted: behind a proxy the request URL isn't the public one.
export function appUrl(req: Request) {
  return (process.env.APP_URL || new URL(req.url).origin).replace(/\/$/, '');
}

export function callbackUrl(req: Request, name: string) {
  return `${appUrl(req)}/api/auth/oauth/${name}/callback`;
}

export async function fetchProfile(
  provider: ConfiguredProvider,
  code: string,
  redirectUri: string,
  verifier: string
): Promise<OAuthProfile> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: provider.clientId,
  });
  if (provider.pkce) body.set('code_verifier', verifier);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (provider.basicAuth) {
    const pair = `${encodeURIComponent(provider.clientId)}:${encodeURIComponent(provider.clientSecret)}`;
    headers.Authorization = `Basic ${Buffer.from(pair).toString('base64')}`;
  } else {
    body.set('client_secret', provider.clientSecret);
  }

  const tokenRes = await fetch(provider.tokenUrl, { method: 'POST', headers, body, signal: AbortSignal.timeout(10000) });
  if (!tokenRes.ok) throw new Error(`Token request failed (${tokenRes.status})`);
  const { access_token: accessToken } = await tokenRes.json();
  if (!accessToken) throw new Error('No access token returned');

  const profileRes = await fetch(provider.profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!profileRes.ok) throw new Error(`Profile request failed (${profileRes.status})`);
  const profile = provider.toProfile(await profileRes.json());
  if (!profile.id) throw new Error('No account id returned');
  return profile;
}
