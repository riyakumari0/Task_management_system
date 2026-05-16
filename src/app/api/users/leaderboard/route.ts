import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(session);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const topPerformers = await prisma.user.findMany({
      where: { role: 'MEMBER', isApproved: true },
      orderBy: [
        { xp: 'desc' },
        { level: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true
      }
    });
    return NextResponse.json(topPerformers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
