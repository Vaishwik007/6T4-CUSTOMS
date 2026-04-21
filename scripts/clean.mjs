// Cross-platform cache cleaner — works on Windows/macOS/Linux with zero deps.
import { rmSync } from "node:fs";

const targets = [".next", "node_modules/.cache"];
for (const t of targets) {
  rmSync(t, { recursive: true, force: true });
  console.log(`✓ removed ${t}`);
}
console.log("done.");
