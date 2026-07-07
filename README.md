# Pulse Trainer

Mobile-first workout app built with React, TypeScript, and Vite.

Pulse Trainer has three modes:
- `Timer`: HIIT timer with audio/vibration feedback, history, and PWA install support.
- `Plan`: editable training program with warmup/workout/cardio/cooldown/notes, drag-and-drop ordering, and superset grouping.
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
- Workout cards:
  - Compact summary + explicit `Edit` control
  - Add/remove workouts
  - Drag reorder
  - Drop on another card to create/extend supersets
  - Superset link icon to break superset
  - Reorder items within the same superset
- Cardio entries:
  - Compact summary + explicit `Edit` control
  - Add/remove cardio entries
- Program and section visibility persist in `localStorage`

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
  Main app coordinator: mode routing, persistent state, dialogs, timer/plan screen wiring.
- `src/components/`
  UI components split by domain (`setup`, `run`, `plan`, `settings`, `shared`).
- `src/hooks/`
  Stateful hooks (`useTimerSession`, `useAudioFeedback`, `useWakeLock`, `useInstallPrompt`, etc.).
- `src/timer/`
  Timer types/constants/math/platform helpers.
- `src/plan/`
  Plan and body metrics types/constants/default program/sanitizers/helpers.
- `src/appData.ts`
  App-owned `localStorage` export/import helpers.
- `src/googleDrive.ts`
  Optional Google Drive export integration using Google Identity Services and Drive `drive.file` scope.
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
