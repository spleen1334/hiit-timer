# Agent Instructions

This app is mobile-only. Treat every task, layout choice, and UI decision as if the product will be used on a phone first and almost exclusively.

## Source Of Truth

- The mobile view is the only supported design target.
- If desktop and mobile needs conflict, choose the mobile outcome.
- A desktop browser is only a development preview of the phone UI.
- The app should still look like a centered mobile app when opened on a desktop-sized screen.

## Layout Rules

- Default to a single-column layout.
- Do not introduce desktop-specific columns, sidebars, split panels, or wide toolbar layouts unless the user explicitly asks for them.
- Keep cards, controls, and settings blocks narrow enough to feel like a phone app, not a desktop dashboard.
- Inside each mobile card, interactive elements should generally stretch to full width unless there is a strong reason not to.
- Avoid horizontal overflow at all costs.

## Interaction Rules

- Design for touch, not mouse.
- Prefer large tap targets and simple vertical flows.
- Do not rely on hover interactions for core functionality.
- Keep controls usable with one thumb on a small screen.
- Treat portrait mode as the primary orientation.

## Visual Rules

- Preserve the PWA feel: focused, app-like, compact, and touch-friendly.
- Avoid adding desktop-style empty space just because the viewport is wider.
- Avoid tiny controls, dense inline toolbars, or multi-row control clusters that are hard to tap.
- Settings, actions, and utility controls should feel clear and strong on mobile.

## Implementation Rules

- When changing styles, reason from the mobile layout first.
- Do not add responsive behavior that expands into a desktop-specific design by default.
- Prefer making the base styles mobile and only add breakpoints when truly necessary.
- If a desktop window is used, the intended result is still a phone-style centered column.

## Verification

- Before considering UI work complete, inspect the result in a mobile-sized viewport.
- Use a phone-like viewport as the baseline mental model, for example around `390x844`.
- Check that buttons, sliders, dialogs, and settings panels are full-width when expected and easy to tap.
- Confirm that no change accidentally reintroduces a desktop layout.
