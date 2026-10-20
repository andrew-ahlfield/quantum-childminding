// Re-pins the vendored PuzzleScript export template to an upstream commit.
//   npm run update-engine -- <commit-sha>
// Then run `npm test` and play the game through before committing the result.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sha = process.argv[2];
if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
  console.error("usage: npm run update-engine -- <full 40-character commit sha>");
  process.exit(1);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "vendor", "puzzlescript");
const raw = (path) => `https://raw.githubusercontent.com/increpare/PuzzleScript/${sha}/${path}`;

for (const [path, file] of [["src/standalone_inlined.txt", "standalone_inlined.txt"], ["LICENSE", "LICENSE"]]) {
  const res = await fetch(raw(path));
  if (!res.ok) throw new Error(`${raw(path)}: HTTP ${res.status}`);
  writeFileSync(join(dir, file), await res.text());
}
writeFileSync(join(dir, "COMMIT"), sha + "\n");
console.log(`vendor/puzzlescript pinned to ${sha}`);
