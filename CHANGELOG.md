# Release notes

## 1.4.0

Shared page sections. A site can use section types from the core instead of building its own: Hero, Text, Image and
text, Cards, Gallery, Questions and answers, Call to action and Contact details. Each one brings its CMS fields, what
it may hold (also for the AI connector) and a plain look that takes the site's colours and sizes, so a fix or a new
option in a shared section reaches every site that uses it with an update.

- In the site's `cms/sections.yml`: `- !section hero` (and so on), next to the site's own section types.
- In its schemas: `coreSections.hero` from `@investorade/site-cms-core/sections`.
- On its pages: `<Sections>` from `@investorade/site-cms-core/components/Sections.astro`, with the site's own section
  components passed in; a site can also draw any shared section with its own component.
- New options on top of the starter's sections: the hero's text position (left or centre) and the call to action's
  colour (brand or light).

Nothing changes on a site until it uses them, so the update makes no changes to the site's files.

## 1.3.0 (2026-11-24)

The CMS core is no longer park-specific. A site says what it is and what it uses in `cms/features.yml`:

- `site_type`: `park` or `business`, for the examples in the CMS hints (alt text, focus keyword, post address), filled in
  with the site's own name and city. A site can replace any example (`wording`).
- `features`: `blog`, `popups` (#book-now in link hints) and `ai_connector`; a feature that is off leaves its CMS
  parts out.
- Pop-ups are optional: a site without `src/data/popups.json` builds. The blog sidebar card has no default text.
- The AI connector hints say "a CMS admin" instead of a brand name.

The update adds `cms/features.yml` to each site as a park with every feature on, so nothing else changes.

## 1.2.0 (2026-11-24)

Adds a short README to each site's `cms/` folder, saying what the three files are for and that the result
(`/admin/config.yml`) is made when the site builds. The update writes the file itself; nothing else changes on the site.

## 1.1.1 (2026-11-24)

Blog posts are read the same way whatever line endings their file has. Before, a post saved with Windows line endings
lost its FAQ data for Google in local builds (sites built on Cloudflare were not affected).

## 1.1.0 (2026-11-24)

The CMS config is now shared. A site's `/admin/config.yml` is put together when it builds (and by the dev server) from the
core's `cms/` parts and the site's own `cms/` folder, so changes to shared CMS fields reach every site with an update.

- Shared: the sign-in settings, page details, SEO, Social and Advanced fields, the Blog, and the Site info, AI connector,
  Redirects and 404 page settings, plus the shared image and button fields (`!core image`, `!core button`).
- The site keeps: `cms/site.yml` (repo, CMS title, logo, optional extra collections), `cms/sections.yml` (page section
  types) and `cms/settings.yml` (its own Site settings files).
- Moving a site to 1.1.0: split its `public/admin/config.yml` into those three files and delete it (the build stops while
  it is still there). Henderson's CMS config comes out identical, field for field.

## 1.0.0 (2026-11-24)

The first release, taken from Henderson RV Park as it was on 2026-11-24 (commit c93dc54). Nothing changes on a site that
moves to it: Henderson's built site is identical before and after.

- Build checks: redirects, sitemap, image descriptions and the SEO report; each form's lead emails and webhooks; one
  address per page and post.
- Content rules for the CMS's AI connector (admin/content-rules.json).
- Page and post schemas: only the title is required; empty SEO fields fall back to "<title> - <site name>" and the excerpt.
- SEO and schema.org tags (SEO.astro, SchemaOrg.astro), the blog engine, HTML cleaning, Markdown, links.
- The site Worker for the AI connector's addresses.
