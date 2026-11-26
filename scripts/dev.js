import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("\x1b[36m%s\x1b[0m", "⚡ Starting Tapform Full-Stack Development Engine");
console.log("\x1b[36m%s\x1b[0m", "   • Backend API on http://localhost:5000");
console.log("\x1b[36m%s\x1b[0m", "   • Frontend App on http://localhost:5173");
console.log("\x1b[36m%s\x1b[0m", "==================================================");

// 1. Spawn Backend Process
const serverScript = path.resolve(projectRoot, "backend/src/server.js");
const backendProcess = spawn(
  isWin ? "node.exe" : "node",
  [serverScript],
  {
    stdio: "inherit",
    shell: true,
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: "development" },
  }
);

// 2. Spawn Vite Frontend Process
const npxCmd = isWin ? "npx.cmd" : "npx";
const frontendProcess = spawn(
  npxCmd,
  ["vite"],
  {
    stdio: "inherit",
    shell: true,
    cwd: projectRoot,
  }
);

function cleanup() {
  console.log("\n\x1b[33mStopping all services...\x1b[0m");
  try {
    backendProcess.kill();
    frontendProcess.kill();
  } catch {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
