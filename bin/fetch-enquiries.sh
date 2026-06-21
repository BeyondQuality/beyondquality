#!/bin/sh
# Fetch OPEN GitHub discussions and write them to _data/enquiries.json so Jekyll
# can render the enquiries list statically at build time (no client-side fetch).
#
# Used by BOTH:
#   - the GitHub Actions workflow (auth: GITHUB_TOKEN, via GH_TOKEN env)
#   - you, locally (auth: your `gh auth login`)
#
# Local use:
#   bash bin/fetch-enquiries.sh
# Re-run any time to refresh. With `jekyll serve --watch`, the page rebuilds
# automatically when _data/enquiries.json changes.
#
# GitHub is the source of truth: only OPEN discussions are fetched, so closing a
# discussion on GitHub removes it from the site on the next build.

set -e
cd "$(dirname "$0")/.."

# _data/ may not exist in a fresh checkout: enquiries.json is gitignored, and there
# are no other tracked files in _data/, so the directory is absent on CI runners.
mkdir -p _data

# GraphQL supports state filtering (states: OPEN), unlike the REST list endpoint.
# Ordered most-recently-updated first. first:100 covers current volume; add
# cursor pagination here if open discussions ever exceed 100.
gh api graphql --jq '.data.repository.discussions.nodes' -f query='
  query {
    repository(owner: "BeyondQuality", name: "beyondquality") {
      discussions(first: 100, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          number
          title
          url
        }
      }
    }
  }' > _data/enquiries.json

echo "Wrote _data/enquiries.json ($(grep -o '"number"' _data/enquiries.json | wc -l | tr -d ' ') open enquiries)"
