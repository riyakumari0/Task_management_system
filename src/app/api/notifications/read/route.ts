import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH() {
  const payload = await getSession();
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Mark all unread notifications as read for this user
    await prisma.notification.updateMany({
      where: { 
        userId: payload.userId as string,
        isRead: false
      },
      data: { isRead: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
