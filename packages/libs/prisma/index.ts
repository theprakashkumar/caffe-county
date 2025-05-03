import { PrismaClient } from "@prisma/client";

// - declare global: Used in TypeScript to extend the global scope so that the TypeScript compiler is aware of additional properties or types.
// - namespace globalThis: Targets the globalThis object, which is a standard object in modern JavaScript that refers to the global scope (e.g., window in browsers, global in Node.js).
// - var prismaDB: PrismaClient;: Declares a variable prismaDB on the global scope with the type PrismaClient (from the Prisma ORM library).
declare global {
  namespace globalThis {
    var prismaDB: PrismaClient;
  }
}

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") global.prismaDB = prisma;

export default prisma;
