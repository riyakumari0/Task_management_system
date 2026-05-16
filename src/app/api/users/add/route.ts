import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { users, password, role } = await req.json();
    if (!users || !Array.isArray(users) || users.length === 0 || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const emails = users.map((u: any) => u.email);
    const existingUsers = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: `Emails already exist: ${existingUsers.map(u => u.email).join(', ')}` }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const createdUsers = await Promise.all(users.map((u: any) => 
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash,
          role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
          isApproved: true // Manually added members are auto-approved
        }
      })
    ));

    return NextResponse.json({ success: true, count: createdUsers.length });
  } catch (error) {
    console.error('ADD USER ERROR', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
