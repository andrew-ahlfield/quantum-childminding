# Quantum Childminding

A PuzzleScript game. The whole game is `game/quantum-childminding.txt`; `npm run build` inlines it
into the pinned PuzzleScript export template (`vendor/puzzlescript/`) and writes `dist/index.html`,
then copies PuzzleScript's editor to `dist/editor/` opened on the game, with Submit in place of
Share (`?demo=quantum-childminding`).

- **Shape: deployed.** Static site on Netlify, so the two-branch model applies: `feature/*` into
  `dev`, and `prod` fast-forwarded to `dev` to ship. **Dev CD: yes** (2026-10-19): every push to
  `dev` deploys https://dev--quantum-childminding.netlify.app, and every pull request gets a
  playable deploy preview at `https://deploy-preview-<PR number>--quantum-childminding.netlify.app`.
  `prod` is admins-only and `dev` takes reviewed pull requests (GitHub rulesets, admin bypass).
- **Infrastructure is managed by hand, deliberately** (Andrew, 2026-10-20). This is an open
  source hobby project, not Exagrow work, so the repo, its rulesets and collaborators, and the
  Netlify site live in the GitHub and Netlify UIs and NOT in iac-exagrow or any OpenTofu; this
  overrides the global "Infrastructure lives in OpenTofu" rule. Never use Exagrow credentials for
  it: no `bin/with-secrets`, no Exagrow Netlify token, no Secret Manager. The build needs no
  secrets and has no environment variables. To check a deploy, use what is public: Netlify's
  "Pages changed" check run lands on a pull request once its preview is built, and the dev and
  preview URLs can be fetched and played directly.
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
