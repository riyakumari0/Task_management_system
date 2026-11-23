// Makes an existing account an approved admin. Sign up in the app first, then run:
//   npm run make-admin -- you@example.com
import { PrismaClient } from '@prisma/client';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run make-admin -- you@example.com');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const { count } = await prisma.user.updateMany({
    where: { email },
    data: { role: 'ADMIN', isApproved: true },
  });
  if (count) {
    console.log(`${email} is now an admin. They can log in.`);
  } else {
    console.error(`No account found for ${email}. Sign up in the app first.`);
    process.exitCode = 1;
  }
} finally {
  await prisma.$disconnect();
}
