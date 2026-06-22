# Beyond Quality

An open-source community for deeper enquiry. We dig deeper, collaborate in public, and care and appreciate. We invite open enquiries, promote public speaking, and facilitate hands-on projects.

## Website
Visit our main website: **[beyondquality.org](https://beyondquality.org)**

## Repository Contents
- **Enquiry artifacts** in `/research/` - the outputs of completed enquiries
- **Website source** - static Jekyll site; the homepage enquiries list is generated at build time from open GitHub Discussions
- **Community discussions** - where we discuss enquiries, and the source of truth for the site's enquiries list

## Architecture
See **[architecture.md](architecture.md)** for how the site is built and deployed.

## Get involved
Everything starts as an enquiry. [Start one](https://github.com/BeyondQuality/beyondquality/discussions/new/choose), or join an existing [discussion](https://github.com/BeyondQuality/beyondquality/discussions): observe, share a link or an idea, or partner on someone else's enquiry.

## Code of Conduct
We follow our [Code of Conduct](coc.md) in all activities.

## Artifact front matter
Research pages under `/research/` use these front-matter keys:

| Key | What it does |
|-----|--------------|
| `discussion: N` | Marks the artifact's entry page for GitHub Discussion N. Drives the homepage Artifact pill, the page header, the "Updated" date (from git), and the Discussion link. |
| `part_of: N` | Marks a section of a multi-page artifact: same header and links as the entry, but no homepage pill (only the entry gets that). |
| `author:` | Byline name. |
| `collaborators:` | Appended to the byline as "…, with …". |
| `title:` | Page title (header and SEO). Only needed when the page's first heading isn't its title (e.g. a sub-page that opens with a table of contents). |
| `video: <id>` | YouTube id (the `v=` value); renders one responsive embed. |
| `doi:` | DOI value (no URL); becomes a DOI link. |
| `repo:` | Repository URL; becomes a Repository link. |
