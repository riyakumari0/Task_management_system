import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
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
