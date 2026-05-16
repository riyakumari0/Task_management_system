import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pendingUsers = await prisma.user.findMany({
      where: { isApproved: false },
      select: { id: true, email: true, name: true, role: true }
    });
    return NextResponse.json(pendingUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pending users' }, { status: 500 });
  }
}
