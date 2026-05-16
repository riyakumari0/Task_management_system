import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { status } = await req.json();
  
  // Gamification logic: Add XP if status changed to DONE
  const currentTask = await prisma.task.findUnique({ where: { id } });
  if (!currentTask) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  let xpAwarded = 0;
  
  if (status === 'DONE' && currentTask.status !== 'DONE' && currentTask.assigneeId === session.userId) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user) {
      const newXp = user.xp + 50;
      const newLevel = Math.floor(newXp / 100) + 1;
      await prisma.user.update({
        where: { id: session.userId },
        data: { xp: newXp, level: newLevel }
      });
      xpAwarded = 50;
    }
  }
  
  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status }
  });
  
  return NextResponse.json({ task: updatedTask, xpAwarded });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
