import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || !email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    // The role is only a request: nobody gets access until an admin approves them.
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
        isApproved: false
      }
    });

    return NextResponse.json({
      message: 'Account created successfully! Please wait for an Admin to approve your account before logging in.'
    });
  } catch (error) {
    console.error('REGISTER ERROR', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
