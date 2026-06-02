import { PrismaClient } from "@prisma/client";

// Declare this cleanly inside the global execution namespace
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Implement the serializer function safely
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;