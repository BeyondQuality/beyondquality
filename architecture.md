# Architecture

How beyondquality.org is built and deployed.

## Overview

A static Jekyll site on GitHub Pages, built and deployed by a GitHub Actions workflow. The homepage's enquiries list is rendered at build time from open GitHub Discussions.

```
GitHub Discussions
   │  bin/fetch-enquiries.sh  (gh api graphql, OPEN only)
   ▼
_data/enquiries.json  (gitignored, regenerated each build)
   │  jekyll build  (tabbed-content.html renders the list + front-matter artifact pills)
   ▼
_site  →  GitHub Pages
```

GitHub Discussions are the source of truth, so closing one drops it from the site on the next build. Nothing in `_data/` is committed, so the fetch script runs `mkdir -p _data` before writing. GraphQL is used because the REST list endpoint ignores `?state=open`.

## Deployment workflow

`.github/workflows/deploy.yml`. Build job: `fetch-enquiries.sh` → `setup-ruby` → `jekyll build` → upload. Deploy job is gated `if: github.event_name != 'pull_request'`, so PRs build but never publish.

Triggers:
- `push` to `main` — deploy.
- `pull_request` — build only.
- `schedule` (hourly) — the backbone: a full re-fetch reconciles the site, so missed events self-heal.
- `discussion` (created/edited/deleted/category_changed/transferred) — an accelerator. It does **not** fire on close/reopen, so closes propagate via the cron, not instantly.
- `workflow_dispatch` — manual.

A custom workflow is needed because Pages' built-in builder can't run the `gh api graphql` fetch step, so Pages Source is set to "GitHub Actions". Note: `schedule`/`discussion` only fire from the default branch, and scheduled workflows auto-disable after 60 days of repo inactivity.

## Local development

- `local/serve.sh` — `jekyll serve --livereload` on http://127.0.0.1:4000. Pins Ruby 3.1.3 and bypasses the `jekyll`/`bundle` binstubs (their shebang points at the wrong Ruby).
- `bash bin/fetch-enquiries.sh` — refresh the enquiries locally (needs `gh auth login`).
- `_config.yml` changes need a server restart; `_data/` and templates hot-reload.

## Key configuration

- `_config.yml`: `baseurl: ""` (served at the domain root), and an `exclude:` list that keeps repo/working files (`local/`, `bin/`, `README.md`, `architecture.md`, …) out of the build. Setting `exclude` replaces Jekyll's default, so the vendor/Gemfile entries are repeated there.
- `CNAME` — the `beyondquality.org` custom domain, re-asserted on each deploy.
- `Gemfile.lock` must include the `x86_64-linux` platform or CI fails at `bundle install` (ubuntu runners are glibc): `bundle lock --add-platform x86_64-linux`.

## Enquiry artifacts ↔ discussions

An enquiry shows an "Artifact" pill when an artifact declares, in its own front matter, which discussion it belongs to:

```yaml
---
discussion: 33
---
```

At build time the template matches the page whose `discussion` equals the enquiry number and reads its URL and title from Jekyll, so the artifact can be any shape: a single file, a file in a subdirectory, or a directory with a `README.md` index. Adding the key is URL-safe (it does not change a file's slug), and there is no central list to maintain.

For the README-index shape, `_config.yml` sets `readme_index: { with_frontmatter: true }`; without it, `jekyll-readme-index` skips READMEs that have front matter and the clean `/research/<dir>/` URL breaks.

## Other automation

`.github/workflows/update-content-backlog.yml` — on a push touching `research/**`, appends progress notes to an external `content-backlog` repo. Unrelated to the site deploy.
