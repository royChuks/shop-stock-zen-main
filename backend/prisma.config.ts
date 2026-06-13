// This file configures the Prisma CLI and client.
// On Vercel, DATABASE_URL comes from the dashboard (process.env).
// Locally, dotenv loads it from backend/.env.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!
  }
});
