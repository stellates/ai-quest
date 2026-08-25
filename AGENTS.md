# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free static web game. All application files live at the repository root:

- `index.html` defines the Japanese game screens and accessible controls.
- `app.js` contains the runtime state, service selection, prompt selection, browser-local history, audio, and result navigation.
- `style.css` contains the original 8bit RPG-like visual system, animations, and responsive layout rules.

Keep new static resources in named root-level directories such as `assets/images/` or `assets/audio/`. Keep third-party audio provenance in `THIRD_PARTY_ASSETS.md`. There is no package manager, build directory, or server-side component.

## Build, Test, and Development Commands

No package manager or build pipeline is configured. Run the game through a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. A server avoids browser URL and audio restrictions that can vary with `file://`.

For a documentation-only change, confirm that only the intended documentation files changed. For implementation changes, load the page, exercise both hero choices, enter a name, choose a service, receive and copy a prompt, open the selected service, redraw the prompt, change the service, restart, and toggle sound. For CSS or layout changes, check a desktop viewport and a narrow viewport under 640px.

## Coding Style & Naming Conventions

Follow the existing plain HTML/CSS/JavaScript approach; do not add a framework without a clear need. Use two-space indentation in HTML and readable camelCase names in JavaScript (`startDialog`, `selectService`, `showQuestResult`). Use kebab-case for CSS classes and IDs (`screen-result`, `hero-card`). Keep Japanese user-facing copy in the source, preserve semantic elements and ARIA labels, and prefer small focused functions over duplicated game logic.

There is no formatter or linter configured. Before submitting, inspect the diff and keep formatting consistent with the surrounding file.

## Testing Guidelines

Automated tests are not configured. For behavior changes, perform the manual browser flow above and verify that the console has no errors. Confirm that all five service choices are shown, the selected service is retained when redrawing, service changes work from the result screen, keyboard activation works for buttons and the name field, and the selected service URL opens correctly. Check static and dynamic asset requests for errors when asset paths change.

## Commit & Pull Request Guidelines

Use short imperative commit messages, for example `Update public project documentation`. Pull requests should explain the user-visible change, list checks performed, and include before/after screenshots for visual changes.

## Architecture & Configuration Notes

The game is client-only. `state` in `app.js` is the single runtime state store, and `index.html` provides all screens that are shown or hidden by JavaScript. The `services` array is the source of truth for service names, IDs, and destination URLs. The `prompts` array is the source of truth for the text prompts and their selection hints.

The user explicitly selects one service from ChatGPT, Gemini, Copilot, Claude, and Grok. The king then gives one randomly selected text prompt. `rerollQuest()` keeps `state.selectedService` and selects only a new prompt. The service can be changed from the result screen. Recent prompt IDs are stored in browser `localStorage` to reduce immediate repeats; user-entered names and other game state remain in the browser.

AI QUEST does not call an external AI API, use a backend, or send user data to a server. It copies the prompt and opens the selected service URL when the user activates the corresponding control.

## Product & Creative Guidelines

- The visual direction is an original 8bit RPG-like or retro-fantasy RPG-like work.
- Do not copy or reproduce any specific existing game's characters, sprites, maps, music, sound effects, logos, item names, spell names, dialogue, terminology, or distinctive UI assets.
- Use original generic fantasy terminology and project-specific names.
- Keep the project UI, copy, and self-created SVG assets original. Record the source, license, and attribution requirements for any third-party media in `THIRD_PARTY_ASSETS.md`.
- The king should be verbose, slightly annoying, humorous, and persistent.
- Dialogue and choices should feel like a game, and humor must not make the prompt's purpose unclear.

## Prompt and Service Rules

- Keep the game as static HTML, CSS, and JavaScript for GitHub Pages.
- Keep the experience limited to playful text prompts. Do not add image, music, or video generation routes without an explicit product change.
- Manage prompt content in the `prompts` array in `app.js`; do not duplicate prompt data in event handlers.
- Manage service definitions and destination URLs in the `services` array in `app.js`; do not scatter service URLs through the UI handlers.
- Let the user choose the service explicitly. Do not select or change a service based on prompt content, the user's name, or hidden inference.
- Keep redrawing limited to selecting another prompt while retaining the selected service.
- Keep user data in the browser unless a future feature explicitly changes that boundary.
- Do not introduce remote inference, analytics, a backend, or an external API for the game.

## Technical Constraints

- The production target is GitHub Pages.
- Keep the application runnable as static files.
- Do not introduce Node.js, npm, bundlers, frameworks, databases, or server-side components unless explicitly requested.
- Prefer browser-native APIs such as Web Audio API and `localStorage`.
- Avoid unnecessary external dependencies and CDNs.
