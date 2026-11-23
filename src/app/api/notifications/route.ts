import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const payload = await getSession();
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
