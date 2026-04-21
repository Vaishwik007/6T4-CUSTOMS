/**
 * One-shot setup: apply migrations + run seed.
 * Safe to re-run — migrations are idempotent, seeds upsert.
 *
 *   pnpm setup
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { spawn } from "node:child_process";
import path from "node:path";

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  console.log("▶ Step 1/2 · Applying migrations");
  await run("npx", ["tsx", path.join("scripts", "apply-migrations.ts")]);

  console.log("\n▶ Step 2/2 · Seeding catalog + bootstrapping admin");
  await run("npx", ["tsx", path.join("scripts", "seed-supabase.ts")]);

  console.log("\n✓ Setup complete. Sign in with 6T4CUSTOMS / 6T4CUSTOMS (you'll be forced to reset).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
