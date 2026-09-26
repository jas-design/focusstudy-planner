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