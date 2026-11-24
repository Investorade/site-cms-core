# Release notes

## 1.0.0 (2026-11-24)

The first release, taken from Henderson RV Park as it was on 2026-11-24 (commit c93dc54). Nothing changes on a site that
moves to it: Henderson's built site is identical before and after.

- Build checks: redirects, sitemap, image descriptions and the SEO report; each form's lead emails and webhooks; one
  address per page and post.
- Content rules for the CMS's AI connector (admin/content-rules.json).
- Page and post schemas: only the title is required; empty SEO fields fall back to "<title> - <site name>" and the excerpt.
- SEO and schema.org tags (SEO.astro, SchemaOrg.astro), the blog engine, HTML cleaning, Markdown, links.
- The site Worker for the AI connector's addresses.
