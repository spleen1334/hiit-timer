# Pulse Trainer

Mobile-first workout app built with React, TypeScript, and Vite.

Pulse Trainer has three modes:
- `Timer`: HIIT timer with audio/vibration feedback, history, and PWA install support.
- `Plan`: editable training program with warmup/workout/cardio/cooldown/notes, a single text workout document, explicit ordering, and connected exercise groups.
- `Body`: body-weight tracking with dated entries, body-fat data, BMI display, graph filters, and local history.

Global Settings are available from the top app bar when no timer session is running.

The UI is intentionally phone-oriented and should remain a centered mobile app even on desktop previews.

## Features

### Timer mode
- Configure `active`, `rest`, `rounds`, and `initial delay`
- Run session with color-coded phases
- Pause/resume/restart/stop controls
- Persist timer settings and successful history to `localStorage`
- Install prompt + iOS fallback guidance
- Portrait-first orientation lock + wake lock support
- Mode tabs are hidden while a timer session is running

### Plan mode
- Five collapsible sections:
  - `Warmup`
  - `Workout`
  - `Cardio`
  - `Cooldown`
  - `Notes`
- Workout is authored in one textarea with Save/Cancel and line-specific validation.
- Read-only cards show the exercise, description, sets, reps, kg/body weight, and rest.
- Move up/down updates the text and sequential `order` values. Connected groups move together; members can be reordered within them.
- Warmup, cardio, cooldown, and notes use simple text editors.
- Program and section visibility persist in `localStorage`

### Workout text format

```markdown
## Pull-ups
order: 1
description: Controlled full range.
sets: 3
reps: 8-10
weight: 0
rest: 90
group: sets1

## Push-ups
order: 2
sets: 3
reps: 12
weight: 0
rest: 90
group: sets1
```

Use `# Day 1`, `# Day 2`, or custom day headings such as `# Upper body` to separate days in the same document. Each day gets a tab; swipe the exercise area horizontally to switch days. Exercise order restarts at 1 per day, and groups are scoped to their day. Old workouts without day headings remain a single day. Empty named days are allowed.

`description` and `group` are optional. Indent continuation lines for multiline descriptions. `sets` accepts a positive integer or ascending range; `reps` accepts counts, ranges, or hold durations. Weight is a nonnegative number in kg; `0` means body weight. Rest is a nonnegative integer in seconds. Matching group labels connect exercises and keep them adjacent. Omit `group` for standalone exercises.

Exercises sort by positive integer `order`; ties keep text order. Saving and visual moves rewrite order numbers sequentially. Group members follow the first member, even if their entered order numbers were separated.

Existing exercise arrays and plan backups migrate automatically. Unsupported legacy weight values remain in the description with `weight: unknown` (shown as Not specified), so no load is invented. Old set counts that cannot be represented remain in the description. The latest plan export uses schema version 3, while imports accept versions 1 and 2 as well.

### Body mode
- Track one body measurement per day; saving the same date replaces that day
- Store weight, optional body-fat percentage, and one shared height value for BMI
- Graph weight over time with `1M`, `3M`, `6M`, `1Y`, and `All` filters
- Body-fat graph series is optional and off by default
- Tap/click graph points to inspect date, weight, and body-fat values
- Recent entries are collapsed by default and load in small chunks
- Body data persists in `localStorage`

### Settings
- Opened from the global top app bar, outside Timer, Plan, and Body content
- Hidden while a timer session is running
- Copy a workout syntax template and examples for AI (with manual-copy fallback)
- Language and sound controls
- PWA install action
- Application Data import/export for app-owned `localStorage` data
- Optional Google Drive export section, disabled until `VITE_GOOGLE_CLIENT_ID` is configured
- Delete Data section with typed `YES` confirmations for timer history and body data

## Tech stack

- React 18
- TypeScript
- Vite

## Project structure

- `src/App.tsx`
  Main app coordinator: mode routing, dialogs, and screen wiring.
- `src/app/`
  App-level types such as the top-level view mode.
- `src/data/`
  App-owned `localStorage` keys, persisted state specs, import/export helpers, and destructive data operations.
- `src/body/`
  Body metrics domain helpers, defaults, sanitizers, and sorting.
- `src/components/`
  UI components split by domain (`setup`, `run`, `plan`, `body`, `settings`, `shared`).
- `src/hooks/`
  Stateful hooks (`useTimerSession`, `useAudioFeedback`, `useWakeLock`, `useInstallPrompt`, etc.).
- `src/integrations/`
  Optional external integrations, including Google Drive export.
- `src/timer/`
  Timer types/constants/math/platform helpers.
- `src/plan/`
  Training-plan types, default program, sanitizer, and import/export helpers.
- `src/styles/`
  Feature-split CSS (`base`, `layout`, `navigation`, `setup`, `settings`, `plan`, `run`, `dialogs`, `success`, `orientation`).
- `public/manifest.webmanifest`
  PWA manifest.
- `public/sw.js`
  Service worker shell caching.
- `scripts/publish-gh-pages.sh`
  GitHub Pages publish script.

## Local storage keys

Timer:
- `pulse-hiit-settings`
- `pulse-hiit-locale`
- `pulse-hiit-history`
- `pulse-hiit-stats-panel-open`

Plan:
- `pulse-trainer-app-view`
- `pulse-trainer-program`
- `pulse-trainer-plan-section-visibility`

Body:
- `pulse-trainer-body-metrics`
- `pulse-trainer-body-height`

Google Drive:
- `pulse-trainer-google-drive-folder-id`

## Optional Google Drive export

Google Drive export is disabled unless the app is built with a Google OAuth web client ID:

```bash
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
```

When configured, Settings can export app data to a `Pulse Trainer` folder in Google Drive using the least-privilege `drive.file` scope. Google Drive import is reserved for a future Picker/API-key integration.

## Development

Install:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## GitHub Pages deploy

Build for GitHub Pages base path:

```bash
npm run build:gh-pages
```

Publish to `gh-pages` branch:

```bash
npm run publish:gh-pages
```
