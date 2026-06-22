#!/bin/sh
# Compute each artifact's "last updated" date from git history and write
# _data/artifact_dates.yml (discussion number -> ISO date of the last commit
# that touched the artifact). An artifact is any file under research/ that
# declares `discussion: N` in its front matter; for a directory artifact whose
# entry is a README/index, the date reflects the newest commit touching ANY
# file in that directory, not just the index file.
#
# Keys are written as integers (e.g. `33:`) so the layout's lookup
# `site.data.artifact_dates[page.discussion]` matches the integer front-matter
# value.
#
# Used by BOTH:
#   - the GitHub Actions workflow (checkout MUST use fetch-depth: 0 for history)
#   - you, locally (full history is already present)
#
# Re-run any time; the output is gitignored and regenerated on every build.

set -e
cd "$(dirname "$0")/.."
mkdir -p _data

OUT=_data/artifact_dates.yml
: > "$OUT"

grep -rl '^discussion:' research --include='*.md' | while IFS= read -r f; do
  num=$(sed -n 's/^discussion:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$f" | head -1)
  [ -n "$num" ] || continue

  # Scope: the whole directory for a README/index artifact, else the file.
  case "$(basename "$f" | tr '[:upper:]' '[:lower:]')" in
    readme.md|index.md) scope=$(dirname "$f") ;;
    *) scope="$f" ;;
  esac

  date=$(git log -1 --format=%cI -- "$scope" 2>/dev/null || true)
  [ -n "$date" ] || continue

  printf '%s: "%s"\n' "$num" "$date" >> "$OUT"
done

echo "Wrote $OUT ($(wc -l < "$OUT" | tr -d ' ') artifact dates)"
