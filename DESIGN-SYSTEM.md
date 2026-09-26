# FocusStudy Design System

This document defines the visual direction for the next FocusStudy UI refactor. It is a design specification only. It does not introduce new application functionality, data models, or implementation changes.

FocusStudy is a commercial downloadable planner for college and university students who need a calm, ADHD-friendly way to understand what matters today and choose the next action.

## 1. Visual Philosophy

FocusStudy should feel like a quiet study desk, not an analytics dashboard.

The interface must reduce cognitive load by making the next action obvious. The strongest visual emphasis belongs to Today, Top 3 priorities, assignment steps, and Focus Mode. Supporting information should be available without competing for attention.

Core principles:

- Prioritize planning over reporting.
- Use lists, rows, spacing, and section rhythm before heavy cards.
- Keep one primary action visually dominant at a time.
- Make incomplete work easy to scan without making the page feel urgent or punitive.
- Prefer calm hierarchy over decorative UI.
- Make destructive actions visibly separate and confirmed.

The product should feel clean, modern, minimal, warm, premium, and easy to understand at a glance.

## 2. Reference Analysis

No image files were available in the provided attachment folder for direct screenshot inspection. This analysis is based on the visual direction described in the prompt and should be refined if actual reference screenshots are attached later.

Patterns to adopt:

- Warm off-white page backgrounds with white or near-white work surfaces.
- Clear typography hierarchy with restrained color.
- Compact navigation that does not dominate the planning area.
- Task-first layouts using rows rather than oversized dashboard widgets.
- Gentle dividers, subtle borders, and soft shadows used sparingly.
- Compact week navigation for date context without becoming a full calendar.
- Selective vertical timeline treatment for Today flow, upcoming work, or focus sessions.
- Mobile layouts that simplify into one clear column.

Patterns to avoid:

- Generic SaaS dashboards, CRM/admin layouts, or analytics-heavy cards.
- Permanent three-column desktop dashboards where all columns compete equally.
- Dense tables for student planning workflows.
- Bright gradients, glassmorphism, neon effects, or highly saturated palettes.
- Excessive shadows, nested cards, and widget grids.
- Visual clutter from overusing badges, charts, icons, and metadata.
- Copying reference screenshots literally, including proprietary layouts, brands, or artwork.

## 3. Layout Principles

Desktop layout should use a compact left navigation, a primary content area capped near 1120px to 1200px, and an optional context area only when it helps the active screen. The main planning column should remain visually dominant.

Recommended desktop structure:

- Sidebar: compact, calm, and secondary to the work area.
- Main content: 720px to 960px readable planning width.
- Optional context panel: up to 320px for exam countdown, progress, or focus context.
- Page gutters: 24px to 40px depending on viewport.

Today should not look like a generic dashboard. Use section headings, row groups, and separators. Cards are acceptable for focused tools, empty states, dialogs, and repeated item containers, but not every section needs to be boxed.

Page hierarchy should follow this order:

1. Greeting or page title.
2. Primary planning action or current focus.
3. Top 3 priorities.
4. Today's task list.
5. Overdue and upcoming work.
6. Exam countdown or progress context.

## 4. Color System

The color system should be warm, restrained, and usable in long study sessions.

Core tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#fbf5f3` | Main app background |
| `--color-surface` | `#ffffff` | Primary surfaces |
| `--color-surface-soft` | `#fff8f8` | Secondary surfaces |
| `--color-surface-muted` | `#fdecef` | Soft tinted surfaces |
| `--color-ink` | `#3e3538` | Primary text |
| `--color-text` | `#51464a` | Body text |
| `--color-muted` | `#776b70` | Supporting text |
| `--color-subtle` | `#9b8f93` | Metadata |
| `--color-border` | `#f0e1e3` | Borders and separators |
| `--color-primary` | `#c94566` | Primary accent, selected date, primary action |
| `--color-primary-strong` | `#b93e61` | Hover and active primary states |
| `--color-primary-soft` | `#fdecef` | Soft primary tint |
| `--color-blue` | `#5f8fae` | Secondary informational accent |
| `--color-lilac` | `#8f78b2` | Course or optional accent |
| `--color-success` | `#5f8c69` | Completed and positive state |
| `--color-warning` | `#b87a3d` | Caution, medium priority, or due soon |
| `--color-danger` | `#b9566a` | Destructive actions and overdue warnings |
| `--color-danger-soft` | `#f8dde3` | Soft destructive background |

Usage rules:

