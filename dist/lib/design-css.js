/**
 * CSS written for a free-design page (Designs → page, section or "Custom code" block, cms/designs.yml): cleaned so it
 * can only style, and scoped so it only styles its own part of the page.
 *
 * Cleaning (cleanCss), whatever wrote it (an editor in the CMS or the AI builder):
 * - no way out of the <style> tag: "<" is removed;
 * - no loading of other style sheets or old browser hooks: @import, @charset, @namespace, expression(), behavior,
 *   -moz-binding, javascript: are removed;
 * - url(…) only to https, a path on the site or a #anchor (no data:, no http:);
 * - CSS escapes (\…) are removed, so none of the above can be spelled another way.
 *
 * Scoping (scopeCss): the CSS is nested inside the part's own selector (CSS nesting, in every current browser), so
 * `h2 { … }` in a section's CSS is `.dz-s-3 h2`; declarations at the top level style the part itself. @keyframes and
 * @font-face can't be nested, so they're kept at the top level.
 *
 * The same rules run in the CMS's AI connector before it saves (dadscampgrounds-cms-auth, src/design-css.ts). Keep the
 * two the same.
 */
/** At most this many characters of CSS per page, section or block. */
export const MAX_CSS = 40_000;
const SAFE_URL = /^(https:\/\/|\/(?!\/)|\.{0,2}\/|#)/i;
/** The CSS with everything that isn't plain styling removed. `removed` collects what was taken out (for the AI). */
export function cleanCss(input, removed = []) {
    let css = typeof input === 'string' ? input : '';
    if (!css.trim())
        return '';
    if (css.length > MAX_CSS) {
        css = css.slice(0, MAX_CSS);
        removed.push(`CSS cut to ${MAX_CSS} characters`);
    }
    const before = css;
    css = css
        // Comments can hide anything; escapes can spell anything.
        .replace(/\/\*[\s\S]*?(\*\/|$)/g, '')
        .replace(/\\/g, '')
        // "<" never appears in real CSS; without it, "</style>" can't end the tag. (">" is a CSS selector and stays.)
        .replace(/</g, '')
        .replace(/@(import|charset|namespace)\b[^;{}]*(;|$)/gi, '')
        .replace(/expression\s*\(/gi, 'x(')
        .replace(/(behavior|-moz-binding)\s*:[^;{}]*/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (whole, _q, url) => (SAFE_URL.test(url.trim()) ? `url("${url.trim().replace(/"/g, '')}")` : 'none'));
    if (css !== before.replace(/\/\*[\s\S]*?(\*\/|$)/g, ''))
        removed.push('CSS that could load or run something (imports, scripts, unsafe url(), escapes) was removed');
    return css.trim();
}
/** Splits CSS into its top-level parts: rules with their block, and loose declarations. */
function topLevel(css) {
    const out = [];
    let depth = 0;
    let start = 0;
    let open = -1;
    for (let i = 0; i < css.length; i++) {
        const c = css[i];
        if (c === '{') {
            if (depth === 0)
                open = i;
            depth++;
        }
        else if (c === '}') {
            depth--;
            if (depth === 0) {
                out.push({ head: css.slice(start, open).trim(), body: css.slice(open + 1, i) });
                start = i + 1;
            }
            else if (depth < 0) {
                // An extra "}": dropped, so the nesting below can't be closed early.
                depth = 0;
                start = i + 1;
            }
        }
        else if (c === ';' && depth === 0) {
            out.push({ head: css.slice(start, i + 1).trim() });
            start = i + 1;
        }
    }
    const rest = css.slice(start).trim();
    if (rest && depth === 0)
        out.push({ head: rest });
    return out;
}
/**
 * Cleaned CSS that only applies inside `scope` (a class selector, e.g. ".dz-s-3"). Top-level declarations style the
 * scope element itself; rules and @media/@supports/@container blocks are nested inside it.
 */
export function scopeCss(input, scope) {
    const css = cleanCss(input);
    if (!css)
        return '';
    const outside = [];
    const inside = [];
    for (const part of topLevel(css)) {
        if (part.body === undefined) {
            if (part.head)
                inside.push(part.head.endsWith(';') ? part.head : `${part.head};`);
            continue;
        }
        if (/^@(-webkit-)?keyframes\b|^@font-face\b/i.test(part.head))
            outside.push(`${part.head}{${part.body}}`);
        else if (part.head)
            inside.push(`${part.head}{${part.body}}`);
    }
    return [...outside, inside.length ? `${scope}{${inside.join('')}}` : ''].filter(Boolean).join('\n');
}
/** A style="" value: declarations only, cleaned (no blocks, no "}" to break out of the attribute's rule). */
export function cleanStyleAttribute(input) {
    return cleanCss(input).replace(/[{}]/g, '').replace(/"/g, "'").trim();
}
