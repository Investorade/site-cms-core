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
export declare const MAX_CSS = 40000;
/** The CSS with everything that isn't plain styling removed. `removed` collects what was taken out (for the AI). */
export declare function cleanCss(input: unknown, removed?: string[]): string;
/**
 * Cleaned CSS that only applies inside `scope` (a class selector, e.g. ".dz-s-3"). Top-level declarations style the
 * scope element itself; rules and @media/@supports/@container blocks are nested inside it.
 */
export declare function scopeCss(input: unknown, scope: string): string;
/** A style="" value: declarations only, cleaned (no blocks, no "}" to break out of the attribute's rule). */
export declare function cleanStyleAttribute(input: string): string;
