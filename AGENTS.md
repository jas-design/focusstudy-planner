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

Before considering a feature complete:

- test it
- check browser console errors
- test mobile layout
- test data persistence
- test empty states
- test invalid input
- test keyboard navigation

Do not add features that are not required by PRODUCT-SPEC.md.
## Codex Skills

Use repository-local skills for recurring FocusStudy workflows.

- For any visual or UI design change, invoke `$focusstudy-visual-direction`.
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
- Read product, design, QA, and architecture documents only when the current task requires them.
- For small CSS/UI adjustments, inspect only relevant selectors and nearby context.
- Do not open `src/js/render.js` or `src/js/app.js` for CSS-only tasks unless markup or behavior must change.
- Do not invoke `$focusstudy-page-redesign` for minor visual adjustments or `$focusstudy-visual-qa` after every micro-adjustment.
- Use `$focusstudy-visual-direction` only when design-language guidance is needed.
- Prefer targeted search with `rg` before opening large files.
- Prefer the smallest correct patch and do not refactor unrelated code.
- Do not repeat analysis of an unchanged visual reference unless a new comparison is requested.

### Micro Adjustment

Use for spacing, size, alignment, typography, color, shadow, radius, simple responsive fixes, and isolated CSS defects.

1. Locate the relevant selector.
2. Read only nearby code.
3. Make the smallest patch.
4. Run only directly relevant checks.
5. Do not perform repository-wide QA or inspect generated artifacts.

### Full Page Redesign

Use only for substantial information-architecture, layout, navigation, or page-wide redesign work. Use the appropriate FocusStudy redesign skills and full responsive QA.
