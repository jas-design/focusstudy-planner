# FocusStudy Product Specification

## 1. Product Summary

FocusStudy is an ADHD-friendly student planner web app for college and university students in the United States. It is sold as a downloadable digital product and must run entirely from one standalone HTML file opened locally in Chrome or Edge.

The app helps students reduce overwhelm by showing what matters today, breaking work into smaller steps, and keeping course, assignment, exam, timer, and progress information in one calm workspace.

### Non-Negotiable Product Constraints

- Final production artifact: `dist/FocusStudyPlanner.html`
- Runs locally without install, account, server, internet, CDN, API, analytics, or tracking
- Uses semantic HTML5, SCSS, vanilla JavaScript, LocalStorage, and JSON backup files
- Stores all user data only in the browser
- Supports light mode, dark mode, responsive layouts, keyboard use, visible focus states, form validation, empty states, and confirmation before destructive actions

## 2. MVP Feature Set

The MVP is limited to the features below. Do not add calendars, notifications, account sync, collaboration, AI, recurring schedules, grades/GPA, file attachments, cloud backup, or external integrations.

### Today Dashboard

- Shows today's date, quick focus summary, upcoming assignments, active exams, Top 3 priorities, and quick capture for brain dump items.
- Makes the next useful action obvious: add priority, add assignment, start focus timer, or review due work.
- Includes calm empty states when no assignments, courses, exams, or priorities exist.

### Top 3 Priorities

- User can create, edit, complete, reorder, and clear up to three priority items for the day.
- Priority items can optionally link to an assignment or course.
- Completed priorities remain visible for the day and contribute to progress.
- The app should prevent adding more than three active priorities.

### Assignments

- User can create, edit, complete, delete, and filter assignments.
- Each assignment belongs to a course when available, but course is optional.
- Assignment fields include title, course, due date, due time, estimated effort, status, notes, and smaller steps.
- Assignments can be marked not started, in progress, complete, or submitted.
- Due soon and overdue states are visually distinct and text-labeled.

### Courses

- User can create, edit, archive, and delete courses.
- Course fields include name, code, instructor, meeting notes, color, and optional exam date.
- Courses provide organization for assignments and progress.
- Deleting a course requires confirmation and must offer a choice to keep linked assignments as uncategorized or delete the course only.

### Brain Dump

- User can quickly capture unstructured thoughts, tasks, reminders, and worries.
- Brain dump items can be edited, completed, deleted, or converted into an assignment step or assignment.
- The empty state should encourage fast capture, not setup.

### Break Assignments Into Steps

- Each assignment can contain ordered steps.
- User can add, edit, complete, reorder, and delete steps.
- Assignment progress is derived from completed steps when steps exist.
- Steps should support short labels and optional notes.

### Focus Timer

- Provides a local, offline focus timer with focus and break durations.
- Defaults should support common study sessions: 25-minute focus and 5-minute break.
- User can start, pause, resume, reset, and complete a session.
- Completed sessions contribute to progress metrics.
- Timer must keep running accurately while the tab remains open. Background/browser throttling limitations must be disclosed in Settings or help text.

### Exam Countdown

- User can add exam dates through course records or a dedicated exam list.
- Dashboard shows upcoming exams with days remaining.
- Exam fields include title, course, date, time, location, and study notes.
- Past exams can remain in history or be archived.

### Progress

- Shows simple, motivating progress indicators:
  - priorities completed today
  - assignments completed
  - steps completed
  - focus sessions completed
  - upcoming overdue/due-soon count
- Progress should be informational, not gamified.
- No streaks or social comparisons in MVP.

### Light/Dark Mode

- User can select system, light, or dark theme.
- Theme preference persists locally.
- Theme must apply before first paint as much as possible to avoid a visible flash.

### Settings

- User can configure theme, default focus duration, default break duration, preferred start section, date display preference, and data management actions.
- Includes privacy reassurance that data stays in the browser.
- Includes backup/restore controls and clear all data.

### JSON Export/Import Backup

- Export creates a versioned JSON file containing all user data and app settings.
- Import validates file shape, version, and required fields before replacing or merging data.
- MVP import mode should be replace-all after confirmation. Merge can be a future feature.
- Clear all data requires a strong confirmation because LocalStorage deletion is destructive.

## 3. Primary User Flow

1. User opens `FocusStudyPlanner.html` locally.
2. First run shows an empty Today dashboard with clear actions:
   - Add a course
   - Add an assignment
   - Capture a brain dump item
   - Start a focus session
