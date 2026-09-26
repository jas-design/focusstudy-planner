---
name: focusstudy-visual-direction
description: Apply the permanent FocusStudy visual direction for colors, typography, cards, layout styling, icons, illustrations, shadows, forms, navigation, hierarchy, and responsive visual behavior.
metadata:
  short-description: FocusStudy visual direction
---

# FocusStudy Visual Direction

Use this skill whenever a task changes FocusStudy's visual design: colors, typography, cards, layout styling, icons, illustrations, shadows, buttons, forms, navigation styling, visual hierarchy, or responsive visual behavior.

Keep this skill focused on visual direction. Do not change business logic during purely visual tasks.

## Mood

FocusStudy should feel warm, cozy, calm, welcoming, premium, modern, student-focused, easy to scan, and slightly playful while still adult.

It must not feel corporate, clinical, generic SaaS, CRM-like, childish, visually overwhelming, neon, overly pink, or overly monochromatic.

The design priority is: reduce overwhelm and make the next action obvious.

Every screen should have:

- one dominant purpose
- one obvious primary action
- clear grouping
- clear hierarchy
- controlled information density

## Palette

Use a warm ivory or cream background with warm white primary surfaces. Primary text should be warm charcoal rather than pure black.

Supporting accents may include sage, mint, peach, coral, butter yellow, lavender, and soft blue.

Pastels should mainly appear in:

- icon tiles
- small status surfaces
- progress indicators
- active navigation
- subtle card tints
- lightweight illustrations

Large surfaces should remain neutral. Avoid scattering hardcoded colors through component files; prefer the existing SCSS token system.

## Cards And Surfaces

Major cards should generally use an 18-24px radius, restrained warm shadows, and enough whitespace to separate content. Prefer surface contrast and spacing before adding visible borders.

Do not make every section an equal card. Build visual hierarchy with primary, secondary, and supporting areas.

## Typography

Use offline-safe system fonts only. Do not use Google Fonts or remote font assets.

Create a strong but friendly hierarchy. Avoid excessive bold text and avoid giant normal page titles.

## Icons And Illustrations

Icons should be inline SVG, not external icon libraries or CDNs. Keep a rounded stroke style with round caps and joins, consistent proportions, and `currentColor` where practical. Use soft pastel icon containers for important feature icons.

Illustrations should be original, lightweight, offline-safe SVGs. Good subjects include books, notebooks, pencils, plants, desk lamps, suns, stars, and timers.

Do not copy characters or copyrighted reference artwork. Do not introduce a mascot unless explicitly requested.

## Navigation

Desktop navigation should use a compact left sidebar with vertically grouped primary destinations. Active items should use a soft sage treatment. Secondary and settings actions should be visually separated from primary navigation.

## Responsive Direction

Desktop layouts may use multi-column composition. Mobile must become a deliberate single-column experience, not just a shrunken desktop layout.

On mobile, prioritize information order, readable text, usable controls, and calm spacing over preserving desktop density.

## Reference Images

When a task provides a reference image, analyze it for visual hierarchy, spacing, layout proportions, color relationships, icon language, illustration usage, shadows, card treatment, and density.

Use references for design principles and mood. Do not copy proprietary artwork, branding, characters, exact text, or exact layouts.

## Technical Constraints

FocusStudy must remain standalone, offline, vanilla JavaScript, SCSS, LocalStorage-based, and free of CDNs, runtime dependencies, external APIs, and remote assets.
