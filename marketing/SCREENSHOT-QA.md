# FocusStudy Marketing Screenshot QA

Status: capture blocked in this environment.

Chrome and Edge command-line screenshot tests failed before rendering, with browser GPU/headless process failures. The computer-use browser state also reported no available apps or browsers. No raw screenshots were created in this pass.

## Demo Data

Demo data file: `marketing/demo-data/marketing-demo-data.json`

Status: READY

Use only for marketing screenshot preparation. Do not include it in `dist/`, `release/FocusStudy-v1.0/`, or `release/FocusStudy-v1.0.zip`.

Recommended load path:

1. Open the development or production FocusStudy HTML in a clean browser profile.
2. Go to `Settings > Data > Import Backup`.
3. Select `marketing/demo-data/marketing-demo-data.json`.
4. Confirm the restore.
5. Close developer tools and any file dialogs before screenshots.

## Browser Automation Availability

Chrome headless screenshot: BLOCKED

Edge headless screenshot: BLOCKED

Computer-use browser surface: BLOCKED

Firefox: NOT AVAILABLE

## Required Screenshots

| Filename | Viewport | Theme | Screen | Demo data correct | No debug UI | No clipping | No horizontal overflow | Text readable | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `marketing/screenshots/desktop/01-today-desktop.png` | 1440 x 1000 | Light | Today / Hero | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/02-top-three.png` | 1440 x 1000 | Light | Today / Top 3 crop | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/03-assignments.png` | 1440 x 1000 | Light | Assignments | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/04-break-it-down.png` | 1440 x 1000 | Light | Assignment Detail | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/05-focus-mode.png` | 1440 x 1000 | Light | Focus Mode | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/06-brain-dump.png` | 1440 x 1000 | Light | Brain Dump | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/07-progress.png` | 1440 x 1000 | Light | Progress | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/desktop/08-dark-mode.png` | 1440 x 1000 | Dark | Today or Focus Mode | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/mobile/09-mobile-today.png` | 390 x 844 | Light | Mobile Today | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/mobile/10-mobile-focus.png` | 390 x 844 | Light | Mobile Focus Mode | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/mobile/11-mobile-assignments.png` | 390 x 844 | Light | Mobile Assignments | Optional | Needs capture | Needs capture | Needs capture | Needs capture | OPTIONAL |
| `marketing/screenshots/comparison/today-light.png` | 1440 x 1000 | Light | Today | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |
| `marketing/screenshots/comparison/today-dark.png` | 1440 x 1000 | Dark | Today | Ready | Needs capture | Needs capture | Needs capture | Needs capture | NEEDS CAPTURE |

## Manual Capture Checklist

Before each capture:

- Confirm the browser is using the imported Alex demo dataset.
- Confirm the current visible student data matches Biology, Calculus, Psychology, and Computer Science.
- Confirm the date context is the week of September 21-27.
- Close developer tools, console windows, file dialogs, and extension popups.
- Move the cursor away from the app content.
- Avoid hover states, selected text, accidental focus outlines, and error messages.
- Use a clean crop that excludes browser chrome unless a later composition intentionally needs it.
- Leave enough safe area for later marketplace compositions.

For Focus Mode:

1. Open Focus.
2. Choose `Biology Research Paper`.
3. Select `Write introduction` as the current step.
4. Start Focus.
5. Capture when the timer is around `24:37`.
6. Verify the next step reads `Draft main sections`.

For Dark Mode:

1. Open Settings.
2. Set Appearance to Dark.
3. Return to Today or Focus Mode.
4. Match scroll position with the light-mode comparison as closely as possible.

For mobile:

1. Use 390 x 844 as the primary viewport.
2. Also inspect 375px width before approval.
3. Verify no horizontal scrolling.
4. Verify mobile navigation is visible where useful.

## Claim Safety

Do not add these claims to screenshot compositions:

- Medical or clinical ADHD claims.
- Guaranteed grades or productivity.
- Fake reviews, ratings, student counts, or sales numbers.
- Cloud sync.
- Encrypted storage.

Approved claim language for later compositions:

- ADHD-friendly.
- Designed to reduce visual overwhelm.
- Distraction-free Focus Mode.
- No subscription.
- No account required.
- Works offline.
- Backup & Restore.

## Release Safety

Release ZIP modified: NO

Production app modified: NO

Marketing demo data included in customer package: NO
