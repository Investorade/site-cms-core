# Release notes

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