- Deep rose is the primary brand/action color.
- Blue, green, yellow, and lilac are supporting accents only.
- Do not let the interface become a rainbow of status chips.
- Never rely on color alone for priority, overdue, completion, or active state.
- Prefer text labels, icons, position, and weight as additional cues.

## 5. Typography

Use an offline-safe system font stack. Do not depend on external font loading.

Recommended stack:

```css
font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

Type scale:

| Role | Size | Weight | Line height | Use |
| --- | ---: | ---: | ---: | --- |
| Display | 40px to 56px | 750 to 800 | 0.98 to 1.05 | Rare hero-like focus moments |
| Page title | 28px to 40px | 750 | 1.05 to 1.15 | Main screen titles |
| Section title | 18px to 24px | 700 | 1.2 | Planning sections |
| Subsection | 16px to 18px | 650 | 1.3 | Group headings |
| Body | 16px | 400 to 500 | 1.45 to 1.6 | Primary content |
| Small | 14px | 500 | 1.4 | Secondary labels |
| Metadata | 12px to 13px | 600 to 700 | 1.3 | Due dates, counts, short labels |

Typography rules:

- Do not scale font size directly with viewport width.
- Keep letter spacing at `0` for normal text.
- Metadata may use up to `0.02em` letter spacing if it remains readable.
- Avoid uppercase for long labels.
- Use weight and spacing before adding more colors.

## 6. Spacing

Use an 8px spacing system with occasional 4px refinements.

Spacing tokens:

| Token | Value | Use |
| --- | ---: | --- |
| `--space-1` | 4px | Icon gaps, tiny offsets |
| `--space-2` | 8px | Tight internal gaps |
| `--space-3` | 12px | Row content spacing |
| `--space-4` | 16px | Default component spacing |
| `--space-5` | 20px | Dense section padding |
| `--space-6` | 24px | Section rhythm |
| `--space-8` | 32px | Major group spacing |
| `--space-10` | 40px | Page-level separation |
| `--space-12` | 48px | Large vertical rhythm |
| `--space-16` | 64px | Major desktop separation |

Spacing rules:

- Use whitespace to create calm before adding panels.
- Keep task rows compact but touch-friendly.
- Avoid large empty dashboard cards that make useful work feel far away.
- Mobile spacing should be tighter horizontally and generous around controls.

## Token Usage Rules

1. Reuse an existing token before creating a new one.
2. Prefer semantic tokens over component-specific visual values.
3. Do not create component tokens for ordinary global values such as standard spacing, text color, border, radius, or shadow.
4. Avoid hardcoded colors when semantic color tokens exist.
5. Use the spacing scale by default, with one-off values only when they are visually necessary.
6. Keep light and dark mode controlled through semantic CSS custom properties.
7. Use SCSS variables for compile-time breakpoints and calculations rather than duplicating those values as runtime CSS variables.
8. Remove obsolete tokens only after confirming they are unused.
9. New tokens must represent a meaningful reusable design decision.

## 7. Borders

Borders should be quiet and structural.

Recommended defaults:

```css
--border-subtle: 1px solid var(--color-border);
```

Usage rules:

- Prefer separators for simple sections.
- Use borders to clarify groups, active states, and form controls.
- Avoid boxing every area of the page.
- Active states may combine a border, subtle tint, and text weight.

## 8. Radius

Radius should feel soft but not playful or pill-heavy.

Radius tokens:

| Token | Value | Use |
| --- | ---: | --- |
| `--radius-sm` | 8px | Buttons, inputs, compact controls |
| `--radius-md` | 12px | Task rows and small panels |
| `--radius-lg` | 16px | Larger panels and modals |
| `--radius-full` | 999px | True pills, toggles, avatars, circular controls |

Rules:

- Cards should generally stay at 16px or below.
- Use full pills only when the shape communicates chip, badge, or toggle.
- Avoid oversized rounded rectangles for every button and container.

## 9. Shadows

Shadows should be subtle and infrequent.

Shadow tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-soft` | `0 10px 30px rgba(54, 45, 38, 0.08)` | Elevated panels, modals |
| `--shadow-popover` | `0 16px 48px rgba(54, 45, 38, 0.14)` | Menus and dialogs |
| `--shadow-focus` | `0 0 0 3px rgba(223, 123, 102, 0.28)` | Focus ring support |

Rules:

- Use borders and tonal contrast before shadows.
- Avoid stacked shadows and dramatic elevation.
- Dark mode should rely more on borders and surface contrast than shadows.

## 10. Buttons

Buttons should clearly express action priority.

Button types:

