import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ImageAlt } from "../lib/image-alt.js";
import { analyzePage } from "../lib/seo-report.js";
/**
 * After the build, writes two files for Cloudflare and search engines:
 *
 * - `_redirects`: the CMS redirects (src/data/redirects.json, "Site settings → Redirects") in list order, then a 301
 *   from each page's address without the trailing slash (as WordPress did; Cloudflare's own fix-up is a temporary
 *   307), then the fixed rules from public/_redirects. Broken CMS rules fail the build, so a bad rule never goes live.
 * - `sitemap.xml`: every built page that search engines may index (no `noindex`, and its canonical URL is the page
 *   itself), so the "Search engine visibility" switches are respected automatically.
 * - Image descriptions (src/data/image-alt.json, "Images" page in the CMS top bar): added to the images of every
 *   built page that have no alt text of their own (src/lib/image-alt.ts), before the SEO checks run.
 * - `admin/seo-report.json`: every page's SEO inputs and technical checks (src/lib/seo-report.ts), read by the CMS's SEO
 *   dashboard, and every image with where its alt text comes from, read by the CMS's Images page. It describes the HTML
 *   as built, so it's current as of the last build.
 */
const STATUSES = new Set([301, 302, 307, 308]);
// Cloudflare Workers static assets limits: https://developers.cloudflare.com/workers/static-assets/redirects/
const MAX_STATIC = 2000;
const MAX_DYNAMIC = 100;
export default function seoFiles() {
    let root = process.cwd();
    return {
        name: 'seo-files',
        hooks: {
            'astro:config:done': ({ config }) => {
                root = fileURLToPath(config.root);
            },
            'astro:build:done': ({ dir, logger }) => {
                const outDir = fileURLToPath(dir);
                const siteUrl = readJson(path.join(root, 'src/data/site.json')).url;
                const pages = findPages(outDir);
                writeRedirects(root, outDir, pages, logger);
                writeSitemap(outDir, pages, siteUrl, logger);
                const images = applyImageDescriptions(root, outDir, pages, siteUrl, logger);
                writeSeoReport(root, outDir, pages, siteUrl, logger, images);
            },
        },
    };
}
function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
/** Every `index.html` in the build output, with the SEO tags the sitemap needs. */
function findPages(outDir) {
    const pages = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (dir === outDir && ['_astro', 'uploads'].includes(entry.name))
                    continue;
                walk(full);
            }
            else if (entry.name === 'index.html') {
                const rel = path.relative(outDir, dir).split(path.sep).join('/');
                const html = fs.readFileSync(full, 'utf8');
                pages.push({
                    path: rel ? `/${rel}/` : '/',
                    robots: html.match(/<meta name="robots" content="([^"]*)"/)?.[1],
                    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1],
                    modified: html.match(/<meta property="article:modified_time" content="([^"]*)"/)?.[1],
                });
            }
        }
    };
    walk(outDir);
    return pages.sort((a, b) => a.path.localeCompare(b.path));
}
const isDynamic = (from) => from.includes('*') || from.includes(':');
/** `/old` ↔ `/old/`, for static paths whose last segment is not a file name. */
function slashVariant(from) {
    if (from === '/' || isDynamic(from))
        return undefined;
    if (from.endsWith('/'))
        return from.slice(0, -1);
    return /\.[a-z0-9]+$/i.test(from) ? undefined : `${from}/`;
}
/** Validates the CMS redirects. Returns the rules (with their slash variants) and any errors. */
function cmsRules(root, pagePaths, logger) {
    const file = path.join(root, 'src/data/redirects.json');
    const data = fs.existsSync(file) ? readJson(file) : {};
    const list = Array.isArray(data.redirects) ? data.redirects : [];
    const errors = [];
    const rules = [];
    const seen = new Map();
    list.forEach((item, index) => {
        const row = (item ?? {});
        const from = String(row.from ?? '').trim();
        const to = String(row.to ?? '').trim();
        const status = Number(row.status ?? 301);
        const label = `Redirect ${index + 1} (${from || 'no From'})`;
        const problems = [];
        if (!from.startsWith('/'))
            problems.push('"From" must start with /');
        if (/\s/.test(from) || /\s/.test(to))
            problems.push('remove the spaces');
        if (/[?#]/.test(from))
            problems.push('"From" cannot contain ? or # (Cloudflare ignores query strings)');
        if (!to.startsWith('/') && !/^https?:\/\/[^/\s]+/.test(to))
            problems.push('"To" must be a path (/new-page/) or a full https:// URL');
        if (!STATUSES.has(status))
            problems.push('"Type" must be 301, 302, 307 or 308');
        if (from && from === to)
            problems.push('"From" and "To" are the same, which would loop');
        if (seen.has(from))
            problems.push(`same "From" as ${seen.get(from)}`);
        if (problems.length) {
            errors.push(`${label}: ${problems.join('; ')}.`);
            return;
        }
        seen.set(from, label);
        rules.push({ from, to, status, label });
        if (pagePaths.has(from))
            logger.warn(`${label} redirects away from an existing page, so that page can no longer be reached.`);
    });
    // Also catch the address with/without the trailing slash, unless the editor set that one explicitly.
    for (const rule of [...rules]) {
        const variant = slashVariant(rule.from);
        if (variant && !seen.has(variant) && variant !== rule.to) {
            seen.set(variant, rule.label);
            rules.push({ ...rule, from: variant });
        }
    }
    return { rules, errors };
}
/** Parses `from to [status]` lines of a _redirects file. */
function parseRedirectsFile(text, label) {
    return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
        const [from, to, status] = line.split(/\s+/);
        return { from, to, status: Number(status ?? 302), label };
    });
}
function writeRedirects(root, outDir, pages, logger) {
    const pagePaths = new Set(pages.map((p) => p.path));
    const { rules: cms, errors } = cmsRules(root, pagePaths, logger);
    const taken = new Set(cms.map((r) => r.from));
    const trailingSlash = pages
        .filter((p) => p.path !== '/')
        .map((p) => ({ from: p.path.slice(0, -1), to: p.path, status: 301, label: `trailing slash for ${p.path}` }))
        .filter((r) => !taken.has(r.from));
    trailingSlash.forEach((r) => taken.add(r.from));
    // public/_redirects is copied into the build output by Astro; its rules go last.
    const fixedFile = path.join(outDir, '_redirects');
    const fixedText = fs.existsSync(fixedFile) ? fs.readFileSync(fixedFile, 'utf8') : '';
    const fixed = parseRedirectsFile(fixedText, 'public/_redirects').filter((r) => {
        if (!taken.has(r.from))
            return true;
        logger.warn(`The CMS redirect for ${r.from} replaces the rule in public/_redirects.`);
        return false;
    });
    const all = [...cms, ...trailingSlash, ...fixed];
    // Redirect chains that come back to where they started.
    const next = new Map(all.filter((r) => !isDynamic(r.from) && r.to.startsWith('/')).map((r) => [r.from, r]));
    const looped = new Set();
    for (const start of cms) {
        if (looped.has(start.label))
            continue; // one message per CMS row, not again for its slash variant
        const visited = [start.from];
        let current = next.get(start.from);
        while (current) {
            if (visited.includes(current.to)) {
                errors.push(`${start.label}: the redirects loop (${[...visited, current.to].join(' → ')}).`);
                looped.add(start.label);
                break;
            }
            visited.push(current.to);
            current = next.get(current.to);
        }
    }
    const dynamicCount = all.filter((r) => isDynamic(r.from)).length;
    const staticCount = all.length - dynamicCount;
    if (staticCount > MAX_STATIC)
        errors.push(`Too many redirects: ${staticCount} (Cloudflare allows ${MAX_STATIC}).`);
    if (dynamicCount > MAX_DYNAMIC)
        errors.push(`Too many redirects with * or :name: ${dynamicCount} (Cloudflare allows ${MAX_DYNAMIC}).`);
    if (errors.length) {
        throw new Error(`Fix these redirects in the CMS (Site settings → Redirects):\n- ${errors.join('\n- ')}`);
    }
    const line = (r) => `${r.from} ${r.to} ${r.status}`;
    const text = [
        '# Generated by src/integrations/seo-files.ts at build time. Do not edit this copy:',
        '# change redirects in the CMS (Site settings → Redirects) or in public/_redirects.',
        '',
        '# CMS redirects',
        ...cms.map(line),
        '',
        '# Pages without the trailing slash (301, as on WordPress)',
        ...trailingSlash.map(line),
        '',
        fixedText.trim(),
        '',
    ].join('\n');
    fs.writeFileSync(fixedFile, text);
    logger.info(`_redirects: ${cms.length} from the CMS, ${trailingSlash.length} trailing-slash, ${fixed.length} fixed.`);
}
/** Adds the Image descriptions to every built page (not the CMS) and returns every image for the report. */
function applyImageDescriptions(root, outDir, pages, siteUrl, logger) {
    const file = path.join(root, 'src/data/image-alt.json');
    const list = fs.existsSync(file) ? (readJson(file).images ?? []) : [];
    const imageAlt = new ImageAlt(new URL(siteUrl).origin, list);
    let changed = 0;
    for (const page of pages.filter((p) => p.canonical)) {
        const htmlFile = path.join(outDir, page.path, 'index.html');
        const html = fs.readFileSync(htmlFile, 'utf8');
        const next = imageAlt.apply(html, page.path);
        if (next !== html) {
            fs.writeFileSync(htmlFile, next);
            changed++;
        }
    }
    const images = imageAlt.images();
    const missing = images.filter((i) => i.source === 'missing').length;
    for (const problem of imageAlt.problems)
        logger.warn(problem);
    for (const src of imageAlt.unused())
        logger.warn(`Image descriptions: ${src} isn't on any page.`);
    logger.info(`Image descriptions: ${list.length} in the list, applied on ${changed} page(s); ${images.length} image(s) on the site, ${missing} without alt text.`);
    return images;
}
function writeSeoReport(root, outDir, pages, siteUrl, logger, images) {
    const origin = new URL(siteUrl).origin;
    const pagePaths = new Set(pages.map((p) => p.path));
    // Every redirect source in the final _redirects, so a link that redirects counts as working.
    const rules = parseRedirectsFile(fs.readFileSync(path.join(outDir, '_redirects'), 'utf8'), '_redirects');
    const staticFrom = new Set(rules.filter((r) => !isDynamic(r.from)).map((r) => r.from));
    const dynamicFrom = rules.filter((r) => isDynamic(r.from)).map((r) => new RegExp(`^${r.from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:[a-z_]+/gi, '[^/]+')}$`));
    const resolves = (p) => pagePaths.has(p) ||
        staticFrom.has(p) ||
        dynamicFrom.some((re) => re.test(p)) ||
        (!p.endsWith('/') && fs.existsSync(path.join(outDir, p)) && fs.statSync(path.join(outDir, p)).isFile());
    // The CMS file a page is edited in: src/content/pages/<slug>.md, or a blog post (src/content/posts) at /<slug>/, whose
    // file name may differ from its address (front-matter slug).
    const pagesDir = path.join(root, 'src/content/pages');
    const postsDir = path.join(root, 'src/content/posts');
    const postFiles = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter((f) => f.endsWith('.md')) : [];
    // Designs (free-design pages): at their own address (front-matter slug, folders allowed) or /<file name>/.
    const designsDir = path.join(root, 'src/content/designs');
    const designFiles = fs.existsSync(designsDir) ? fs.readdirSync(designsDir).filter((f) => f.endsWith('.md')) : [];
    const designFor = (slug) => designFiles.find((f) => (scalar(fs.readFileSync(path.join(designsDir, f), 'utf8'), /^slug:[ \t]*(.+)$/m) || f.replace(/\.md$/, '')) === slug);
    const scalar = (text, pattern) => {
        const value = text.match(pattern)?.[1]?.trim() ?? '';
        return value.replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\\"/g, '"').trim();
    };
    const entryFor = (p) => {
        const slug = p === '/' ? 'index' : decodeURIComponent(p.replace(/^\/|\/$/g, ''));
        let collection;
        let file;
        if (fs.existsSync(path.join(pagesDir, `${slug}.md`))) {
            collection = 'pages';
            file = path.join(pagesDir, `${slug}.md`);
        }
        else if (designFor(slug)) {
            const name = designFor(slug);
            collection = 'designs';
            file = path.join(designsDir, name);
        }
        else {
            const name = postFiles.find((f) => {
                const own = scalar(fs.readFileSync(path.join(postsDir, f), 'utf8'), /^slug:[ \t]*(.+)$/m);
                return (own || f.replace(/\.md$/, '')) === slug;
            });
            if (!name)
                return undefined;
            collection = 'posts';
            file = path.join(postsDir, name);
        }
        const text = fs.readFileSync(file, 'utf8');
        // The focus keywords live only in the CMS file (SEO → Focus keyword, comma-separated, main one first).
        const seoBlock = text.match(/^seo:[ \t]*\r?\n((?:[ \t]+.*\r?\n?)*)/m)?.[1] ?? '';
        const keywords = scalar(seoBlock, /^[ \t]+focus_keyword:[ \t]*(.*)$/m)
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
        return {
            collection,
            entry: path.basename(file, '.md'),
            keywords: [...new Set(keywords)],
            ...(collection === 'posts' ? { excerpt: scalar(text, /^excerpt:[ \t]*(.*)$/m) } : {}),
            ...(/^draft:[ \t]*true\b/m.test(text) ? { draft: true } : {}),
        };
    };
    // Only real pages: the CMS (/admin/) has no canonical tag.
    const reports = pages
        .filter((p) => p.canonical)
        .map((p) => analyzePage(fs.readFileSync(path.join(outDir, p.path, 'index.html'), 'utf8'), p.path, { origin, resolves, entryFor }));
    const report = { site: origin, builtAt: new Date().toISOString(), pages: reports, images };
    fs.mkdirSync(path.join(outDir, 'admin'), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'admin/seo-report.json'), JSON.stringify(report));
    logger.info(`admin/seo-report.json: ${reports.length} page(s); the CMS's SEO page scores them.`);
}
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function writeSitemap(outDir, pages, siteUrl, logger) {
    const origin = new URL(siteUrl).origin;
    const listed = pages.filter((p) => {
        if (!p.canonical || /noindex/i.test(p.robots ?? ''))
            return false;
        const canonical = new URL(p.canonical);
        return canonical.origin === origin && canonical.pathname === p.path;
    });
    const urls = listed.map((p) => {
        const lastmod = p.modified ? `<lastmod>${escapeXml(p.modified)}</lastmod>` : '';
        return `\t<url><loc>${escapeXml(p.canonical)}</loc>${lastmod}</url>`;
    });
    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        '</urlset>',
        '',
    ].join('\n');
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
    // Pages without a canonical tag (e.g. the CMS at /admin/) are never listed, so they aren't counted as hidden.
    const hidden = pages.filter((p) => p.canonical).length - listed.length;
    logger.info(`sitemap.xml: ${listed.length} page(s) listed${hidden ? `, ${hidden} hidden from search engines` : ''}.`);
}
