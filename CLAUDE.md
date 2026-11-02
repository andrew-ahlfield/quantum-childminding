# Quantum Childminding

A PuzzleScript game. The whole game is `game/quantum-childminding.txt`; `npm run build` inlines it
into the pinned PuzzleScript export template (`vendor/puzzlescript/`) and writes `dist/index.html`,
then copies PuzzleScript's editor to `dist/editor/` opened on the game, with Submit in place of
Share (`?demo=quantum-childminding`).

- **Deployed as a static site on Netlify.** Work goes on `feature/*` into `dev`, and `prod` is
  fast-forwarded to `dev` to ship. Every push to `dev` deploys
  https://dev--quantum-childminding.netlify.app, and every pull request gets a playable deploy
  preview at `https://deploy-preview-<PR number>--quantum-childminding.netlify.app`. `prod` is
  admins-only and `dev` takes reviewed pull requests (GitHub rulesets, admin bypass).
- **Infrastructure is managed by hand, deliberately.** This is an open source hobby project, so
  the repo, its rulesets and collaborators, and the Netlify site live in the GitHub and Netlify
  UIs, with no infrastructure as code. The build needs no secrets and has no environment
  variables. To check a deploy, use what is public: Netlify's "Pages changed" check run lands on
  a pull request once its preview is built, and the dev and preview URLs can be fetched and
  played directly.
- **Verify** with `npm test`, `npm run build`, then play the change in a browser (the `game`
  entry in `.claude/launch.json` serves `dist/`). A level change is not verified until it has
  been won.
- **Credit is a condition of the handover.** Mark Richardson asked that the original level
  designers stay credited. Never drop a name from `CREDITS.md` or the in-game credits message.
- **Do not edit `vendor/puzzlescript/` by hand.** Re-pin it with `npm run update-engine`; page
  and editor changes go in `scripts/build.mjs`.
- **Text pages**: the comment above the first message explains the 34-column layout. To check
  every page without playing, open the built game and run `messagetext = state.levels[i].message;
  drawMessageScreen(); canvasResize();` for each level `i` that has a message.