3. User adds courses and assignments as needed.
4. User opens an assignment, breaks it into smaller steps, and optionally adds one step or assignment to Today's Top 3.
5. User starts a focus timer session from Today or Focus Timer.
6. User completes priorities, steps, or assignments.
7. Progress updates automatically.
8. User periodically exports a JSON backup.
9. If moving browsers/devices, user imports a backup file and continues locally.

### Daily Use Loop

1. Review Today.
2. Choose up to three priorities.
3. Break the hardest item into the next small step.
4. Run one focus session.
5. Mark progress.
6. Capture distracting thoughts in Brain Dump.
7. Export backup when desired.

## 4. Information Architecture

### Main Navigation

- Today
- Assignments
- Courses
- Brain Dump
- Focus Timer
- Exams
- Progress
- Settings

### Section Responsibilities

#### Today

- Daily overview and next-action workspace.
- Contains Top 3 priorities, due soon list, exam countdown preview, timer shortcut, and brain dump quick capture.

#### Assignments

- Full assignment list, filters, assignment form, and assignment detail/steps view.
- Filters: status, course, due soon, overdue, completed.

#### Courses

- Course list and course editor.
- Course detail summarizes linked assignments and exams.

#### Brain Dump

- Capture-first list for unstructured items.
- Conversion actions connect brain dump items to assignments.

#### Focus Timer

- Timer controls, duration settings shortcut, and recent session list.

#### Exams

- Upcoming exam list and exam editor.
- Can display course-linked exams.

#### Progress

- Summary metrics, completion percentages, and recent focus sessions.

#### Settings

- Preferences, backup/restore, privacy note, and destructive data actions.

## 5. Local Storage Data Models

Use one versioned root object in LocalStorage rather than many unrelated keys.

### Storage Keys

- App data key: `focusstudy:v1:data`
- Theme bootstrap key, if needed for first paint: `focusstudy:v1:theme`

### Root Shape

```json
{
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "createdAt": "2026-09-21T00:00:00.000Z",
  "updatedAt": "2026-09-21T00:00:00.000Z",
  "settings": {},
  "courses": [],
  "assignments": [],
  "brainDumpItems": [],
  "priorities": [],
  "focusSessions": [],
  "exams": []
}
```

### Settings

```json
{
  "theme": "system",
  "defaultFocusMinutes": 25,
  "defaultBreakMinutes": 5,
  "preferredStartSection": "today",
  "dateDisplay": "weekdayMonthDay",
  "reducedMotion": false
}
```

### Course

```json
{
  "id": "course_abc123",
  "name": "Biology 101",
  "code": "BIO 101",
  "instructor": "Dr. Rivera",
  "notes": "",
  "color": "#4f7c82",
  "archived": false,
  "createdAt": "2026-09-21T00:00:00.000Z",
  "updatedAt": "2026-09-21T00:00:00.000Z"
}
```

### Assignment

```json
{
  "id": "assignment_abc123",
  "courseId": "course_abc123",
  "title": "Research paper draft",
  "dueDate": "2026-10-02",
  "dueTime": "23:59",
  "estimatedMinutes": 120,
  "status": "notStarted",
  "notes": "",
  "steps": [],
  "createdAt": "2026-09-21T00:00:00.000Z",
  "updatedAt": "2026-09-21T00:00:00.000Z",
  "completedAt": null
}
```

Allowed assignment statuses:

- `notStarted`
- `inProgress`
- `complete`
- `submitted`

### Assignment Step

```json
{
  "id": "step_abc123",
  "title": "Find three sources",
  "notes": "",
  "completed": false,
  "position": 0,
  "createdAt": "2026-09-21T00:00:00.000Z",
  "completedAt": null
}
```

### Brain Dump Item

```json
{
  "id": "brain_abc123",
  "text": "Email professor about office hours",
  "completed": false,
  "createdAt": "2026-09-21T00:00:00.000Z",
  "updatedAt": "2026-09-21T00:00:00.000Z",
  "convertedTo": null
}
```

### Priority

```json
{
  "id": "priority_abc123",
  "date": "2026-09-21",
  "title": "Finish sources for paper",
  "linkedType": "assignment",
  "linkedId": "assignment_abc123",
  "completed": false,
  "position": 0,
  "createdAt": "2026-09-21T00:00:00.000Z",
  "completedAt": null
}
```

Allowed linked types:

- `assignment`
- `course`
- `brainDumpItem`
- `none`

### Focus Session

