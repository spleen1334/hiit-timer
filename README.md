# Pulse HIIT Timer

Mobile-only HIIT timer built with React, TypeScript, and Vite. The app is designed for phone-sized portrait use and keeps the same mobile-style layout even when opened in a desktop browser.

## What It Does

- Configure `active`, `rest`, `rounds`, `initial delay`, `sound`, and `language`
- Run the workout in a full-screen timer view with color-coded phases
- Persist settings in `localStorage`
- Save successful workout history in `localStorage`
- Show a current-session breakdown graph and a recent history chart
- Support installable PWA behavior
- Lock the UI to portrait orientation
- Publish to GitHub Pages from the `gh-pages` branch

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
- `scripts/publish-gh-pages.sh`
  GitHub Pages publish script. Builds the app with the correct base path and publishes the generated files to the root of the `gh-pages` branch.

## Localization

Localization strings live in `src/i18n.ts`.

The app currently includes:

- `en` for English
- `sr` for Serbian (Cyrillic)

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
- `pulse-hiit-settings-panel-open`
  Open or closed state for the settings section
- `pulse-hiit-stats-panel-open`
  Open or closed state for the session and history section

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

Create a production build for GitHub Pages:

```bash
npm run build:gh-pages
```

Preview the production build:

```bash
npm run preview
```

## GitHub Pages Deploy

This project is configured for the GitHub Pages site:

- Site URL: `https://spleen1334.github.io/hiit-timer/`
- Publish branch: `gh-pages`

### What the deploy script does

`npm run publish:gh-pages` runs `scripts/publish-gh-pages.sh`.

The script:

1. Builds the app with the GitHub Pages base path `/hiit-timer/`
2. Adds `.nojekyll` to the build output
3. Creates a temporary clone of the GitHub repository
4. Checks out or creates the `gh-pages` branch in that temporary clone
5. Replaces the branch root with the built files from `dist`
6. Commits the generated site
7. Pushes the result to `origin/gh-pages`

### Deploy command

```bash
npm run publish:gh-pages
```

### Notes about deploys

- The GitHub Pages build uses the `/hiit-timer/` base path, so production asset URLs, manifest paths, and service worker registration all resolve correctly under the repository subpath.
- The generated site is published from the root of the `gh-pages` branch, not from a `docs/` directory.
- If you do not see the latest version immediately, wait for GitHub Pages to refresh and then hard-refresh the site in the browser.
- If you are testing the PWA on a phone and an older installed version is stuck, remove the old home-screen app and reopen the site.

## Notes

- The timer history records only successful completed sessions.
- The last successful session is shown on the home screen together with a small recent-runs chart.
- The current-session graph is derived from the selected settings, so it updates live before starting the workout.
- The install button in the Settings section uses the native install prompt where supported and falls back to manual install instructions when needed.
