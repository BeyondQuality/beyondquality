# Architecture

How beyondquality.org is built and deployed.

## Overview

The site is a **static Jekyll site** hosted on **GitHub Pages**, built and deployed by a
**GitHub Actions workflow** (not the built-in "deploy from a branch" builder). The homepage's
enquiries list is **server-rendered at build time** from open GitHub Discussions — there is no
client-side JavaScript fetching data in the browser.

```
GitHub Discussions (source of truth)
        │  bin/fetch-enquiries.sh  (gh api graphql, OPEN only)
        ▼
_data/enquiries.json  (generated each build, gitignored)
        │  _includes/tabbed-content.html  (Liquid loop, joins _data/artifacts.yml)
        ▼
static HTML  →  jekyll build  →  _site  →  deploy to GitHub Pages
```

## The enquiries list (data flow)

1. **Source of truth: GitHub Discussions.** Only **OPEN** discussions appear on the site. Closing a
   discussion on GitHub removes it from the site on the next build.
2. **`bin/fetch-enquiries.sh`** runs `gh api graphql` for open discussions (ordered by most recently
   updated) and writes `_data/enquiries.json` — an array of `{number, title, url}`. The same script
   is used by CI (auth: `GITHUB_TOKEN`) and locally (auth: your `gh auth login`). REST's discussions
   endpoint ignores `?state=open`; GraphQL's `states: OPEN` is why this uses GraphQL.
3. **`_includes/tabbed-content.html`** loops over `site.data.enquiries` and, for each, joins
   `site.data.artifacts[number]` (from `_data/artifacts.yml`) at build time. Enquiries that produced
   a research artifact show an inline "Artifact" pill linking to the on-site rendered page.
4. **`_data/enquiries.json` is gitignored** — it is regenerated on every build, never committed.

This replaced an earlier client-side approach (a browser `fetch` to `api.github.com`), removing the
rate-limit risk and making the list fast and indexable.

## Deployment workflow

`.github/workflows/deploy.yml`.

**Triggers:**
- `push` to `main` — deploy on every change to the default branch.
- `pull_request` — **build only** (the deploy job is gated off; see below).
- `schedule` (hourly cron) — the **backbone**. The job is idempotent (full re-fetch each run), so it
  reconciles the site with GitHub and missed events self-heal on the next tick.
- `discussion` (created, edited, deleted, category_changed, transferred) — an **accelerator** for near
  -instant updates. Note: the `discussion` trigger does **not** fire on `closed`/`reopened`, so
  closes propagate via the hourly cron, not instantly. That is why cron is the backbone, not events.
- `workflow_dispatch` — manual run.

**Jobs:**
- `build`: checkout → run `bin/fetch-enquiries.sh` (`GH_TOKEN: github.token`) → `ruby/setup-ruby`
  (`bundler-cache`) → `bundle exec jekyll build` (`JEKYLL_ENV: production`) → `upload-pages-artifact`.
- `deploy`: gated by `if: github.event_name != 'pull_request'` so PRs build but never publish; on
  push/schedule/etc. it runs `deploy-pages`.

**Why a custom workflow:** GitHub Pages' built-in "deploy from a branch" builder runs a plain
`jekyll build` and cannot run our `gh api graphql` fetch step. So Pages is set to
**Settings → Pages → Source: "GitHub Actions"**, handing build+deploy to this workflow.

**Caveats:** `schedule` and `discussion` only fire from the workflow file on the **default branch**.
Scheduled workflows auto-disable after 60 days of repo inactivity.

## Local development

- **`local/serve.sh`** — runs `jekyll serve --livereload` on http://127.0.0.1:4000. It pins Ruby
  3.1.3 and bypasses the `jekyll`/`bundle` binstubs (their shebang points at the wrong Ruby).
- **`bash bin/fetch-enquiries.sh`** — refresh `_data/enquiries.json` locally on demand (needs
  `gh auth login`). With `serve --watch`, the page rebuilds when the file changes.
- **`_config.yml` changes need a server restart** (`--watch` does not reload config). `_data/` and
  templates hot-reload.

## Key configuration

- **`_config.yml`**: `url: https://beyondquality.org`, `baseurl: ""` (served at the domain root via
  the custom domain), `jekyll-seo-tag` plugin, default `image: /bq.jpeg`, and an `exclude:` list that
  keeps repo/working files out of the build (`local/`, `bin/`, `README.md`, `architecture.md`,
  `docker-run.sh`, etc.). Setting `exclude` replaces Jekyll's default list, so the vendor/Gemfile
  entries are repeated there.
- **`CNAME`** — the `beyondquality.org` custom domain. The deploy re-asserts it on each publish.
- **`Gemfile`** — `github-pages` + `webrick`. **`Gemfile.lock` must list the `x86_64-linux`
  platform** or CI fails at `bundle install` (ubuntu runners are glibc; add it with
  `bundle lock --add-platform x86_64-linux`).

## Research artifacts ↔ discussions

An enquiry shows an "Artifact" pill when a research artifact is linked to its discussion. GitHub
discussions are the source of truth; artifacts link *to* them, and **each artifact declares which
discussion it belongs to in its own front matter** (see `_includes/tabbed-content.html`):

```yaml
---
discussion: 33
---
```

At build time the template finds the page whose `discussion` matches the enquiry number
(`site.pages | where: "discussion", enquiry.number`) and reads the **URL and title straight from
Jekyll**. The artifact can be any shape — a single file, a file in a subdirectory, or a directory
with a `README.md` index — its only job is to declare the number. There is no central list to
maintain (an earlier hand-written `_data/artifacts.yml` map has been retired in favour of this).

Adding `discussion:` front matter is **URL-safe** — it does not change a file's slug, so existing
inbound links keep working. To link an artifact, add the front matter to its entry file (e.g.
`research/ap/README.md` for discussion 33) and the pill appears on the next build. The pill points
only at on-site research pages; there is no mapping for off-site artifact URLs.

Artifacts in `/research/` come in three URL shapes, all handled automatically because Jekyll computes
each page's URL:
- single file: `research/laziness.md` → `/research/laziness`
- file in a subdirectory: `research/testing_economics/testing_economics.md` → `/research/testing_economics/testing_economics`
- directory with a `README.md` index: `research/ap/README.md` → `/research/ap/`

For the third shape, `_config.yml` sets `readme_index: { with_frontmatter: true }` — without it,
`jekyll-readme-index` silently skips READMEs that have front matter, which would break the clean
`/research/<dir>/` URL once a `discussion:` key is added.

Pages under `research/` render with global typography via `jekyll-optional-front-matter` +
`jekyll-titles-from-headings` + `jekyll-default-layout` (titles come from each file's `# H1`).

## Other automation

`.github/workflows/update-content-backlog.yml` — on a push to `main` that touches `research/**`, it
appends progress notes to an external `content-backlog` repo (derivative-content tracking). Unrelated
to the site deploy.
