import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
export const prisma = globalThis.prisma ?? new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
});
if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}
//# sourceMappingURL=prisma.js.map