```json
{
  "id": "session_abc123",
  "assignmentId": null,
  "courseId": null,
  "startedAt": "2026-09-21T14:00:00.000Z",
  "endedAt": "2026-09-21T14:25:00.000Z",
  "plannedFocusMinutes": 25,
  "actualFocusMinutes": 25,
  "completed": true,
  "notes": ""
}
```

### Exam

```json
{
  "id": "exam_abc123",
  "courseId": "course_abc123",
  "title": "Midterm Exam",
  "date": "2026-10-15",
  "time": "09:00",
  "location": "Science Hall 204",
  "notes": "Chapters 1-5",
  "archived": false,
  "createdAt": "2026-09-21T00:00:00.000Z",
  "updatedAt": "2026-09-21T00:00:00.000Z"
}
```

### Backup File Shape

```json
{
  "product": "FocusStudy",
  "backupVersion": 1,
  "exportedAt": "2026-09-21T00:00:00.000Z",
  "data": {}
}
```

## 6. UI Components

### App Shell

- Header with product name, current section, theme toggle, and mobile menu button.
- Sidebar navigation on desktop.
- Bottom or drawer navigation on mobile.
- Main content region with skip link target.

### Shared Components

- Button: primary, secondary, ghost, danger
- Icon button with accessible label
- Text input
- Textarea
- Native select
- Date input
- Time input
- Checkbox
- Form field wrapper with label, help text, and error text
- Modal dialog for confirmation and import review
- Toast or inline status message system
- Empty state
- Progress meter
- Course color swatch
- Assignment status badge
- Due date badge
- Filter chips or segmented controls
- List item row
- Card for repeated items only
- Timer display and timer controls

### Feature Components

- Today summary panel
- Top 3 priority list
- Quick capture form
- Assignment list
- Assignment editor
- Assignment step list
- Course list
- Course editor
- Brain dump list
- Focus timer
- Exam countdown list
- Progress summary
- Backup/restore panel

## 7. Responsive Behavior

### Desktop: 1024px and Wider

- Persistent sidebar navigation.
- Today can use a two-column layout:
  - Primary column: Top 3, assignments due soon, brain dump capture
  - Secondary column: timer, exam countdown, progress snapshot
- Forms may sit beside contextual summaries when space allows.
- Lists should remain scannable with restrained density.

### Tablet: 768px to 1023px

- Sidebar may collapse to icon/text rail or top navigation depending on implementation simplicity.
- Content uses one or two columns based on section complexity.
- Modal dialogs must fit within viewport and scroll internally when content is long.

### Mobile: Below 768px

- Single-column layout.
- Navigation becomes a menu drawer or bottom navigation.
- Primary action appears near the top of each section.
- Cards/list rows stack metadata under titles.
- Form controls use full width.
- Touch targets should be at least 44px tall where practical.
- Avoid horizontal scrolling except for controlled, obvious chip/filter rows.

## 8. Accessibility Requirements

- Target WCAG 2.2 AA.
- Use semantic landmarks: header, nav, main, section, form, dialog.
- Provide a skip link to main content.
- All interactive controls must be native buttons, links, inputs, selects, or textareas unless a custom widget is required.
- Every control needs a visible label or accessible name.
- Focus states must be clearly visible in light and dark mode.
- Focus order must follow visual order.
- Dialogs must trap focus, close with Escape, restore focus on close, and use appropriate accessible names.
- Destructive actions must use app-owned confirmation dialogs, not browser `confirm()`.
- Validation errors must be shown in text, associated with fields, and announced to assistive technologies where appropriate.
- Status changes such as backup imported, assignment saved, or data cleared must be communicated through accessible status regions.
- Color cannot be the only indicator of overdue, complete, selected, or error states.
- Support reduced motion preferences.
- Keyboard users must be able to complete all core flows.
- Timer controls must be accessible by keyboard and screen reader.

## 9. Build Strategy

Development files should remain modular inside `src/`, while production outputs one standalone HTML file.

### Proposed Source Structure

```text
src/
  index.html
  scss/
    main.scss
    _tokens.scss
    _base.scss
    _layout.scss
    _components.scss
    _features.scss
    _themes.scss
  js/
    app.js
    storage.js
    state.js
    render.js
    router.js
    validation.js
    backup.js
    timer.js
    utils.js
dist/
  FocusStudyPlanner.html
scripts/
  build.js
```

### Build Requirements

