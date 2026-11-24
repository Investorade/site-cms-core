# site-cms-core

The shared, versioned CMS core for Investorade sites (Astro + Sveltia CMS). Any kind of site can use it, not only RV parks.

Each site keeps its own design, content and CMS (at its own `/admin`) in its own repo, and uses one version of this core through
`package.json`. A new release shows up as an available update for every site in the admin panel (cms.dadscampgrounds.com/admin),
and a site changes only when it is updated there.

## What's in the core

- The CMS fields for pages, posts and Site settings (merged at build with the site's own section types into `/admin/config.yml`)
- Content rules and checks (one address per page, title-only requirement, redirects, sitemap, robots)
- SEO tags and schema.org data, the blog engine, HTML cleaning, the forms check
- The admin and AI connector routes for the site's Worker
- The shared CMS kit version that matches each release

## What stays in each site

Design (sections, header, footer, styles, icons), content, uploads, settings values, and `site.config` (site type and which
features are on).

## Versions

Releases use semantic versions (1.0.0, 1.1.0…) with plain-English release notes. 1.0.0 is extracted from Henderson RV Park as it
was on 2026-11-24 (commit c93dc54).

This repository holds no secrets.
