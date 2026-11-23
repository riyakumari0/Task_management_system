import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const payload = await getSession();
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, action } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let botMessage = '';
    if (action === 'processing') {
      botMessage = '👨‍💼 An Admin is currently reviewing and processing your problem. Please stand by.';
    } else if (action === 'solved') {
      botMessage = '✅ Your problem has been marked as RESOLVED by the Admin.';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Insert the status message directed to the trainee
    await prisma.supportMessage.create({
      data: {
        userId,
        message: botMessage,
        isBot: true,
      }
    });

    // Generate a notification for the trainee
    await prisma.notification.create({
      data: {
        userId,
        title: 'Support Update',
        message: botMessage,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support action error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
