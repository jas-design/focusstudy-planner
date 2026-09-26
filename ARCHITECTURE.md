# FocusStudy Architecture

## State

FocusStudy uses one in-memory application state object loaded at startup by `src/js/state.js`.

All feature work should read state through `FocusStudyState.getAppState()` and write through `FocusStudyState.updateAppState()`. This keeps updates predictable:

```text
User action -> update app state -> save -> render affected UI
```

## Storage

All browser persistence is isolated in `src/js/storage.js`.

- Storage key: `focusstudy:v1:data`
- State version: `version: 1`
- Data format: one versioned JSON object containing user, courses, assignments, brain dump items, priorities, focus sessions, exams, and settings
- LocalStorage access is wrapped in `try/catch`
- Missing, partial, legacy, malformed, or unavailable storage recovers to safe defaults without crashing

No other module should call `localStorage` directly.

## Rendering

`src/js/render.js` renders the approved UI from application state. It currently connects:

- clean first-launch empty states
- persisted theme preference
- persisted focus/break duration settings
- state-backed summaries for Today, Assignments, Courses, Brain Dump, Focus, and Progress

The existing HTML remains the visual source of truth. Future feature modules should add behavior without redesigning the shell.

## Build

`scripts/build.js` concatenates the JavaScript modules in this order:

```text
storage.js -> state.js -> render.js -> app.js
```

The build still outputs one standalone file:

```text
dist/FocusStudyPlanner.html
```
