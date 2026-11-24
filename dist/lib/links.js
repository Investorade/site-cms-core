import site from '@site/data/site.json';
// The site's pop-ups (src/data/popups.json), or none: a site without pop-ups has no such file.
import popups from 'virtual:site-cms-core/popups';
const popupIds = new Set(Object.values(popups)
    .map((p) => (p && typeof p === 'object' ? p.id : undefined))
    .filter((id) => typeof id === 'string' && !!id));
/**
 * Attributes for a CMS-entered link.
 * - "#book-now" (any popup id) opens that popup.
 * - Off-site http(s) links open in a new tab, as on the WordPress site.
 */
export function linkAttrs(link) {
    if (link.startsWith('#') && popupIds.has(link.slice(1))) {
        return { href: link, 'data-popup-open': link.slice(1), 'aria-haspopup': 'dialog' };
    }
    if (/^https?:\/\//.test(link) && !link.startsWith(site.url)) {
        return { href: link, target: '_blank', rel: 'noopener noreferrer nofollow' };
    }
    return { href: link };
}
/** Absolute URL on the production domain, for SEO tags and structured data. */
export function absoluteUrl(path) {
    return new URL(path, site.url).href;
}
