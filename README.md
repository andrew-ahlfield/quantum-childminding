# Quantum Childminding

> Schrodinger's daughter is a difficult girl. Look away for a second and you'll lose her.

A [PuzzleScript](https://www.puzzlescript.net) puzzle game. Until the nanny sees the girl, she
could be anywhere: every pink dot is a place she might be. Whatever is in the nanny's line of
sight collapses, and the dots she can't see keep spreading. Corner her before she reaches a door.

Eight levels across two level sets, with crates, doors and a short story.

## Play

- The deployed build (URL to come once the Netlify site exists).
- Locally: `npm run build`, then open `dist/index.html` in a browser.
- In the PuzzleScript editor: paste `game/quantum-childminding.txt` into
  <https://www.puzzlescript.net/editor.html> and press Run.

Arrow keys move, Z undoes, R restarts.

## How this repo is put together

PuzzleScript games are one plain-text file. The engine is the
[PuzzleScript](https://github.com/increpare/PuzzleScript) project by Stephen Lavelle (MIT).

| Path | What it is |
|------|------------|
| `game/quantum-childminding.txt` | The game. This is the only file most contributions touch. |
| `vendor/puzzlescript/` | PuzzleScript's standalone export template, pinned to the upstream commit in `COMMIT`, plus the engine's license. |
| `scripts/build.mjs` | Inlines the game into the template, the same way the editor's Export button does, and writes `dist/index.html`. |
| `scripts/update-engine.mjs` | Re-pins the template to a newer upstream commit. |
| `test/` | Checks that the build is complete and embeds the game exactly. `npm test`. |
| `archive/` | Earlier community versions, kept for the record. Not built. |

No dependencies to install: Node 22 or newer is enough.

```bash
npm test
```

```bash
npm run build
```

To move to a newer PuzzleScript, pick a commit from
[upstream](https://github.com/increpare/PuzzleScript/commits/master), run
`npm run update-engine -- <full sha>`, then test and play the game through before committing.

## Contributing

New levels, mechanics, art and story are all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## History

Mark Richardson (Hand-E-Food) released the game in September 2017 on the
[PuzzleScript Google Group](https://groups.google.com/g/puzzlescript/c/LgEvfURAR1s), and the
community started adding to it within days. The first commits in this repo's history are his,
imported from [his original gist](https://gist.github.com/Hand-E-Food/f7712f978d624c66f1f2dd9cb0b47f82).
Later versions lived in gists too, which is why this repo exists: one place for the current game.

In 2023 Mark handed the project on, asking only that the original level designers keep their
credit. [CREDITS.md](CREDITS.md) is where that credit lives.

## License

[MIT](LICENSE). The bundled PuzzleScript engine is also MIT; its notice is in
`vendor/puzzlescript/LICENSE` and travels inside every build.
