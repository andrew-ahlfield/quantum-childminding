import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FAVICON, GAME, buildHtml as build, readPrelude } from "../scripts/build.mjs";

const vendor = join(import.meta.dirname, "..", "vendor", "puzzlescript");
const template = readFileSync(join(vendor, "standalone_inlined.txt"), "utf8");
const license = readFileSync(join(vendor, "LICENSE"), "utf8");
const source = readFileSync(GAME, "utf8");
const favicon = readFileSync(FAVICON, "utf8");
const buildHtml = (src, tpl, lic) => build(src, tpl, lic, favicon);

test("the game declares a title and author", () => {
  const meta = readPrelude(source);
  assert.match(meta.title, /Quantum Childminding/);
  assert.ok(meta.author);
});

test("every template placeholder is filled", () => {
  const html = buildHtml(source, template, license);
  assert.doesNotMatch(html, /__GAMEDAT__|__GAMETITLE__|___BGCOLOR___|___TEXTCOLOR___|__HOMEPAGE/);
});

test("the embedded game source round-trips exactly", () => {
  const html = buildHtml(source, template, license);
  const m = html.match(/const sourceCode=(".*?");compile\(/s);
  assert.ok(m, "sourceCode assignment not found");
  assert.equal(JSON.parse(m[1]), source);
});

test("source text cannot break out of the script tag or trigger $ patterns", () => {
  const tricky = "title </script><b>$& $1 $$\nauthor x\n";
  const html = buildHtml(tricky, template, license);
  assert.doesNotMatch(html, /<\/script><b>/);
  const m = html.match(/const sourceCode=(".*?");compile\(/s);
  assert.equal(JSON.parse(m[1]), tricky);
});

test("the output starts with a doctype and carries the engine's MIT notice", () => {
  const html = buildHtml(source, template, license);
  assert.match(html, /^<!doctype html>\n<!--\nPuzzleScript engine/i);
  assert.match(html, /Copyright \(c\) 2013 Stephen Lavelle/);
});

test("the favicon is inlined into the head", () => {
  const html = buildHtml(source, template, license);
  const head = html.slice(0, html.indexOf("</head>"));
  assert.match(head, /<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml,%3Csvg/);
});