- Primary: coral solid background, white or high-contrast text, used for the main action.
- Secondary: white or soft surface with border, used for common but non-primary actions.
- Ghost: transparent with muted text, used for low-emphasis actions.
- Danger: separated visually, never styled like a normal primary action.
- Icon button: square or circular, with visible focus state and accessible label.

Button rules:

- Minimum touch target: 44px by 44px.
- Keep labels short and action-oriented.
- Pair unfamiliar icons with visible text or tooltip support.
- Avoid multiple primary buttons in the same visual group.
- Do not use decorative gradients.

## 11. Forms

Forms should feel low-friction and forgiving.

Rules:

- Labels must remain visible.
- Inputs should use clear borders, soft backgrounds, and strong focus states.
- Validation should be specific and placed near the relevant field.
- Required fields should be understandable before submission.
- Use placeholder text only as an example, not as the only label.
- Textareas for Brain Dump should feel immediate and spacious.
- Assignment breakdown forms should guide the user toward small next steps.

Recommended form control styling:

- Height: 44px minimum for standard controls.
- Radius: 8px to 12px.
- Border: subtle by default, stronger on focus.
- Error state: danger text plus border or icon, not color alone.

## 12. Navigation

Navigation should orient the user without stealing attention.

Desktop:

- Use a compact left sidebar.
- Current section should use a coral marker, subtle tint, or stronger text.
- Icons can support scanability, but labels should remain present.
- Keep navigation visually quieter than Today content.

Mobile:

- Use a simplified navigation pattern such as a bottom nav, drawer, or compact menu.
- Primary screen title and active location should remain obvious.
- Avoid cramming the full desktop sidebar into a narrow viewport.

Navigation sections should map to the MVP only:

- Today
- Assignments
- Courses
- Brain Dump
- Focus Timer
- Progress
- Settings

## 13. Week Navigator

The Week Navigator provides date context without becoming a full calendar.

Required anatomy:

- Month and year label.
- Previous control.
- Today control.
- Next control.
- Seven days from Sunday through Saturday.
- Each day shows short weekday and date number.
- Selected date uses the primary accent.
- Current real date can use a secondary outline or small marker if different from selected date.

Visual rules:

- Keep it compact.
- Use horizontal layout on desktop and tablet.
- On mobile, allow horizontal scrolling or a tight seven-column layout.
- Selected state should be obvious through color, weight, and shape.
- Do not add full month calendar behavior in this phase.

Recommended sizing:

- Desktop day cell: 56px to 72px wide, 56px high.
- Mobile day cell: 44px to 52px wide, 52px high.
- Touch target: 44px minimum.

## 14. Task Rows

Task rows are the core visual unit of the product.

Required anatomy:

- Completion control.
- Task or assignment step title.
- Optional course badge.
- Due date or relative due label.
- Priority indicator.
- Optional lightweight actions.

Visual rules:

- Use rows instead of dense tables.
- Keep the title as the strongest element.
- Metadata should be muted and secondary.
- Overdue state should include a text label, not only red color.
- Completed rows can reduce contrast but must remain readable.
- Avoid placing too many chips in one row.

Recommended sizing:

- Desktop row height: 56px to 72px.
- Mobile row height: 64px minimum.
- Row padding: 12px to 16px.
- Gap between rows: 4px to 8px, or use separators in a continuous list.

Priority indicators:

- High: coral or danger-adjacent treatment plus label.
- Medium: yellow treatment plus label.
- Low: muted or blue treatment plus label.

## 15. Timeline

Timeline styling should be lightweight and selective.

Use timeline treatment for:

- Today's planned flow.
- Upcoming due items when order matters.
- Focus sessions or recent progress summaries.

Do not use timeline treatment for:

- Every task list.
- Full hourly scheduling.
- A complex calendar replacement.

Recommended visual treatment:

- Thin vertical line in `--color-border`.
- Small dots or status markers.
- Strong title, muted time or due context.
- Comfortable spacing between timeline items.

## 16. Desktop Behavior

Desktop screens should feel spacious without becoming sparse.

Rules:

- Keep the main planner content visually dominant.
- Avoid permanent three-column dashboards with equal weight.
- Use an optional right context column only when it directly supports the current screen.
- Keep forms and lists within readable widths.
- Let Today place Top 3 and tasks before secondary metrics.
- Use progress information as context, not the primary page structure.

Suggested breakpoints:

| Token | Value | Behavior |
| --- | ---: | --- |
| `$bp-mobile` | 640px | Single-column mobile layout |
| `$bp-tablet` | 900px | Wider single column or compact two-column groups |
| `$bp-desktop` | 1100px | Sidebar plus main content |
| `$bp-wide` | 1440px | Optional context panel may appear |

