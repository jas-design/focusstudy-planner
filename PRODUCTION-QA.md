# FocusStudy Production QA

Production artifact: `dist/FocusStudyPlanner.html`

File size: 238,017 bytes

## Production Build

Build generated: YES

Build command: PASS - `npm.cmd test` runs `npm run build` and generated `dist/FocusStudyPlanner.html`

Build determinism: PASS - `npm.cmd run build` completed repeatedly and wrote the same output path

Standalone file structure: PASS - final HTML includes `<!doctype html>`, `<html lang="en">`, viewport metadata, inline `<style>`, and inline `<script>`

Standalone file opens: NOT VERIFIED - Chrome and Edge headless attempts failed inside this environment due browser GPU/headless process failures before a DOM dump could complete

Offline: PASS - static audit found no required runtime network resources

LocalStorage: PASS - production bundle smoke verified clean initialization, save/load path, and corrupted storage recovery using `focusstudy:v1:data`

## Feature Smoke

Assignments: NOT VERIFIED IN BROWSER - covered by prior functional QA; no production-browser interaction was available in this environment

Courses: NOT VERIFIED IN BROWSER - covered by prior functional QA; no production-browser interaction was available in this environment

Today: NOT VERIFIED IN BROWSER - covered by prior functional QA; no production-browser interaction was available in this environment

Brain Dump: NOT VERIFIED IN BROWSER - covered by prior functional QA; no production-browser interaction was available in this environment

Focus: NOT VERIFIED IN BROWSER - covered by prior functional QA; no production-browser interaction was available in this environment

Progress: PASS - production bundle smoke verified current-week assignment count and focus total calculations from stored source data

Backup round-trip: PARTIAL PASS - production bundle smoke verified backup creation and validation; browser Blob download/import picker could not be verified without a working browser surface

Light Mode: NOT VERIFIED IN BROWSER

Dark Mode: NOT VERIFIED IN BROWSER

Mobile: NOT VERIFIED IN BROWSER

## Runtime Dependency Audit

External runtime requests: 0

External CSS files: 0

External script files: 0

Runtime imports: 0

CDN dependencies: 0

Development source path dependencies: 0

Known fake production data: 0

Console errors: NOT VERIFIED IN BROWSER - static scan found no production `console.log()`; expected `console.error()` handlers remain for backup failure paths

## Notes

- Chrome and Edge executables exist on this machine, but headless `file://` testing failed from the browser process/GPU layer before page verification could complete.
- The production HTML was still validated through static standalone checks and by executing the inline production JavaScript bundle in a controlled LocalStorage smoke test.
- Critical production blockers found in performed checks: 0
- High production blockers found in performed checks: 0
