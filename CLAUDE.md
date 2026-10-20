# Quantum Childminding

A PuzzleScript game. The whole game is `game/quantum-childminding.txt`; `npm run build` inlines it
into the pinned PuzzleScript export template (`vendor/puzzlescript/`) and writes `dist/index.html`.

- **Shape: deployed.** Static site on Netlify, so the two-branch model applies: `feature/*` into
  `dev`, and `prod` fast-forwarded to `dev` to ship. **Dev CD: yes** (2026-10-19): every push to
  `dev` deploys https://dev--quantum-childminding.netlify.app, and every pull request gets a
  playable deploy preview. The repo and Netlify site are declared in iac-exagrow
  (`github/repositories.tf`, `netlify/sites.tf`), not created by hand.
- **Verify** with `npm test`, `npm run build`, then play the change in a browser (the `game`
  entry in `.claude/launch.json` serves `dist/`). A level change is not verified until it has
  been won.
- **Credit is a condition of the handover.** Mark Richardson asked that the original level
  designers stay credited. Never drop a name from `CREDITS.md` or the in-game credits message.
- **Do not edit `vendor/puzzlescript/` by hand.** Re-pin it with `npm run update-engine`.
