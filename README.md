# Pulse Trainer

Mobile-first workout app built with React, TypeScript, and Vite.

Pulse Trainer has two modes:
- `Timer`: HIIT timer with audio/vibration feedback, history, and PWA install support.
- `Plan`: editable training program with warmup/workout/cardio/cooldown/notes, drag-and-drop ordering, and superset grouping.

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

### Settings
- Opened from the global top app bar, outside Timer and Plan content
- Hidden while a timer session is running
- Language and sound controls
- PWA install action and clear-history action
- Export the current training plan as JSON
- Import a valid training plan JSON file without changing timer settings, history, or language

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
  Plan types/constants/default program/sanitizers/import-export helpers.
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
