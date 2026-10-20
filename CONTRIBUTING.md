# Contributing

This game grew because people who played it wanted to add to it. Please keep doing that.

## The quick way: right in the editor

1. Press **Edit this game** under the game. The PuzzleScript editor opens with the current
   version loaded.
2. Make your change and play it through with **RUN**. If you added a level, make sure it can be
   won.
3. Press **SUBMIT**. It copies your version and opens the game file on GitHub: press **Fork this
   repository** if asked, paste your version over the text, then **Propose changes** and
   **Create pull request**. The pull request gets a link where anyone can play your version.

No GitHub account? Open an [issue](../../issues/new) with your game attached and say what you
changed. A maintainer will turn it into a commit with your name on it.

## The usual way: a pull request

1. Fork the repo and edit `game/quantum-childminding.txt`. Iterating in the PuzzleScript editor
   and pasting the result back is fine.
2. Run `npm test` and `npm run build`, then open `dist/index.html` and play your change.
3. Add yourself to [CREDITS.md](CREDITS.md) and to the credits message at the end of the game.
4. Sign off your commits (`git commit -s`, see below) and open a pull request against `dev`.

Good pull requests are small: one level or one mechanic at a time is much easier to review and
to play-test than a whole new level set.

## What to keep in mind

- **Levels should be winnable and fair.** The child moves randomly, so test a level more than
  once. Say in the pull request how you beat it.
- **Keep earlier levels' credit intact.** If you rework someone else's level, say so in
  CREDITS.md rather than replacing their name.
- **Story and messages** are part of the game. New levels that fit the story, or extend it,
  are best.
- **Text pages wrap at 34 columns.** The note and any other character without a font glyph
  take two, and leading spaces are trimmed; the comment above the first message in the game
  explains the workaround. Read every page you touch in the built game, not just in the source.
- **Engine changes belong upstream.** If you need PuzzleScript itself to change, that goes to
  [increpare/PuzzleScript](https://github.com/increpare/PuzzleScript).

## Sign-off (Developer Certificate of Origin)

Every commit needs a `Signed-off-by:` line, which `git commit -s` adds. It certifies the
[Developer Certificate of Origin](https://developercertificate.org/): that you wrote the change
(or have the right to submit it), and that you are contributing it under this project's
[MIT license](LICENSE). You keep the copyright to your work; you are licensing it, not handing
it over.

Contributions sent as an issue instead of a pull request are covered the same way: by
submitting, you agree they can be included under the MIT license.
