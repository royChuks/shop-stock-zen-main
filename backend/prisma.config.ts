// This file configures the Prisma CLI and client.
// DATABASE_URL_UNPOOLED is the direct Neon connection (used for migrations/DDL).
// On Vercel, DATABASE_URL_UNPOOLED comes from the dashboard (process.env).
// Locally, dotenv loads it from backend/.env.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED!
  }
});
