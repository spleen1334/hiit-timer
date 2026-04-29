# Pulse HIIT Timer

Mobile-first HIIT timer built with React, TypeScript, and Vite.

## What It Does

- Configure `active`, `rest`, `rounds`, `initial delay`, `sound`, and `language`
- Run the workout in a full-screen timer view with color-coded phases
- Persist settings in `localStorage`
- Save successful workout history in `localStorage`
- Show a current-session breakdown graph and a recent history chart
- Support installable PWA behavior
- Lock the UI to portrait orientation

## Project Structure

- `src/App.tsx`
  Main application state, timer flow, UI rendering, history handling, and success animation.
- `src/i18n.ts`
  Localization data. Add or edit languages here.
- `src/styles.css`
  Visual system, responsive layout, timer states, graphs, and overlays.
- `public/manifest.webmanifest`
  PWA manifest.
- `public/sw.js`
  Service worker for basic offline shell caching.

## Localization

Localization strings live in `src/i18n.ts`.

The app currently includes:

- `en` for English
- `sr` for Serbian (Latin)

To add another language:

1. Add a new locale id to `Locale`
2. Add a new entry to `LOCALE_OPTIONS`
3. Add a matching translation object to `MESSAGES`

## Local Storage

The app stores persistent data in these keys:

- `pulse-hiit-settings`
  Timer configuration and sound setting
- `pulse-hiit-locale`
  Selected UI language
- `pulse-hiit-history`
  Successful workout history

## Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- The timer history records only successful completed sessions.
- The last successful session is shown on the home screen together with a small recent-runs chart.
- The current-session graph is derived from the selected settings, so it updates live before starting the workout.
