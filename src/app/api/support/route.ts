import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(session);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (payload.role === 'ADMIN') {
    // Admin sees all messages, grouped by user (or just all messages ordered by time)
    const messages = await prisma.supportMessage.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ messages });
  } else {
    // Member sees only their messages
    const messages = await prisma.supportMessage.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ messages });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(session);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  // Save user message
  await prisma.supportMessage.create({
    data: {
      userId: payload.userId as string,
      message,
      isBot: false,
    }
  });

  // Fetch user details for the escalation message
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string }
  });

  const lowerMsg = message.toLowerCase().trim();
  
  // Smarter greeting detection: if it's short, or if it only contains greeting/help keywords
  const isShort = lowerMsg.length < 35;
  const isGreeting = isShort && !lowerMsg.includes('problem') && !lowerMsg.includes('error') && !lowerMsg.includes('task') && !lowerMsg.includes('eval');

  let botReply = '';

  if (isGreeting) {
    botReply = "Hello! Please describe the exact problem you are facing with your task so I can help.";
    // Save normal bot reply
    const botMessage = await prisma.supportMessage.create({
      data: {
        userId: payload.userId as string,
        message: botReply,
        isBot: true,
      }
    });
    return NextResponse.json({ success: true, botMessage });
  } else {
    botReply = "Thank you. I have analyzed your problem and escalated it directly to the Lead Evaluator for review. They will get back to you shortly.";
    
    // 1. Save the reply back to the user
    const botMessage = await prisma.supportMessage.create({
      data: {
        userId: payload.userId as string,
        message: botReply,
        isBot: true,
      }
    });

    // 2. Generate an Escalation Alert for the Admin
    const escalationText = `🚨 ADMIN ESCALATION: Trainee ${user?.name}\nProblem Overview: "${message}"\nStatus: Needs Review`;
    await prisma.supportMessage.create({
      data: {
        userId: payload.userId as string,
        message: escalationText,
        isBot: true,
      }
    });

    return NextResponse.json({ success: true, botMessage });
  }
}
