import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: session.role === 'ADMIN' ? {} : {
      members: { some: { userId: session.userId } }
    },
    include: {
      tasks: { select: { status: true } }
    }
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name, description, memberIds } = await req.json();
  const project = await prisma.project.create({
    data: {
      name,
      description,
      members: {
        create: (memberIds || []).map((id: string) => ({ userId: id }))
      }
    }
  });
  
  return NextResponse.json(project);
}
