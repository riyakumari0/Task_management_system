import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  
  const tasks = await prisma.task.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(session.role === 'MEMBER' ? {
        project: { members: { some: { userId: session.userId } } }
      } : {})
    },
    include: { assignee: { select: { id: true, name: true, xp: true, level: true } } }
  });
  
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();

  if (Array.isArray(body)) {
    const result = await prisma.task.createMany({
      data: body.map((t: any) => ({
        title: t.title,
        description: t.description || null,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        projectId: t.projectId,
        assigneeId: t.assigneeId || null
      }))
    });
    return NextResponse.json({ success: true, count: result.count });
  }

  const { title, description, dueDate, projectId, assigneeId } = body;
  const task = await prisma.task.create({
    data: {
      title, description, dueDate: dueDate ? new Date(dueDate) : null, projectId, assigneeId
    }
  });
  return NextResponse.json(task);
}
