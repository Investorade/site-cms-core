/**
 * Cleans HTML from page text before it goes on the page. CMS text is Markdown, and Markdown lets raw HTML through, so
 * a pasted or AI-written <script>, <iframe> or onclick="…" would otherwise run on the park's site, the same address
 * the CMS runs on. Only formatting is kept: an allow-list of tags and attributes, and links and images only to http(s),
 * mailto:, tel:, the site's own paths and #anchors.
 *
 * The same rules run in the CMS's AI connector before it saves (dadscampgrounds-cms-auth, src/sanitize.ts).
 */
/** http(s), mailto:, tel:, a path on the site (/…, ./…, ../…), a #anchor or ?query; nothing else (javascript:, data:…). */
export declare function isSafeUrl(value: string): boolean;
export declare function sanitizeHtml(html: string): string;
