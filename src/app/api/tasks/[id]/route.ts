import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const TASK_XP = 50;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const currentTask = await prisma.task.findUnique({ where: { id } });
  if (!currentTask) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only an admin or the assigned trainee may move a task
  const isAssignee = currentTask.assigneeId === session.userId;
  if (session.role !== 'ADMIN' && !isAssignee) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await prisma.$transaction(async (tx) => {
    let xpAwarded = 0;

    // Gamification logic: XP is given once per task, when its assignee finishes it.
    // The xpAwarded flag is claimed first, so repeats and double clicks earn nothing.
    if (status === 'DONE' && currentTask.status !== 'DONE' && isAssignee) {
      const claim = await tx.task.updateMany({
        where: { id, xpAwarded: false },
        data: { xpAwarded: true }
      });
      if (claim.count === 1) {
        const user = await tx.user.update({
          where: { id: session.userId },
          data: { xp: { increment: TASK_XP } }
        });
        await tx.user.update({
          where: { id: session.userId },
          data: { level: Math.floor(user.xp / 100) + 1 }
        });
        xpAwarded = TASK_XP;
      }
    }

    const task = await tx.task.update({
      where: { id },
      // A task leaving DONE can't earn XP again (also covers tasks finished before this flag existed)
      data: { status, ...(currentTask.status === 'DONE' ? { xpAwarded: true } : {}) }
    });
    return { task, xpAwarded };
  });

  return NextResponse.json(result);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
