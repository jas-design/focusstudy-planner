---
name: focusstudy-visual-qa
description: Perform focused UI, UX, responsive, theme, and regression QA after FocusStudy page redesigns or major visual layout changes, without adding new features.
metadata:
  short-description: FocusStudy visual QA
---

# FocusStudy Visual QA

Use this skill after a FocusStudy page redesign, major layout change, navigation change, new card work, visual reference implementation, or responsive refactor.

Do not add new features during this QA pass. Fix visual, responsive, interaction, and regression issues caused by the changed screen. Keep scope focused.

## Layout QA

Inspect the requested page for:

- overlapping components
- broken grid areas
- unintended stacking
- large accidental empty spaces
- awkward height matching
- clipped content
- overflowing SVGs
- incorrect z-index
- unnecessary absolute positioning
- negative-margin hacks

Prefer structural Grid/Flex fixes over visual hacks.

## Hierarchy QA

Verify the page has:

- one dominant purpose
- a clear primary action
- visually distinct primary vs secondary information
- predictable grouping
- reasonable density

The page should feel calm and easy to scan, not like every element has equal emphasis.

## Interaction QA

Find controls that visually appear interactive but are disabled, decorative, nonfunctional, or misleading.

Either connect them to existing functionality or remove/hide them. Do not add scope-heavy functionality just to justify decorative UI.

## Typography QA

Check headings, body text, metadata, labels, button text, and long titles.

Avoid:

- character-by-character wrapping
- unreadably small text
- oversized normal page titles
- clipped labels
- button text that overflows its control

## Icon And SVG QA

Check:

- consistent SVG stroke style
- `currentColor` use where practical
- alignment and sizing
- light/dark mode behavior
- no external icon dependencies
- decorative SVG uses `aria-hidden` where appropriate

## Responsive QA

Test approximately these widths when feasible:

- 1720px
- 1440px
- 1280px
- 1024px
- 768px
- 390px
- 375px

Verify:

- no horizontal scroll
- correct breakpoint transitions
- desktop-only and mobile-only controls appear correctly
- mobile information order is intentional
- grids collapse before becoming cramped

## Light And Dark QA

Check both themes. Pastel colors must maintain sufficient contrast, and surfaces, text, charts, icons, buttons, forms, and active navigation must remain legible.

## Functional Regression QA

Test only functionality related to the changed screen.

Examples:

- Today: Quick Capture, Energy, One Thing, Top 3, Focus CTA
- Focus: assignment selection, timer, start, pause, resume, finish
- Schedule: week ordering, filters, views
- Assignments: filters, search, CRUD, subtasks

Do not broaden into unrelated app-wide feature work unless the changed screen depends on shared shell behavior.

## Build QA

Run the existing build process and confirm `dist/FocusStudyPlanner.html` matches the source behavior.

Do not finish with known overlap, broken responsive behavior, misleading controls, console errors, or major visual inconsistencies.

## Final Report

Keep the final report concise with:

- PASS: what was checked and passed
- FIXED: what was corrected
- REMAINING: anything not verified or still at risk