## 17. Mobile Behavior

Mobile must be a dedicated experience, not a squeezed desktop.

Rules:

- Use a single-column layout.
- Keep Today and next action at the top.
- Compress navigation into a mobile-friendly pattern.
- Keep the Week Navigator compact and touch-friendly.
- Make task rows comfortable to tap.
- Avoid side-by-side dense panels.
- Keep modals usable on small screens with full-width or near-full-width layouts.
- Consider a Floating Action Button for quick capture in a future UI refactor, but do not introduce new behavior without product approval.

Mobile priorities:

1. See today's plan.
2. Capture a thought quickly.
3. Check off a task.
4. Start or resume focus.
5. Review assignment steps.

## 18. Dark Mode

Dark mode should feel warm and calm, not like a high-contrast developer console.

Suggested dark tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#1f1c1a` | Main background |
| `--color-surface` | `#2f2a26` | Primary surfaces |
| `--color-surface-soft` | `#38312c` | Secondary surfaces |
| `--color-ink` | `#f5eee7` | Primary text |
| `--color-text` | `#e6dcd3` | Body text |
| `--color-muted` | `#b8aaa0` | Supporting text |
| `--color-subtle` | `#96887e` | Metadata |
| `--color-border` | `#4a4039` | Borders |
| `--color-primary` | `#f0927b` | Primary accent |
| `--color-primary-soft` | `#57352f` | Soft primary tint |
| `--color-danger` | `#ef8f8f` | Danger state |

Rules:

- Do not simply invert light mode.
- Maintain contrast for text, borders, and controls.
- Reduce shadow reliance and use borders or tonal surfaces.
- Keep accent colors slightly softer but still distinguishable.
- Preserve focus visibility.

## 19. Accessibility

Accessibility is part of the visual system, not an afterthought.

Requirements:

- Text and interactive elements must meet WCAG AA contrast targets.
- Every interactive element needs a visible focus state.
- Focus rings should be clear and not removed.
- Color must never be the only indicator of state.
- Touch targets should be at least 44px by 44px.
- Forms require visible labels and useful error messages.
- Dialogs require clear titles, focus management, and dismiss behavior.
- Timer changes should not announce every second to assistive technology.
- Motion should respect reduced-motion preferences.
- Keyboard navigation must work across navigation, lists, forms, dialogs, and settings.

## 20. Reusable Components

Future UI work should consolidate around these reusable components.

AppShell:

- Overall page structure with sidebar, main content, and optional context area.

Sidebar:

- Desktop navigation, active state, app identity, and secondary settings access.

MobileNavigation:

- Mobile navigation pattern for primary MVP sections.

WeekNavigator:

- Compact date selection component for Today context.

TaskRow:

- Standard row for tasks, assignment steps, overdue items, and upcoming work.

PriorityList:

- Focused Top 3 list with clear ordering and completion affordances.

SectionHeader:

- Consistent title, optional count, optional action, and secondary description.

EmptyState:

- Calm empty state with one clear next action.

Modal:

- Dialog shell for create, edit, import, export, and destructive confirmation flows.

FormField:

- Label, control, helper text, validation, and error state wrapper.

Button:

- Primary, secondary, ghost, and danger variants.

IconButton:

- Compact icon action with accessible label and tooltip support.

FloatingActionButton:

- Optional future mobile quick-capture action. Documented only; do not add behavior unless approved.

CourseBadge:

- Small course identity label with restrained accent treatment.

ProgressIndicator:

- Lightweight completion or assignment progress visual.

FocusTimer:

- Timer display, current assignment or step, controls, and next-step context.

TimelineItem:

- Optional vertical timeline item for Today flow or upcoming sequence.

BackupPanel:

- Settings area for export, import, and clear-data actions.

## 21. Design Anti-Patterns To Avoid

Do not introduce:

- Generic Bootstrap-like dashboard styling.
- CRM, admin, or analytics layouts.
- Permanent three-column desktop dashboards where all columns compete.
- Large card grids for every section.
- Tables for ordinary student task planning.
- Gradients, glass effects, neon accents, or decorative blobs.
- Heavy shadows or floating panels everywhere.
- Purple-blue SaaS default palettes.
- Overly colorful status chips.
- Cards nested inside other cards.
- Icon-only controls without accessible labels.
- Hidden form labels.
- Tiny mobile tap targets.
- Full calendar scope creep.
- Gamification not defined in `PRODUCT-SPEC.md`.
- New product features copied from visual references.
- Hardcoded colors, spacing, radius, or shadows outside centralized SCSS tokens.
