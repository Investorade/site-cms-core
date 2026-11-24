import { attr } from "./seo-report.js";
const RANK = { missing: 0, list: 1, field: 2, decorative: 3 };
const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** The image's path on this site (no query or #hash, decoded), or the full URL for another site's image. */
export function imageKey(src, origin) {
    try {
        const url = new URL(src.trim(), origin + '/');
        if (url.origin !== origin)
            return url.origin + url.pathname;
        return decodeURI(url.pathname);
    }
    catch {
        return src.trim();
    }
}
/** Sets (or replaces) one attribute of an `<img …>` tag. */
function setAttr(tag, name, value) {
    const re = new RegExp(`(\\s)${name}(\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+))?(?=[\\s/>])`, 'i');
    const html = `${name}="${escapeAttr(value)}"`;
    if (re.test(tag))
        return tag.replace(re, (_m, space) => `${space}${html}`);
    return tag.replace(/\s*(\/?)>$/, (_m, slash) => ` ${html}${slash ? ' /' : ''}>`);
}
export class ImageAlt {
    origin;
    byKey = new Map();
    uses = new Map();
    /** List entries that didn't apply to any image in the build (e.g. the image was removed from the site). */
    problems = [];
    constructor(origin, list) {
        this.origin = origin;
        list.forEach((entry, i) => {
            if (!entry?.src?.trim()) {
                this.problems.push(`Image descriptions, row ${i + 1}: no image chosen.`);
                return;
            }
            this.byKey.set(imageKey(entry.src, origin), entry);
        });
    }
    /** Applies the list to one built page and records its images. Returns the new HTML. */
    apply(html, pagePath) {
        return html.replace(/<img\b[^>]*>/gi, (tag) => {
            const src = attr(tag, 'src');
            if (!src || src.startsWith('data:'))
                return tag;
            const key = imageKey(src, this.origin);
            const own = (attr(tag, 'alt') ?? '').trim();
            const entry = this.byKey.get(key);
            let source;
            let alt = own;
            let out = tag;
            if (own)
                source = 'field';
            else if (entry?.decorative) {
                source = 'decorative';
                out = setAttr(setAttr(out, 'alt', ''), 'role', 'presentation');
            }
            else if (entry?.alt?.trim()) {
                source = 'list';
                alt = entry.alt.trim();
                out = setAttr(out, 'alt', alt);
            }
            else
                source = 'missing';
            this.record(key, alt, source, pagePath, tag);
            return out;
        });
    }
    record(key, alt, source, pagePath, tag) {
        const use = this.uses.get(key);
        if (!use) {
            const width = Number(attr(tag, 'width')) || undefined;
            const height = Number(attr(tag, 'height')) || undefined;
            this.uses.set(key, { src: key, alt, source, pages: [pagePath], width, height });
            return;
        }
        if (!use.pages.includes(pagePath))
            use.pages.push(pagePath);
        if (RANK[source] < RANK[use.source]) {
            use.source = source;
            use.alt = alt;
        }
    }
    /** Every image in the build, those still missing a description first. */
    images() {
        return [...this.uses.values()].sort((a, b) => RANK[a.source] - RANK[b.source] || a.src.localeCompare(b.src));
    }
    /** List entries whose image isn't on any built page. */
    unused() {
        return [...this.byKey.keys()].filter((key) => !this.uses.has(key));
    }
}
