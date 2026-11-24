/**
 * What the build tells the CMS about each built page, written to dist/admin/seo-report.json. The CMS's SEO page and
 * the editor's SEO panel (shared from cms.dadscampgrounds.com/kit/) read it:
 * - `seo`: the page as an SEO checker sees it (title, description, address, focus keywords and the HTML of the page's
 *   own content). The kit scores it the way Rank Math does (kit/seo-rules.js), so every park gets the same rules.
 * - `technical`: checks only the build can make (one H1, canonical, visible to search, share image, image alt text,
 *   broken links).
 *
 * The page's own content is what Rank Math would analyse on WordPress: the post or page content, not the header, footer
 * or site-wide parts. Elements marked `data-seo-content` are that content (a blog post's text); otherwise it's <main>
 * without the elements marked `data-seo-skip` (the "Plan your stay" banner). `data-seo-toc` marks a table of contents
 * and `data-seo-thumbnail` a post's featured image.
 */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
export function decodeEntities(text) {
    return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (whole, code) => {
        if (code[0] === '#') {
            const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
            return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
        }
        return ENTITIES[code.toLowerCase()] ?? whole;
    });
}
export const attr = (tag, name) => {
    const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
    return match ? decodeEntities(match[2] ?? match[3] ?? match[4] ?? '') : undefined;
};
const metaContent = (html, key, value) => {
    for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
        if (attr(tag, key)?.toLowerCase() === value)
            return attr(tag, 'content');
    }
    return undefined;
};
const stripTags = (html) => decodeEntities(html
    .replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
/** Every element whose opening tag has `attribute` (outermost only), counting nested tags of the same name. */
function elementRanges(html, attribute) {
    const ranges = [];
    const open = new RegExp(`<([a-z][a-z0-9-]*)\\b[^>]*\\s${attribute}(?=[\\s=>/])[^>]*>`, 'gi');
    let m;
    while ((m = open.exec(html))) {
        const tags = new RegExp(`<(/?)${m[1]}\\b[^>]*>`, 'gi');
        const innerStart = m.index + m[0].length;
        tags.lastIndex = innerStart;
        let depth = 1;
        let range = { start: m.index, end: html.length, innerStart, innerEnd: html.length };
        let t;
        while ((t = tags.exec(html))) {
            if (t[1])
                depth--;
            else if (!t[0].endsWith('/>'))
                depth++;
            if (depth === 0) {
                range = { start: m.index, end: t.index + t[0].length, innerStart, innerEnd: t.index };
                break;
            }
        }
        ranges.push(range);
        open.lastIndex = range.end;
    }
    return ranges;
}
function removeElements(html, attribute) {
    let out = html;
    for (const { start, end } of elementRanges(html, attribute).reverse())
        out = out.slice(0, start) + out.slice(end);
    return out;
}
const BLOCK = 'address|article|aside|blockquote|details|div|dl|dd|dt|figcaption|figure|footer|form|h[1-6]|header|hr|li|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul';
/**
 * The HTML of the page's own content, shaped like WordPress post content: no scripts, styles, icons or dialogs, a line
 * break between blocks (as the WordPress editor saves them) and plain characters instead of entities.
 */
export function ownContent(html) {
    const marked = elementRanges(html, 'data-seo-content');
    let content;
    if (marked.length)
        content = marked.map((r) => html.slice(r.innerStart, r.innerEnd)).join('\n');
    else {
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
        content = removeElements(main, 'data-seo-skip');
    }
    return content
        .replace(/<(script|style|svg|noscript|template|dialog)\b[\s\S]*?<\/\1>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        // Only the attributes SEO checks read: link addresses and rel, image and video sources, alt text.
        .replace(/<([a-z][a-z0-9-]*)(\s[^>]*?)?(\/?)>/gi, (_, name, attrs = '', slash) => {
        const kept = (attrs.match(/\s(?:href|src|alt|rel)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi) ?? []).join('');
        return `<${name}${kept}${slash}>`;
    })
        .replace(new RegExp(`(<(?:${BLOCK})\\b[^>]*>)`, 'gi'), '\n$1')
        .replace(new RegExp(`(</(?:${BLOCK})>)`, 'gi'), '$1\n')
        .replace(/&(?!(?:lt|gt|amp);)(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (whole) => decodeEntities(whole))
        .replace(/[ \t]*\n\s*/g, '\n')
        .trim();
}
const kindOf = (pagePath, entry) => pagePath === '/' ? 'home' : /^\/blog\/(page\/\d+\/)?$/.test(pagePath) ? 'blog' : entry?.collection === 'posts' ? 'post' : 'page';
export function analyzePage(html, pagePath, ctx) {
    const url = `${ctx.origin}${pagePath}`;
    const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
    const description = (metaContent(html, 'name', 'description') ?? '').trim();
    const robots = metaContent(html, 'name', 'robots') ?? '';
    const indexable = !/noindex/i.test(robots);
    const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? []).find((tag) => attr(tag, 'rel')?.toLowerCase() === 'canonical');
    const canonical = canonicalTag ? attr(canonicalTag, 'href') : undefined;
    const ogImage = metaContent(html, 'property', 'og:image');
    const modified = metaContent(html, 'property', 'article:modified_time');
    const h1s = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) ?? []).map((h) => stripTags(h));
    // Decorative images (role="presentation", e.g. marked Decorative on the CMS's Images page) need no alt text.
    const images = (html.match(/<img\b[^>]*>/gi) ?? []).filter((img) => !/^(presentation|none)$/i.test(attr(img, 'role') ?? '') && attr(img, 'aria-hidden') !== 'true');
    const missingAlt = images.filter((img) => !(attr(img, 'alt') ?? '').trim());
    const brokenLinks = new Set();
    for (const tag of html.match(/<a\b[^>]*>/gi) ?? []) {
        const href = attr(tag, 'href');
        if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href))
            continue;
        let target;
        try {
            target = new URL(href, url);
        }
        catch {
            brokenLinks.add(href);
            continue;
        }
        if (target.origin !== ctx.origin)
            continue;
        if (!ctx.resolves(decodeURIComponent(target.pathname)))
            brokenLinks.add(target.pathname);
    }
    const technical = [];
    const add = (check) => technical.push(check);
    add(h1s.length === 1
        ? { id: 'h1', label: 'One main heading (H1)', status: 'pass', detail: h1s[0] || '(empty)' }
        : h1s.length === 0
            ? { id: 'h1', label: 'One main heading (H1)', status: 'fail', detail: 'None', fix: 'Give the page one main heading.' }
            : { id: 'h1', label: 'One main heading (H1)', status: 'warn', detail: `${h1s.length} H1 headings`, fix: 'Use exactly one H1; make the others H2.', items: h1s });
    add({
        id: 'alt',
        label: 'Image alt text',
        status: missingAlt.length === 0 ? 'pass' : missingAlt.length === images.length ? 'fail' : 'warn',
        detail: images.length ? `${images.length - missingAlt.length} of ${images.length} images have alt text` : 'No images',
        fix: missingAlt.length
            ? 'Describe each image in its Alt text field, or once for every page on the Images page (top bar), which lists them. Mark purely decorative images as Decorative there.'
            : undefined,
        items: missingAlt.length ? missingAlt.map((img) => attr(img, 'src') ?? '(no src)').filter((src, i, all) => all.indexOf(src) === i) : undefined,
    });
    add(!canonical
        ? { id: 'canonical', label: 'Canonical URL', status: 'fail', detail: 'Missing', fix: 'Pages should have a canonical URL (normally their own address).' }
        : canonical === url
            ? { id: 'canonical', label: 'Canonical URL', status: 'pass', detail: 'Points to this page' }
            : { id: 'canonical', label: 'Canonical URL', status: 'warn', detail: `Points to ${canonical}`, fix: 'Only point elsewhere on purpose (duplicate content). Leave Canonical URL empty to use this page.' });
    add(indexable
        ? { id: 'indexable', label: 'Visible to search engines', status: 'pass', detail: 'Yes' }
        : { id: 'indexable', label: 'Visible to search engines', status: 'warn', detail: 'Hidden (noindex)', fix: 'If it should appear in Google, turn on Search engine visibility (SEO → Advanced).' });
    add(ogImage
        ? { id: 'og_image', label: 'Social share image', status: 'pass', detail: 'Set' }
        : { id: 'og_image', label: 'Social share image', status: 'warn', detail: 'Missing', fix: 'Add a social share image (SEO → Social).' });
    const broken = [...brokenLinks].sort();
    add(broken.length === 0
        ? { id: 'links', label: 'Links to this site work', status: 'pass', detail: 'All lead to a page' }
        : {
            id: 'links',
            label: 'Links to this site work',
            status: 'warn',
            detail: `${broken.length} lead nowhere on this site`,
            fix: 'Create these pages, or add redirects for them (Site settings → Redirects).',
            items: broken,
        });
    const entry = ctx.entryFor(pagePath);
    const kind = kindOf(pagePath, entry);
    const thumbTag = (html.match(/<img\b[^>]*\sdata-seo-thumbnail\b[^>]*>/i) ?? [])[0];
    const seo = {
        kind,
        url: canonical || url,
        title,
        description,
        keywords: entry?.keywords ?? [],
        content: ownContent(html),
        hasToc: /\sdata-seo-toc\b/i.test(html),
        ...(thumbTag ? { thumbnail: { src: attr(thumbTag, 'src') ?? '', alt: attr(thumbTag, 'alt') ?? '' } } : {}),
        ...(kind === 'post' ? { excerpt: entry?.excerpt ?? '' } : {}),
    };
    return {
        path: pagePath,
        url,
        collection: entry?.collection,
        entry: entry?.entry,
        title,
        description,
        thumbnail: ogImage,
        indexable,
        ...(entry?.draft ? { draft: true } : {}),
        modified,
        seo,
        technical,
    };
}