- Compile SCSS to CSS using the local Sass dev dependency.
- Inline compiled CSS into `src/index.html`.
- Inline JavaScript modules or concatenate them in dependency order.
- Generate `dist/FocusStudyPlanner.html`.
- Do not include external scripts, stylesheets, fonts, images, analytics, APIs, or CDN references.
- The generated HTML should work when opened with a `file://` URL.

### Suggested NPM Scripts

```json
{
  "scripts": {
    "build": "node scripts/build.js",
    "watch:css": "sass --watch src/scss/main.scss:src/.tmp/main.css"
  }
}
```

The build script should be simple and auditable:

1. Compile SCSS.
2. Read HTML shell.
3. Read JavaScript files.
4. Replace placeholders with inline `<style>` and `<script>`.
5. Write `dist/FocusStudyPlanner.html`.

## 10. Technical Risks and Mitigations

### LocalStorage Is Browser-Local

Risk: Data saved in Chrome does not automatically appear in Edge, another computer, another Chrome profile, private browsing, or after browser data clearing.

Mitigation:

- Explain this clearly in Settings.
- Make JSON export/import prominent.
- Encourage backups before clearing browser data or changing devices.

### LocalStorage Can Be Cleared or Unavailable

Risk: Browser settings, private windows, storage quotas, extensions, or user cleanup tools can remove data.

Mitigation:

- Wrap all storage reads/writes in error handling.
- Show a clear storage error state if persistence fails.
- Keep data compact.
- Provide manual export.

### Import Can Corrupt or Replace Good Data

Risk: Invalid JSON, wrong product file, older schema, or accidental replace can overwrite current planner data.

Mitigation:

- Validate backup shape before import.
- Show import summary before replacing data.
- Confirm replace-all import.
- Keep current data untouched until validation passes.
- Include schema migration functions before accepting future versions.

### Timer Accuracy in Background Tabs

Risk: Browser throttling may delay timer updates when the tab is inactive or the computer sleeps.

Mitigation:

- Calculate elapsed time from timestamps, not only `setInterval` ticks.
- Explain that the timer is most reliable while the planner tab remains open.
- On resume, recalculate remaining time.

### Date and Time Handling

Risk: Due dates and exam countdowns can be confusing across time zones or daylight saving changes.

Mitigation:

- Store date-only fields as `YYYY-MM-DD`.
- Store optional times separately as `HH:mm`.
- Compute countdowns using local date semantics.
- Avoid UTC conversion for date-only academic deadlines.

### One-File Build Can Become Hard to Maintain

Risk: A standalone file requirement can encourage messy production code.

Mitigation:

- Keep source modular under `src/`.
- Use a small build script to inline assets.
- Treat `dist/FocusStudyPlanner.html` as generated output.

### No External Assets

Risk: External fonts, icon packs, or images would break offline use.

Mitigation:

- Use system font stacks.
- Use inline SVG icons only when needed.
- Avoid image dependencies in MVP.

## 11. Implementation Plan

### Phase 1: Foundation

- Create `src/` structure.
- Add build script that generates `dist/FocusStudyPlanner.html`.
- Add base HTML shell, SCSS tokens, theme system, app shell, navigation, and storage service.
- Add seed state, data validation utilities, and render loop.

### Phase 2: Core Data Workflows

- Implement courses, assignments, assignment steps, brain dump, and Top 3 priorities.
- Add form validation, empty states, edit/delete flows, and destructive confirmations.
- Implement assignment filtering and due state calculations.

### Phase 3: Study Tools

- Implement focus timer, focus session history, exam countdown, and progress summaries.
- Add settings for timer defaults and preferred theme.

### Phase 4: Backup and Data Safety

- Implement JSON export.
- Implement validated replace-all import.
- Implement clear all data with strong confirmation.
- Add storage error handling and schema migration scaffolding.

### Phase 5: Product QA

- Build standalone HTML.
- Open generated file locally in Chrome and Edge.
- Test desktop, tablet, and mobile widths.
- Test persistence after reload.
- Test empty states, invalid input, keyboard navigation, focus states, theme switching, export/import, and clear data.
- Confirm no console errors and no network requests.

## 12. Definition of Done for MVP

- `dist/FocusStudyPlanner.html` opens locally and works offline.
- All MVP sections are usable without installation or account setup.
- User data persists automatically in LocalStorage.
- Exported JSON can restore the planner after clearing data.
- Light and dark modes are complete.
- All destructive actions ask for confirmation.
- Core flows work by keyboard.
- Browser console shows no errors during normal use.
- The app makes the next action obvious and avoids crowded dashboard patterns.
