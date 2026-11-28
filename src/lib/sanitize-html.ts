import { cleanStyleAttribute } from './design-css.ts';

/**
 * Cleans HTML from page text before it goes on the page. CMS text is Markdown, and Markdown lets raw HTML through, so
 * a pasted or AI-written <script>, <iframe> or onclick="…" would otherwise run on the park's site, the same address
 * the CMS runs on. Only formatting is kept: an allow-list of tags and attributes, and links and images only to http(s),
 * mailto:, tel:, the site's own paths and #anchors.
 *
 * The same rules run in the CMS's AI connector before it saves (dadscampgrounds-cms-auth, src/sanitize.ts).
 */

/** Removed with everything inside them. */
const DROP_WITH_CONTENT = ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'template', 'noscript', 'textarea', 'select', 'svg', 'math', 'title', 'head', 'xmp', 'noembed', 'noframes', 'plaintext'];

/** Kept, with only the attributes listed. Any other tag is removed but its text stays. */
const ALLOWED: Record<string, string[]> = {
	a: ['href', 'title', 'target', 'rel'],
	abbr: ['title'],
	b: [],
	blockquote: [],
	br: [],
	caption: [],
	code: [],
	dd: [],
	del: [],
	details: ['open'],
	div: [],
	dl: [],
	dt: [],
	em: [],
	figcaption: [],
	figure: [],
	h1: ['id'],
	h2: ['id'],
	h3: ['id'],
	h4: ['id'],
	h5: ['id'],
	h6: ['id'],
	hr: [],
	i: [],
	img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
	ins: [],
	kbd: [],
	li: [],
	mark: [],
	ol: ['start'],
	p: [],
	pre: [],
	q: [],
	s: [],
	small: [],
	span: [],
	strong: [],
	sub: [],
	summary: [],
	sup: [],
	table: [],
	tbody: [],
	td: ['colspan', 'rowspan'],
	tfoot: [],
	th: ['colspan', 'rowspan', 'scope'],
	thead: [],
	tr: [],
	u: [],
	ul: [],
};

/**
 * Free-design pages' "Custom code" blocks (sanitizeDesignHtml): the formatting tags above plus layout tags, and on every
 * tag class, id, style (cleaned like the page's CSS: lib/design-css.ts), title, role, lang, dir, aria-* and data-*.
 * Still no scripts, frames, forms, event handlers or unsafe links.
 */
const DESIGN_ALLOWED: Record<string, string[]> = {
	...ALLOWED,
	address: [],
	article: [],
	aside: [],
	button: ['type'],
	cite: [],
	footer: [],
	header: [],
	hgroup: [],
	label: [],
	nav: [],
	picture: [],
	section: [],
	source: ['srcset', 'media', 'type', 'sizes'],
	time: ['datetime'],
	video: ['src', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'playsinline', 'preload', 'width', 'height'],
	img: [...ALLOWED.img, 'srcset', 'sizes', 'decoding'],
};
const DESIGN_GLOBAL = ['class', 'id', 'style', 'title', 'role', 'lang', 'dir'];

const URL_ATTRIBUTES = new Set(['href', 'src', 'poster']);

/** http(s), mailto:, tel:, a path on the site (/…, ./…, ../…), a #anchor or ?query; nothing else (javascript:, data:…). */
export function isSafeUrl(value: string): boolean {
	// Browsers ignore control characters and whitespace inside a scheme ("java\tscript:"), so they're removed first.
	const url = value.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
	if (!url) return true;
	if (/^(https?:|mailto:|tel:)/.test(url)) return true;
	// No scheme at all: a relative address. A colon before any / ? # would be a scheme.
	return !/^[^/?#]*:/.test(url);
}

const decodeEntities = (text: string) =>
	text
		.replace(/&#x([0-9a-f]+);?/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);?/g, (_, d: string) => String.fromCodePoint(Number(d)))
		.replace(/&(colon|tab|newline|amp|lt|gt|quot|apos);/gi, (_, n: string) => ({ colon: ':', tab: '\t', newline: '\n', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[n.toLowerCase()] ?? '');

const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function cleanAttributes(tag: string, raw: string, design = false): string {
	const allowed = (design ? DESIGN_ALLOWED : ALLOWED)[tag];
	let out = '';
	const pattern = /([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
	let m: RegExpExecArray | null;
	while ((m = pattern.exec(raw))) {
		const name = m[1].toLowerCase();
		const global = design && (DESIGN_GLOBAL.includes(name) || /^(aria|data)-[a-z0-9-]+$/.test(name));
		if (!allowed.includes(name) && !global) continue;
		let value = m[3] ?? m[4] ?? m[5] ?? '';
		if (URL_ATTRIBUTES.has(name) && !isSafeUrl(decodeEntities(value))) continue;
		if (name === 'srcset' && !decodeEntities(value).split(',').every((part) => isSafeUrl(part.trim().split(/\s+/)[0] ?? ''))) continue;
		if (name === 'style') {
			value = cleanStyleAttribute(decodeEntities(value));
			if (!value) continue;
		}
		if (name === 'target' && !/^_(blank|self)$/i.test(value)) continue;
		out += m[2] === undefined ? ` ${name}` : ` ${name}="${escapeAttribute(decodeEntities(value))}"`;
	}
	// A link opening a new tab can't reach back into this page.
	if (tag === 'a' && /\starget="_blank"/i.test(out) && !/\srel=/.test(out)) out += ' rel="noopener"';
	return out;
}

/** A free-design page's custom HTML: the design allow-list (layout tags, class and style), still nothing that runs. */
export const sanitizeDesignHtml = (html: string): string => sanitizeHtml(html, true);

export function sanitizeHtml(html: string, design = false): string {
	let out = String(html ?? '');
	// Comments and processing instructions can hide markup.
	out = out.replace(/<!--[\s\S]*?(-->|$)/g, '').replace(/<![\s\S]*?(>|$)/g, '').replace(/<\?[\s\S]*?(>|$)/g, '');
	for (const tag of DROP_WITH_CONTENT) {
		out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*?(<\\/${tag}\\s*>|$)`, 'gi'), '');
		out = out.replace(new RegExp(`<\\/${tag}\\s*>`, 'gi'), '');
	}
	// The result is rebuilt, never passed through: every well-formed tag is re-written from its parsed name and allowed
	// attributes (or dropped), and in the text between them every "<" a browser could read as a tag start is escaped.
	// So nothing malformed ("<img src=x onerror=… \">", an unclosed quote…) can reach the browser as a tag.
	let result = '';
	let last = 0;
	for (const m of out.matchAll(TAG)) {
		result += escapeTagStarts(out.slice(last, m.index));
		last = m.index! + m[0].length;
		const tag = m[2].toLowerCase();
		if (!(tag in (design ? DESIGN_ALLOWED : ALLOWED))) continue;
		result += m[1] ? `</${tag}>` : `<${tag}${cleanAttributes(tag, m[3], design)}${m[4] ? ' /' : ''}>`;
	}
	return result + escapeTagStarts(out.slice(last));
}

/** A whole, well-formed tag: its name, attributes (a name, or name=value quoted or bare, each after whitespace), > or />. */
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>/=`]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;

/** In text: a "<" a browser would read as the start of a tag (a letter, "/", "!" or "?" after it) becomes &lt;. */
const escapeTagStarts = (text: string) => text.replace(/<(?=[a-zA-Z!/?])/g, '&lt;');
