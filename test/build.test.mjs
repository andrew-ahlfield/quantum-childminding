import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  EDITOR, EDITOR_PAGE, EDIT_ON_GITHUB, ENGINE_LICENSE, FAVICON, FONT, GAME, TEMPLATE,
  buildEditorHtml, buildHtml as build, loadFont, pixelText, readPrelude,
} from "../scripts/build.mjs";

const parts = {
  template: readFileSync(TEMPLATE, "utf8"),
  engineLicense: readFileSync(ENGINE_LICENSE, "utf8"),
  favicon: readFileSync(FAVICON, "utf8"),
  font: loadFont(readFileSync(FONT, "utf8")),
};
const source = readFileSync(GAME, "utf8");
const buildHtml = (src) => build(src, parts);
const sourceOf = (html) => {
  const m = html.match(/const sourceCode=(".*?");compile\(/s);
  assert.ok(m, "sourceCode assignment not found");
  return JSON.parse(m[1]);
};

test("the game declares a title and author", () => {
  const meta = readPrelude(source);
  assert.match(meta.title, /Quantum Childminding/);
  assert.ok(meta.author);
});

test("every template placeholder is filled", () => {
  assert.doesNotMatch(buildHtml(source), /__GAMEDAT__|__GAMETITLE__|___BGCOLOR___|___TEXTCOLOR___|__HOMEPAGE/);
});

test("the embedded game source round-trips exactly", () => {
  assert.equal(sourceOf(buildHtml(source)), source);
});

test("source text cannot break out of the script tag or trigger $ patterns", () => {
  const tricky = "title </script><b>$& $1 $$\nauthor x\n";
  const html = buildHtml(tricky);
  assert.doesNotMatch(html, /<\/script><b>/);
  assert.equal(sourceOf(html), tricky);
});

test("the output starts with a doctype and carries the engine's MIT notice", () => {
  const html = buildHtml(source);
  assert.match(html, /^<!doctype html>\n<!--\nPuzzleScript engine/i);
  assert.match(html, /Copyright \(c\) 2013 Stephen Lavelle/);
});

test("the favicon is inlined into the head", () => {
  const head = buildHtml(source).split("</head>")[0];
  assert.match(head, /<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml,%3Csvg/);
});

test("the footer links to the editor and the repo, drawn in the game's font", () => {
  const html = buildHtml(source);
  assert.ok(html.includes(`href="${EDITOR_PAGE}"`));
  assert.match(html, /aria-label="Add your own level"/);
  assert.doesNotMatch(html, /id="homepagelink"/);
});

test("pixel text draws one 5x10 cell per character", () => {
  const svg = pixelText("Hi", parts.font);
  assert.match(svg, /viewBox="0 0 11 10"/);
  assert.match(svg, /<path fill="currentColor" d="M/);
});

test("the editor opens this game and submits to GitHub", () => {
  const html = buildEditorHtml(readFileSync(EDITOR, "utf8"), parts.favicon);
  assert.ok(html.includes(EDIT_ON_GITHUB));
  assert.doesNotMatch(html, /href="Documentation\//);
  assert.match(html, /<title>Edit Quantum Childminding/);
});
