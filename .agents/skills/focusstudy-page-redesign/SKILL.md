---
name: focusstudy-page-redesign
description: Redesign one FocusStudy screen from a supplied visual reference while preserving existing functionality, state, storage, and the established FocusStudy visual direction.
metadata:
  short-description: Redesign one FocusStudy screen from a reference
---

# FocusStudy Page Redesign

Use this skill when the user asks to redesign a page, apply a reference image, change a page layout, improve UX hierarchy, make a screen warmer or cozier, reorganize page content, or reproduce the established FocusStudy visual direction.

Always use `$focusstudy-visual-direction` as the permanent design-language source before changing code. If that skill is unavailable, say so and continue only with the existing local design tokens and visible FocusStudy patterns.

## Scope

Redesign one requested screen at a time. Do not redesign unrelated screens unless a shared-shell change is explicitly necessary for the requested screen.

Preserve existing business logic, LocalStorage behavior, state and render architecture, user data shape, and working event handlers unless the requested UI change requires a focused adjustment.

Avoid feature creep, duplicate state, duplicate functionality, fake production data, external icon/image/UI/chart dependencies, and redesigns that only change colors or move cards around.

The finished result must clearly reflect the reference direction while remaining an original FocusStudy design.

## Before Changing Code

Inspect only what is necessary:

1. Identify the requested page and its route, section, or screen id.
2. Inspect the existing page markup and rendering path.
3. Inspect the SCSS that controls that page and any shared components it uses.
4. Inspect related event handlers or state only where required to preserve functionality.
5. Inspect the supplied visual reference when a path or image is provided.
6. Compare CURRENT vs TARGET before implementation.

Do not blindly read every project document. Read docs only when they answer a concrete question about product scope, design tokens, architecture, or build behavior.

## CURRENT Analysis

For the current screen, determine:

- current information architecture
- existing functionality and required interactions
- layout problems
- overlap, clipping, wrapping, or overflow issues
- unnecessary UI
- fake, disabled, decorative, or nonfunctional controls that look interactive

Remove or hide controls that appear interactive but do not work, such as fake search, decorative notification buttons, or disabled controls styled as active. Do not silently assign user state from decorative controls.

## TARGET Analysis

From the visual reference and `$focusstudy-visual-direction`, determine:

- page hierarchy
- primary action
- grid structure
- card structure
- primary, secondary, and supporting content
- visual emphasis
- spacing, density, palette relationships, illustration style, icon treatment, and other reference patterns worth adapting

Do not copy branding, characters, proprietary art, exact text, or exact UI from a reference image.

## Implementation Principles

Prefer existing FocusStudy state/render architecture, SCSS components, design tokens, and SVG language.

Preserve business logic and LocalStorage behavior. Avoid duplicate state, duplicated functionality, and unrelated screen redesigns.

For layout:

- use CSS Grid and Flex structurally
- avoid absolute positioning for functional layout
- avoid negative-margin hacks
- avoid arbitrary fixed heights
- use `minmax(0, ...)`
- set `min-width: 0` on grid/flex children that can shrink
- collapse columns before content becomes cramped

For cards:

- do not turn every section into an equal card
- decide what should be visually dominant
- create a clear hierarchy: primary, secondary, supporting

## References, Images, And Icons

If a reference path is provided, inspect that file.

Adapt spacing, density, layout principles, hierarchy, palette relationships, illustration style, and icon treatment. Do not copy proprietary artwork, branding, characters, exact text, or exact layouts.

Prefer original inline or local SVG illustrations. Do not download remote images unless explicitly requested and legally appropriate.

Reuse FocusStudy's SVG language. Do not introduce external icon dependencies.

## Responsive Validation

Validate approximately these widths when feasible:

- 1720px
- 1440px
- 1280px
- 1024px
- 768px
- 390px
- 375px

Verify no overlap, no clipping, no horizontal overflow, no character-by-character text wrapping, correct information order, usable controls, and intentional mobile composition.

## Completion Checklist

After implementation:

1. Run the existing build.
2. Update `dist/FocusStudyPlanner.html`.
3. Verify the standalone build reflects the redesign.
4. Run focused regression tests for any functionality touched by the page.
5. Compare the result against the reference.

Do not consider the task complete if only colors changed or cards moved. The before/after visual difference must be meaningful, functional, and consistent with FocusStudy.
