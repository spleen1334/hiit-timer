#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="gh-pages"
BASE_PATH="/hiit-timer/"
SITE_URL="https://spleen1334.github.io/hiit-timer/"
PUBLISH_DIR="$(mktemp -d "${TMPDIR:-/tmp}/hiit-gh-pages.XXXXXX")"
REMOTE_URL=""

cleanup() {
  rm -rf "$PUBLISH_DIR"
}

trap cleanup EXIT

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run inside a git repository." >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' is required for publishing." >&2
  exit 1
fi

REMOTE_URL="$(git remote get-url origin)"

echo "Building GitHub Pages bundle for $SITE_URL"
echo "Using base path: $BASE_PATH"
npm run build:gh-pages
touch dist/.nojekyll

git clone --quiet "$REMOTE_URL" "$PUBLISH_DIR"

cd "$PUBLISH_DIR"

if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  git checkout -B "$BRANCH" "origin/$BRANCH" >/dev/null 2>&1
elif git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout -B "$BRANCH" "$BRANCH" >/dev/null 2>&1
else
  git checkout --orphan "$BRANCH" >/dev/null 2>&1
fi

find "$PUBLISH_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R "$REPO_ROOT"/dist/. "$PUBLISH_DIR"/

git add --all

if git diff --cached --quiet; then
  echo "No changes to publish on $BRANCH."
  exit 0
fi

git commit -m "Publish GitHub Pages site"
git push origin "$BRANCH"

echo "Published to $SITE_URL"
