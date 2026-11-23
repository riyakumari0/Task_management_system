import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = session.role === 'ADMIN';
  const { searchParams } = new URL(req.url);
  const showAll = isAdmin && searchParams.get('limit') === 'none';

  try {
    // Never return passwordHash. Emails are for admins only.
    const users = await prisma.user.findMany({
      where: { role: 'MEMBER', isApproved: true },
      select: { id: true, name: true, role: true, xp: true, level: true, email: isAdmin },
      ...(showAll ? {} : { take: 5 })
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('LIST USERS ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
