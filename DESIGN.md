---
version: v1.1
name: "FocusStudy"
description: "A warm ivory, sage, and pastel Calm Focus visual system for an ADHD-friendly, local-first college planning app."
colors:
  background: "#f7f3eb"
  surface: "#fffdf8"
  surfaceSoft: "#f8f2e8"
  surfaceMuted: "#f2eee5"
  ink: "#272621"
  muted: "#6e6960"
  border: "#e9e3d9"
  primary: "#d96d58"
  primaryStrong: "#b85140"
  primarySoft: "#f7d8d1"
  sage: "#527b69"
  sageSoft: "#ddebe4"
  mint: "#6c9f8b"
  mintSoft: "#e7f6f0"
  peach: "#c96d58"
  peachSoft: "#fbe2d8"
  butter: "#9a762f"
  butterSoft: "#faefc7"
  blue: "#5c8996"
  blueSoft: "#e5f0f3"
  lilac: "#7d6799"
  lilacSoft: "#eee8f5"
  success: "#527b69"
  warning: "#8d6930"
  danger: "#b85140"
  darkBackground: "#211d19"
  darkSurface: "#302a24"
  darkSurfaceMuted: "#443a31"
  darkInk: "#f6efe5"
  darkMuted: "#baaca0"
  darkBorder: "#4f4439"
typography:
  sans:
    fontFamily: "ui-rounded, 'SF Pro Rounded', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
  display:
    fontFamily: "ui-rounded, 'SF Pro Rounded', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
  mono:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1.375rem"
spacing:
  section-gap: "1.25rem"
  page-max: "75rem"
  shell-gap: "1rem"
components:
  button: { radius: "0.5rem" }
  card: { radius: "1.375rem" }
  dialog: { radius: "1rem" }
  input: { radius: "0.5rem" }
  nav: { radius: "0.75rem" }
---

# FocusStudy Design System

## Overview

### Creative North Star

FocusStudy uses the Calm Focus direction: a soft student workspace with gentle focus cues, breathable panels, and obvious next actions. V1.1 moves the system toward warm ivory, sage, mint, butter, peach, and lavender accents, softer tactile cards, and a friendlier rounded system font stack while keeping the app local-first and lightweight.

### Product Context And Register

- **Audience and primary job:** US college and university students who need to see today's work, choose a small next action, and avoid overload.
- **Target market and evidence:** The product brief and [PRODUCT-SPEC.md](PRODUCT-SPEC.md) define a commercial downloadable student planner for the US market.
- **Locale and language policy:** English-first interface using local browser date/time conventions; no external localization in MVP.
- **Usage scene:** Laptop-first planning with frequent quick checks on phone-width screens.
- **Register:** Product tool, not marketing page. Visual decisions support repeated daily use.
- **Memorable signature:** A distraction-free Focus mode and a Today screen anchored by one warm Focus Now card with tiny study-desk illustrations, pastel icon tiles, and the next small action.
- **Restraint:** No oversized hero, mascot, health widgets, decorative image downloads, or crowded command centers. Small original SVG object illustrations are acceptable when they clarify the study-workspace feeling.
- **Anti-references:** Avoid generic SaaS purple gradients, beige editorial planner pages, noisy student dashboards, and gamified productivity apps.
- **Token ownership/runtime mapping:** DESIGN.md is the source of visual intent. Runtime implementation maps these tokens to SCSS custom properties in `src/scss/_tokens.scss`.

### Selected Direction

The selected direction is **Calm Focus**. Exploratory directions have been removed from the runtime UI. The interface should feel warm, clean, premium, tactile, and intentionally quiet rather than analytical or gamified.

## Colors

The V1.1 palette uses warm ivory backgrounds, creamy white surfaces, sage and mint focus cues, butter and peach supporting accents, coral primary actions, warm charcoal text, and restrained blue/lavender secondary accents. Light and dark themes preserve the same semantic hierarchy without simple inversion.

## Typography

The UI uses an offline-safe rounded system sans stack for speed and warmth. Larger Today and Focus headings use the same family at stronger scale and weight rather than requiring external fonts. Numeric timer text uses a monospace stack for stable alignment.

## Layout

The desktop shell uses a warm left sidebar, a lightweight top utility row, and a focused content canvas capped near 82rem. Tablet layouts collapse dense panels into simpler two-column groups. Mobile uses one column with a compact top menu trigger, four primary bottom destinations plus More, and large touch targets. The dashboard should show a hint of multiple areas without becoming a wall of cards.

## Elevation & Depth

Hierarchy comes from tonal surfaces, soft warm shadows, rounded proportions, and selective pastel icon containers. Borders stay subtle and structural; static page sections stay unframed unless they are repeated records, forms, dialogs, or tool panels.

## Shapes

Controls use 8px to 12px radius. Cards and large Today panels use 18px to 24px radius. The app avoids pill-heavy styling except for compact badges, course chips, and true circular controls.

## Components

### Foundational Visual States

All enabled controls have hover, active, and visible focus states. Focus rings use the primary color with offset so they remain visible in both themes. Disabled and demo-only controls look subdued but remain readable.

### Buttons And Actions

One primary action is emphasized per section. Secondary actions use outline or ghost styles. Destructive actions use danger color and remain visually separated from common actions.

### Navigation And Data Display

Desktop navigation is a compact left sidebar with brand, vertical section links, low-emphasis utility actions, and a small student status card. Calendar context belongs to Today and Schedule, not the global shell. Mobile navigation keeps Today, Schedule, Assignments, and Focus visible, with secondary destinations in an app-owned drawer. Lists transform into stacked records on narrow screens and preserve status, due date, and course context.

### Forms And Overlays

MVP forms use native inputs, native selects, native date fields, and native time fields because platform-owned popup geometry is accepted for the downloadable local app. Forms use visible labels, `novalidate`, calm help text, and reserved error/status areas.

### Iconography

Use inline SVG icons for navigation, compact action cues, and important Today icon tiles. Icons should use rounded caps/joins, minimal detail, and pastel containers on priority cards. Text labels remain present for primary navigation and important actions.

### Motion

Motion is minimal: short hover transitions and a gentle section reveal. Reduced motion removes transform transitions and keeps opacity changes brief.

### Content And Data Visualization

Copy should be plain and action-oriented. Empty states tell the user the next useful action. Progress visuals are informational and non-gamified.

## Do's And Don'ts

- **Do:** Keep Today calm, scannable, and biased toward the next action.
- **Do:** Use course color chips consistently across assignments, exams, and progress.
- **Don't:** Add motivational clutter, streaks, social comparison, or marketing copy inside the app shell.
- **Don't:** Depend on color alone for overdue, complete, selected, or error states.
