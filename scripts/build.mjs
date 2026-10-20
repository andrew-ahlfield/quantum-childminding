// Builds the site in dist/:
//   index.html   the game script inlined into PuzzleScript's standalone export template,
//                the same substitution the editor's "Export" button performs
//                (src/js/buildStandalone.js upstream), with the page chrome restyled.
//   editor/      PuzzleScript's own editor, opened on this game, whose Share button
//                becomes Submit: it copies the edited game and opens it on GitHub.

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendor = join(root, "vendor", "puzzlescript");

export const GAME = join(root, "game", "quantum-childminding.txt");
export const FAVICON = join(root, "game", "favicon.svg");
export const TEMPLATE = join(vendor, "src", "standalone_inlined.txt");
export const ENGINE_LICENSE = join(vendor, "LICENSE");
export const FONT = join(vendor, "src", "js", "font.js");
export const EDITOR = join(vendor, "src", "editor.html");

export const REPO = "https://github.com/andrew-ahlfield/quantum-childminding";
export const EDIT_ON_GITHUB = `${REPO}/edit/dev/game/quantum-childminding.txt`;
export const EDITOR_PAGE = "editor/editor.html?demo=quantum-childminding";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Plain functions as replacements, so "$" in the inserted text is never read as a
// replacement pattern.
const sub = (html, pattern, value) => html.replace(pattern, () => value);

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

// The engine's bitmap font (vendor .../js/font.js): each glyph is 12 rows of 5 pixels.
export function loadFont(fontJs) {
  return new Function(`${fontJs}\nreturn font;`)();
}

// Text drawn in the game's own pixel font, so the page's links match the screen above them.
// Rows 0-1 of every glyph are empty, so they are cropped.
export function pixelText(text, font) {
  let d = "";
  [...text].forEach((ch, i) => {
    const rows = (font[ch] ?? "").trim().split("\n");
    rows.forEach((row, y) => {
      [...row].forEach((bit, x) => {
        if (bit === "1") d += `M${i * 6 + x} ${y - 2}h1v1h-1z`;
      });
    });
  });
  const w = text.length * 6 - 1;
  return `<svg class="pixeltext" viewBox="0 0 ${w} 10" width="${w * 2}" height="20" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="${d}"/></svg>`;
}

const PAGE_STYLE = `<style>
/* Quantum Childminding: the game draws its own title, so the page shows only the game and
   a footer in the game's pixel font. */
.title { display: none; }
.gameContainer { top: 0.5em; bottom: 3.5em; }
.footer { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.5em 2.5em; height: auto; bottom: 1em; }
.footer a { color: #8a8a8a; line-height: 0; text-decoration: none; padding: 4px; }
.footer a:hover, .footer a:focus-visible { color: #ffffff; outline: none; }
.footer a:focus-visible { box-shadow: 0 0 0 2px #ffffff; }
</style>`;

export function buildHtml(source, { template, engineLicense, favicon, font }) {
  const meta = readPrelude(source);
  const title = meta.title ?? "PuzzleScript Game";

  let html = template;
  html = sub(html, /___BGCOLOR___/g, meta.background_color ?? "black");
  html = sub(html, /___TEXTCOLOR___/g, meta.text_color ?? "white");
  html = sub(html, /__GAMETITLE__/g, escapeHtml(title));
  // Escaping "<" keeps a "</script>" inside the game source from closing the tag.
  html = sub(html, /"__GAMEDAT__"/g, JSON.stringify(source).replace(/</g, "\\u003c"));

  const links = [
    ["Hack", EDITOR_PAGE, "Change this game in the PuzzleScript editor"],
    ["Collaborate", REPO, "Add your own level on GitHub"],
  ];
  const footer = links
    .map(([label, href, hint]) => `<a href="${href}" aria-label="${label}" title="${hint}">${pixelText(label, font)}</a>`)
    .join("\n");
  html = sub(
    html,
    /<a id="homepagelink"[^>]*>[^<]*<\/a>/,
    footer,
  );

  // Inlined rather than linked so the game stays one self-contained file.
  const icon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(favicon.trim())}">`;
  html = html.replace(/<\/title>/, (end) => `${end}\n${icon}`);
  html = html.replace(/<\/head>/, (end) => `${PAGE_STYLE}\n${end}`);

  // The page carries the PuzzleScript engine, so it carries the engine's MIT notice.
  const notice = `<!--\nPuzzleScript engine, https://github.com/increpare/PuzzleScript\n\n${engineLicense.trim()}\n-->`;
  return html.replace(/^(<!doctype html>)/i, (doctype) => `${doctype}\n${notice}`);
}

