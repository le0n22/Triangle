
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Log to see if this file is even being executed and what PrismaClient is
console.log('--- backend/lib/prisma.ts ---');
console.log('PrismaClient constructor type:', typeof PrismaClient);

const prisma = global.prisma || new PrismaClient();
console.log('Prisma instance in backend/lib/prisma.ts:', prisma ? 'Defined' : 'UNDEFINED');

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
  console.log('Prisma instance assigned to global.prisma in development.');
} else {
  console.log('Prisma instance created for production/non-development.');
}

if (!prisma) {
  console.error("CRITICAL: Prisma client instance could not be created in backend/lib/prisma.ts");
}

export default prisma;
    