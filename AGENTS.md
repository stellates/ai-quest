# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free static web game. All application files live at the repository root:

- `index.html` defines the Japanese game screens and accessible controls.
- `app.js` contains game state, question branching, scoring, audio effects, and result navigation.
- `style.css` contains the pixel-art visual system, animations, and responsive layout rules.

Keep new static resources in a named root-level directory such as `assets/` if needed. There is currently no separate test or build directory.

## Build, Test, and Development Commands

No package manager or build pipeline is configured. Run the game through a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. A server avoids browser URL/audio restrictions that can vary with `file://`.

Validate changes by loading the page, starting a diagnosis, selecting both hero options, entering a name, completing both answer paths, toggling sound, and activating the result link. For CSS or layout changes, check a desktop viewport and a narrow viewport (under 640px).

## Coding Style & Naming Conventions

Follow the existing plain HTML/CSS/JavaScript approach; do not add a framework without a clear need. Use two-space indentation in HTML and readable camelCase names in JavaScript (`startDialog`, `finishDiagnosis`). Use kebab-case for CSS classes and IDs (`screen-result`, `hero-card`). Keep Japanese user-facing copy in the source, preserve semantic elements and ARIA labels, and prefer small focused functions over duplicating game logic.

There is no formatter or linter configured. Before submitting, inspect the diff and keep formatting consistent with the surrounding file.

## Testing Guidelines

Automated tests are not configured. Perform the manual browser flow described above after behavior changes, and verify the console has no errors. Confirm external result URLs still open correctly and that keyboard activation works for buttons and the name field.

## Commit & Pull Request Guidelines

No Git history is available in this workspace, so no established commit convention can be inferred. Use short imperative messages, for example `Improve diagnosis result screen`. Pull requests should explain the user-visible change, list manual checks performed, and include before/after screenshots for visual changes.

## Architecture & Configuration Notes

The game is client-only: `state` in `app.js` is the single runtime state store, and `index.html` provides all screens that are shown or hidden by JavaScript. Result destinations are defined in the `services` map; update them there rather than scattering URLs through event handlers.

## Product & Creative Guidelines

- The game should evoke a classic 8-bit Japanese fantasy RPG, but must remain an original work.
- Do not copy or reproduce copyrighted game characters, sprites, maps, music, sound effects, logos, item names, spell names, dialogue, or distinctive UI assets.
- Avoid franchise-specific terminology such as "ルーラ" or "旅の扉".
- Prefer original generic fantasy terminology such as "転移の門", "転送装置", or other project-specific names.
- Pixel-art graphics and audio should be original or generated specifically for this project.

## Diagnosis Rules

- The diagnosis must remain deterministic and rule-based.
- Do not introduce an LLM API, remote inference API, analytics API, or backend service for diagnosis.
- User answers must remain in the browser unless explicitly required by a future feature.
- Keep scoring and hard-routing rules readable and explainable.
- Separate presentation dialogue from diagnosis logic where practical.
- Adding a new AI service should primarily require updating the service definition and scoring rules, not rewriting the game flow.

## Technical Constraints

- The production target is GitHub Pages.
- Keep the application runnable as static files.
- Do not introduce Node.js, npm, bundlers, frameworks, databases, or server-side components unless explicitly requested.
- Prefer browser-native APIs such as Web Audio API and localStorage.
- Avoid unnecessary external dependencies and CDNs.

## Tone & Game Design

- The king should be verbose, slightly annoying, humorous, and persistent.
- Questions should feel like dialogue in a game rather than a conventional web questionnaire.
- Branching dialogue is preferred over simply increasing the number of questions.
- Results should feel like obtaining equipment, a class, or a companion rather than receiving a plain recommendation.
- Humor must not make the actual recommendation misleading.