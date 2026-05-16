import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const roleToSave = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: roleToSave,
        isApproved: roleToSave === 'ADMIN' // Admins are auto-approved
      }
    });

    if (roleToSave === 'ADMIN') {
      await createSession(user.id, user.role);
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
      // Members are pending approval
      return NextResponse.json({ 
        message: 'Account created successfully! Please wait for an Admin to approve your account before logging in.'
      });
    }
  } catch (error) {
    console.error('REGISTER ERROR', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
