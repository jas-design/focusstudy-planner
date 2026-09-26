# FocusStudy UX Contract

## Product Context

- Audience: US college and university students.
- Primary jobs: plan today, track assignments, break work into steps, focus, and back up local data.
- Target market: United States.
- Active locale: English.
- Timezone/calendar policy: local browser date semantics; date-only academic deadlines use `YYYY-MM-DD`.
- Accessibility target: WCAG 2.2 AA.

## Business-Context Sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| MVP scope | `PRODUCT-SPEC.md` | Product spec | 2026-09-21 |
| Data lifecycle | `PRODUCT-SPEC.md` | Product spec | 2026-09-21 |
| Privacy/local data | `AGENTS.md`, `PRODUCT-SPEC.md` | Project instruction/product spec | 2026-09-21 |

## Visual Contract

- Project `DESIGN.md`: `DESIGN.md`
- Token ownership model: DESIGN.md defines visual intent; SCSS custom properties implement runtime tokens.
- Runtime design-system/token source: `src/scss/_tokens.scss`
- Supported themes: light, dark, and system preference. Theme selection persists through the application state in LocalStorage.
- Selected visual direction: Calm Focus.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native select | `DESIGN.md` | native | Browser review |
| Date | Native date/time inputs | `PRODUCT-SPEC.md` | native | Browser review |
| Form | Shared form CSS patterns | `src/scss/_components.scss` | create / edit / demo | Visual and keyboard review |
| Scrollbar | Global app stylesheet | `src/scss/_base.scss` | geometry exceptions | Browser review |
| Dialog | Shared app-owned modal markup | `src/index.html`, `src/js/app.js` | form / confirmation | Keyboard and browser review |
| State and storage | Shared vanilla modules | `src/js/storage.js`, `src/js/state.js`, `src/js/render.js` | clean state / repaired state / unavailable storage | Build and storage recovery checks |
| Toast | Deferred until app logic phase | `PRODUCT-SPEC.md` | success / warning / info / error | Future implementation |
| Today Dashboard / Top 3 | `src/js/app.js`, `src/js/render.js`, shared modal markup | `PRODUCT-SPEC.md` | empty / overdue / due today / upcoming / exam countdown / daily reset | Build, storage, keyboard, and responsive browser review |
| Assignment CRUD | `src/js/app.js`, `src/js/render.js`, shared modal markup | `PRODUCT-SPEC.md` | create / edit / complete / reopen / delete / subtask management | Build, storage, keyboard, and browser review |
| Course CRUD | `src/js/app.js`, `src/js/render.js`, shared modal markup | `PRODUCT-SPEC.md` | create / edit / detail / delete with assignment unlinking | Build, storage, keyboard, and browser review |
| Brain Dump CRUD | `src/js/app.js`, `src/js/render.js`, shared modal markup | `PRODUCT-SPEC.md` | quick capture / edit / delete / convert to assignment / cancel conversion | Build, storage, keyboard, and responsive browser review |
| Focus Mode / Timer | `src/js/app.js`, `src/js/render.js`, shared confirmation modal | `PRODUCT-SPEC.md` | idle / running / paused / completed / break / restored active session / exit confirmation | Build, storage, keyboard, and responsive browser review |
| Backup / Restore / Clear Data | `src/js/backup.js`, `src/js/storage.js`, `src/js/state.js`, shared modal markup | `PRODUCT-SPEC.md` | export JSON / validate import / replace-all restore / clear all data / invalid backup / active timer guard | Build, storage, keyboard, and browser review |

## Navigation And Responsive Behavior

- Route document title policy: visual shell updates the document title for the active demo section.
- Sidebar/drawer transformation: persistent sidebar at desktop widths; app-owned drawer on mobile. Focus mode hides normal chrome and provides an Exit Focus action.
- Responsive list strategy: stacked records on mobile; compact two-column and grid summaries at wider widths.
- Focus policy: visible focus rings and no sticky element should obscure focused controls.

## Validation

The visual shell includes `novalidate` forms and app-owned field errors. Assignment create/edit, subtask add/edit, Course create/edit, Today Top 3 selection, and Brain Dump capture/edit perform runtime validation with inline errors, `aria-invalid`, and first-error focus. Other feature validation remains deferred until those features are implemented.

## Verification

- Required static commands: `npm run build`, `npm test`
- Browser/device matrix: Chrome or Edge desktop plus responsive desktop/tablet/mobile widths.
- Accessibility checks: keyboard navigation and visible focus pass during visual shell review.
