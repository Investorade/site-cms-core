# site-cms-core

The shared, versioned CMS core for Investorade sites (Astro + Sveltia CMS). Any kind of site can use it, not only RV parks (`cms/features.yml`: site type and features).

Each site keeps its own design, content and CMS (at its own `/admin`) in its own repo, and uses one version of this core through
`package.json`. A new release shows up as an available update for every site in the admin panel (cms.dadscampgrounds.com/admin),
and a site changes only when it is updated there.

## What's in the core

- The CMS fields for pages, posts and Site settings (merged at build with the site's own section types into `/admin/config.yml`)
- Content rules and checks (one address per page, title-only requirement, redirects, sitemap, robots)
- SEO tags and schema.org data, the blog engine, HTML cleaning, the forms check
- The admin and AI connector routes for the site's Worker
- The shared CMS kit version that matches each release (planned)

## What stays in each site

Design (sections, header, footer, styles, icons), content, uploads, settings values, and `site.config` (site type and which
features are on).

## Versions

Releases use semantic versions (1.0.0, 1.1.0…) with plain-English release notes. 1.0.0 is extracted from Henderson RV Park as it
was on 2026-11-24 (commit c93dc54).

This repository holds no secrets.

## Using it in a site

```js
// package.json
"@investorade/site-cms-core": "github:Investorade/site-cms-core#v1.0.0"

// astro.config.mjs
import siteCmsCore from '@investorade/site-cms-core';
import { pageSchema, postSchema } from './src/lib/content-schemas.ts';
integrations: [siteCmsCore({ schemas: { pages: pageSchema, posts: postSchema } })]

// src/lib/content-schemas.ts: the site's own sections, plus the shared page and post schemas
import { createPageSchema, createPostSchema, image, button, blogListBlock } from '@investorade/site-cms-core/schemas';

// worker/index.ts
export { default } from '@investorade/site-cms-core/worker';

// wrangler.jsonc: Cloudflare builds branches with `wrangler preview`, which needs this block. Without it, the
// preview of an update (CMS admin → Updates) fails at its deploy step.
"previews": {}
```

Components: `@investorade/site-cms-core/components/SEO.astro`, `.../SchemaOrg.astro`. Helpers: `@investorade/site-cms-core/lib/<name>`
(blog, markdown, links, sanitize-html, text, seo-report, image-alt). The core reads the site's settings through the `@site/`
alias (the site's `src/` folder), e.g. `@site/data/site.json`.

## CMS config

The site's `/admin/config.yml` is made by the core (served by the dev server, written to `dist/admin/config.yml` by the
build). Don't keep a `public/admin/config.yml`: the build stops if there is one.

| Core (`cms/`) | Site (`cms/`) |
| --- | --- |
| `base.yml`: sign-in (backend), media folders, output | `site.yml`: `backend.repo`, `app_title`, `logo`; may override any core key, and add `collections` (placed after the Blog) |
| `pages.yml`: Pages, with the site's sections as "Page sections" | `sections.yml`: the page section types (a list) |
| `posts.yml`: Blog | |
| `settings.yml`: Site info, AI connector, Redirects, 404 page | `settings.yml`: the site's own Site settings files (a list, after the core's) |
| `fields.yml`: shared field sets | |

`fields: !core image` (or `!core button`) uses a shared field set, in core and site files alike. `readCmsConfig(root)` and
`cmsConfigYaml(root)` (from `@investorade/site-cms-core`) give the result as data or text.

## Site type and features

`cms/features.yml` in the site (optional; without it a site is a `business` site with the blog and the AI connector, and
no pop-ups):

```yaml
site_type: park            # park | business | medical: the examples in the CMS hints (cms/wording.yml)
features:
  pages: true              # pages made of sections (false: the site's own page collections in cms/collections.yml)
  blog: true               # the Blog collection
  popups: true             # Book Now / exit pop-ups: #book-now in link hints
  ai_connector: true       # Site settings → AI connector (needs pages made of sections)
blog_path: /               # where posts live: / (/<post>/) or e.g. /blog/ (/blog/<post>/)
wording:                   # optional: the site's own examples
  keyword_example: "med spa Dallas, Botox Dallas"
```

The examples use {name}, {city} and {region} from the site's `src/data/site.json`.

More site files the core reads when present: `cms/collections.yml` (the site's own collections, after the Blog) and
`cms/post-fields.yml` (extra post fields, before SEO; add the same fields with `createPostSchema({ siteName, extend })`).

## Sites on Cloudflare Pages

A site whose domain's DNS is outside Cloudflare stays on Pages (Workers need the DNS in Cloudflare). The AI connector
route is then a Pages Functions middleware: `functions/_middleware.js` → `export { onRequest } from
'@investorade/site-cms-core/pages';`, `public/_routes.json` limiting Functions to the connector's paths and the site's own
routes, and the service binding CMS_MCP → dadscampgrounds-cms-auth (entrypoint ParkMcp). Pages builds every branch
with a preview address, so Updates work the same way.

## Making a release

1. Change `src/`, then `npm run build` (the compiled `dist/` is committed, so sites need no build step for the core).
2. Test against a site: `npm pack`, then in the site `npm install --no-save <path to the .tgz>` and build it.
3. Bump `version` in package.json, add the release notes to CHANGELOG.md, commit, and tag `v<version>`.
4. If the release needs more than the version change, describe it in `releases.json` (read from main by the Updates
   pages, so it can be corrected later):
   - `"oneWay": true` and a `"why"`: sites can't go back below this version afterwards.
   - `"steps"`: simple changes to each site's files, made in the update's commit: `{ "move": "a", "to": "b" }`,
     `{ "delete": "a" }`, `{ "create": "a", "contents": "…" }` (only if missing), `{ "setJson": "a.json", "key": "x.y",
     "value": … }`. Each must be safe to repeat; such a release is one-way too.
   - `"needsDeveloper": "why"`: not offered in the CMS; a developer updates each site.
   Anything a step can't express needs a developer. Prefer keeping the core able to read both the old and the new format.
