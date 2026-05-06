import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // In Prisma 7, we use the DIRECT_URL for CLI commands (db push, migrations)
    // and the DATABASE_URL (pooled) for the actual application runtime.
    url: process.env.DIRECT_URL,
  },
});
