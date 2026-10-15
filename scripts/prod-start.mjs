import { execSync } from "node:child_process";

// 1. Fallback to local SQLite if DATABASE_URL is not provided in Dokploy environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
  console.log("[Startup] DATABASE_URL not set in environment, defaulting to: file:./dev.db");
}

const port = process.env.PORT || "3000";
const host = process.env.HOSTNAME || "0.0.0.0";

// 2. Synchronize database schema without killing container if it fails
try {
  console.log(`[Startup] Synchronizing database schema...`);
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("[Startup] Database schema synchronized successfully.");
} catch (error) {
  console.error("[Startup Warning] prisma db push failed, continuing to start web server:", error?.message || error);
}

// 3. Start Next.js production server
console.log(`[Startup] Launching Next.js server on ${host}:${port}...`);
execSync(`npx next start -H ${host} -p ${port}`, {
  stdio: "inherit",
  env: process.env,
});