// Runs in the editor after its own listeners are attached. The upstream Share button signs
// in through puzzlescript.net's GitHub app, which cannot call back to this site, so it is
// replaced: Submit copies the edited game and opens the game file in GitHub's web editor,
// where GitHub offers a fork and a pull request to anyone without write access.
const SUBMIT_SCRIPT = `<script>
(function () {
  var EDIT_URL = ${JSON.stringify(EDIT_ON_GITHUB)};
  var ISSUE_URL = ${JSON.stringify(`${REPO}/issues/new`)};
  var old = document.getElementById("shareClickLink");
  var link = old.cloneNode(true);
  link.textContent = "SUBMIT";
  link.title = "Copy your version and propose it to Quantum Childminding on GitHub.";
  old.parentNode.replaceChild(link, old);
  link.addEventListener("click", function (e) {
    e.preventDefault();
    var box = document.createElement("textarea");
    box.value = editor.getValue();
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(box);
    window.open(EDIT_URL, "_blank", "noopener");
    consolePrint(
      "<br>" + (copied ? "Your version of the game is copied." : "Select all of your game and copy it (cmd/ctrl+A, cmd/ctrl+C).") +
      "<br>On GitHub, sign in and press <b>Fork this repository</b> if it asks. Select all of the text there, paste yours over it, then press <b>Propose changes</b> and <b>Create pull request</b>." +
      "<br>Your pull request gets a link where anyone can play your version." +
      '<br>No GitHub account? <a target="_blank" href="' + ISSUE_URL + '">Open an issue</a> and attach your game instead.',
      true
    );
  });
})();
</script>`;

export function buildEditorHtml(editorHtml, favicon) {
  let html = editorHtml;
  html = sub(html, /<title>[^<]*<\/title>/, "<title>Edit Quantum Childminding (PuzzleScript)</title>");
  html = sub(
    html,
    /<link rel="shortcut icon"[^>]*>/,
    `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(favicon.trim())}">`,
  );
  // Only the editor's files are vendored; the documentation and home page stay upstream.
  html = html.replace(/href="Documentation\//g, 'href="https://www.puzzlescript.net/Documentation/');
  html = html.replace(/href="index.html"/g, 'href="https://www.puzzlescript.net/"');
  html = html.replace(/<\/body>/, (end) => `${SUBMIT_SCRIPT}\n${end}`);
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = join(root, "dist");
  rmSync(dist, { recursive: true, force: true });
  const favicon = readFileSync(FAVICON, "utf8");
  const source = readFileSync(GAME, "utf8");

  const html = buildHtml(source, {
    template: readFileSync(TEMPLATE, "utf8"),
    engineLicense: readFileSync(ENGINE_LICENSE, "utf8"),
    favicon,
    font: loadFont(readFileSync(FONT, "utf8")),
  });
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, "index.html"), html);

  const editor = join(dist, "editor");
  cpSync(join(vendor, "src"), editor, { recursive: true });
  cpSync(ENGINE_LICENSE, join(editor, "LICENSE"));
  writeFileSync(join(editor, "editor.html"), buildEditorHtml(readFileSync(EDITOR, "utf8"), favicon));
  mkdirSync(join(editor, "demo"), { recursive: true });
  cpSync(GAME, join(editor, "demo", "quantum-childminding.txt"));

  console.log(`wrote ${dist} (index.html ${html.length} bytes, editor/)`);
}
