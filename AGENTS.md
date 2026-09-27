# FocusStudy Planner

## Project Goal

Build a commercial downloadable student planner web app intended
to be sold as a digital product.

The customer must be able to download the product and open it
locally in a modern browser without installing anything.

## Technology

Use:

- Semantic HTML5
- SCSS
- Vanilla JavaScript
- LocalStorage
- JSON for backup/export/import
- Inline SVG icons when necessary

Do NOT use:

- React
- Vue
- Astro
- Tailwind
- Bootstrap
- jQuery
- Supabase
- Firebase
- databases
- external APIs
- external CDNs
- cloud services
- runtime dependencies

## Architecture

Keep development files separated inside src/.

Production must generate ONE standalone HTML file:

dist/FocusStudyPlanner.html

The production HTML must contain all required CSS and JavaScript.

No internet connection must be required to use the planner.

## Development principles

Keep the code:

- simple
- readable
- maintainable
- modular
- well named
- easy for a human developer to modify

Avoid unnecessary abstractions and overengineering.

## UX

The interface should feel:

- clean
- modern
- calm
- premium
- minimal
- easy to scan
- responsive

Avoid overly crowded dashboards.

The primary UX principle is:

"Reduce overwhelm and make the next action obvious."

## Product

Core sections:

- Today
- Top 3 priorities
- Assignments
- Courses
- Brain Dump
- Break tasks into steps
- Focus Timer
- Exam Countdown
- Progress
- Settings
- Backup / Restore

Include:

- light mode
- dark mode
- responsive design
- keyboard accessibility
- visible focus states
- form validation
- empty states
- confirmation before destructive actions

## Storage

All user data must stay locally in the browser.

Provide:

- automatic persistence
- Export Backup as JSON
- Import Backup from JSON
- Clear All Data

Use versioned storage keys.

## Privacy

The app must not send user data anywhere.

No tracking.

No analytics.

No network requests.

## Quality

For completed features, major functional changes, full page redesigns, and release checkpoints:

- test it
- check browser console errors
- test mobile layout
- test data persistence
- test empty states
- test invalid input
- test keyboard navigation

Do not add features that are not required by PRODUCT-SPEC.md.

For a Micro Adjustment, run only checks directly related to the changed behavior.

## Codex Skills

Use repository-local skills for recurring FocusStudy workflows.

- For page-wide visual changes, new visual patterns, or changes that require FocusStudy design-language guidance, invoke `$focusstudy-visual-direction`. Do not invoke it for isolated spacing, sizing, alignment, or other micro adjustments.
- For redesigning a specific page from a visual reference, invoke `$focusstudy-visual-direction` and `$focusstudy-page-redesign`.
- After any significant layout, navigation, responsive, or visual redesign, invoke `$focusstudy-visual-qa` before considering the task complete.

Do not duplicate the full skill instructions inside normal task prompts.

When a local reference image path is provided, inspect the image before implementing the redesign.

Do not copy all skill content into AGENTS.md.

## Codex Efficiency Rules

- Minimize context use. Read only files and ranges directly relevant to the requested change.
- Never read or inspect `dist/FocusStudyPlanner.html` during normal development; it is generated output.
- Never use `dist/FocusStudyPlanner.html` as a source of truth. Edit files under `src/`.
- After a build, verify the generated file only by build success, existence, and file size unless production QA explicitly requires inspection.
- Do not include generated HTML content in diffs, summaries, or analysis.
- Do not read `release/` artifacts during ordinary development.
- Read general project documentation only when the current task requires it.
- Prefer the smallest correct patch and do not refactor unrelated code.
- Do not repeat analysis of an unchanged visual reference unless a new comparison is requested.

### Micro Adjustment

Use for spacing, size, alignment, typography, color, shadow, radius, simple responsive fixes, and isolated CSS defects.

For Micro Adjustments:

- Do not invoke any FocusStudy skill unless the task genuinely requires its guidance.
- Do not read general project documentation.
- Do not perform page-wide visual analysis.
- Do not re-analyze an unchanged design reference.
- Do not run full responsive QA or repository-wide tests.
- Inspect only the relevant selector/function and nearby context.
- Make the smallest correct patch.

A normal Micro Adjustment should usually require only one relevant source file, or at most two.

1. Locate the relevant selector or function.
2. Read only nearby code.
3. Make the smallest patch.
4. Run only directly relevant checks.

### Large File Discipline

- Never read large source files wholesale when targeted search can locate the relevant code.
- For `src/scss/_features.scss`, use `rg` to locate the selector and read only the surrounding range.
- For `src/js/render.js` and `src/js/app.js`, use `rg` or symbol search and inspect only the relevant function or range.
- Never open `dist/FocusStudyPlanner.html` or release HTML/ZIP files for development analysis.
- Prefer narrow range reads instead of dumping entire files.

### Tool Output Discipline

- Prefer `rg -n` before opening a large source file.
- Prefer targeted `git diff -- <source-file>` instead of unrestricted repository diffs.
- Use `git diff --stat` when only change size needs to be known.
- Do not print generated HTML contents or large unchanged code blocks.
- Keep command output limited to what is necessary for the current decision.

### Build Rule

Running `npm run build` is allowed when the standalone HTML needs updating. Do not open or diff the generated HTML afterward; verify only build success, file existence, and optionally file size. A successful build does not require inspecting the generated bundle.

### Full Page Redesign

Use only for substantial information-architecture, layout, navigation, or page-wide redesign work. Use the appropriate FocusStudy redesign skills and full responsive QA.

For ordinary development tasks, keep the final report concise.

Prefer:

Changed:

- ...

Verified:

- ...
