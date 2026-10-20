// Builds dist/index.html: the game script inlined into PuzzleScript's standalone
// export template. This is the same substitution the PuzzleScript editor's
// "Export" button performs (src/js/buildStandalone.js upstream), run at build time
// so the deployed game always matches the script in this repo.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const GAME = join(root, "game", "quantum-childminding.txt");
export const FAVICON = join(root, "game", "favicon.svg");
const TEMPLATE = join(root, "vendor", "puzzlescript", "standalone_inlined.txt");
const ENGINE_LICENSE = join(root, "vendor", "puzzlescript", "LICENSE");

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Prelude metadata is every line before the first section header (OBJECTS).
export function readPrelude(source) {
  const meta = {};
  for (const line of source.split(/\r?\n/)) {
    if (/^=+$/.test(line.trim())) break;
    const m = line.trim().match(/^(\w+)\s*(.*)$/);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
  }
  return meta;
}

export function buildHtml(source, template, engineLicense, favicon) {
  const meta = readPrelude(source);
  const title = meta.title ?? "PuzzleScript Game";
  let homepage = meta.homepage ?? "https://www.puzzlescript.net";
  if (!/^https?:\/\//.test(homepage)) homepage = "https://" + homepage;

  // Plain functions as replacements, so "$" in the game source is never
  // read as a replacement pattern.
  const sub = (html, pattern, value) => html.replace(pattern, () => value);

  let html = template;
  html = sub(html, /___BGCOLOR___/g, meta.background_color ?? "black");
  html = sub(html, /___TEXTCOLOR___/g, meta.text_color ?? "lightblue");
  html = sub(html, /__GAMETITLE__/g, escapeHtml(title));
  html = sub(html, /__HOMEPAGE__/g, homepage);
  html = sub(html, /__HOMEPAGE_STRIPPED_PROTOCOL__/g, escapeHtml(homepage.replace(/^https?:\/\//, "")));
  // Escaping "<" keeps a "</script>" inside the game source from closing the tag.
  html = sub(html, /"__GAMEDAT__"/g, JSON.stringify(source).replace(/</g, "\\u003c"));

  // Inlined rather than linked so the build stays one self-contained file.
  const icon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(favicon.trim())}">`;
  html = html.replace(/<\/title>/, (end) => `${end}\n${icon}`);

  // The page carries the PuzzleScript engine, so it carries the engine's MIT notice.
  const notice = `<!--\nPuzzleScript engine, https://github.com/increpare/PuzzleScript\n\n${engineLicense.trim()}\n-->`;
  return html.replace(/^(<!doctype html>)/i, (doctype) => `${doctype}\n${notice}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = buildHtml(
    readFileSync(GAME, "utf8"),
    readFileSync(TEMPLATE, "utf8"),
    readFileSync(ENGINE_LICENSE, "utf8"),
    readFileSync(FAVICON, "utf8"),
  );
  const out = join(root, "dist", "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`wrote ${out} (${html.length} bytes)`);
}
