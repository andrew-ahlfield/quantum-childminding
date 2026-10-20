// Re-pins the vendored PuzzleScript engine and editor to an upstream commit.
//   npm run update-engine -- <commit-sha>
// Then run `npm test`, build, and play the game and the editor before committing.

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// What the editor and the standalone export need. The gallery, documentation and
// tests (over 30 MB) stay upstream; the editor links to the documentation online.
export const PATHS = ["LICENSE", "src/editor.html", "src/standalone_inlined.txt", "src/css", "src/js", "src/fonts", "src/images"];

const sha = process.argv[2];
if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
  console.error("usage: npm run update-engine -- <full 40-character commit sha>");
  process.exit(1);
}

const vendor = join(dirname(fileURLToPath(import.meta.url)), "..", "vendor", "puzzlescript");
const tmp = mkdtempSync(join(tmpdir(), "puzzlescript-"));
const git = (...args) => execFileSync("git", ["-C", tmp, ...args], { stdio: "inherit" });
try {
  git("init", "-q");
  git("fetch", "-q", "--depth", "1", "https://github.com/increpare/PuzzleScript.git", sha);
  git("checkout", "-q", "FETCH_HEAD", "--", ...PATHS);
  rmSync(vendor, { recursive: true, force: true });
  for (const p of PATHS) cpSync(join(tmp, p), join(vendor, p), { recursive: true });
  writeFileSync(join(vendor, "COMMIT"), sha + "\n");
  console.log(`vendor/puzzlescript pinned to ${sha}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
