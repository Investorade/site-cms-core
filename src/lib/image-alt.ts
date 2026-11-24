import { attr } from './seo-report.ts';

/**
 * Image descriptions (written on the CMS's Images page, saved to src/data/image-alt.json): alt text written once per image
 * and used wherever that image appears without its own.
 *
 * Applied to the built HTML (src/integrations/seo-files.ts), so it works for any section of any park, including images
 * whose section has no Alt text field (logos, popup images):
 * - an image with its own alt text keeps it;
 * - otherwise it gets the description from the list;
 * - an image marked Decorative gets alt="" and role="presentation" (screen readers skip it, and the SEO checks don't
 *   count it as missing).
 *
 * Every image found is also listed (with the pages it's on and where its alt text comes from) for the CMS Images page.
 */

export interface ImageDescription {
	src?: string;
	alt?: string;
	decorative?: boolean;
}

export type AltSource = 'field' | 'list' | 'decorative' | 'missing';

export interface ImageUse {
	/** The image's path on the site, e.g. /uploads/2023/07/photo.jpg (or a full URL for another site's image). */
	src: string;
	/** The alt text visitors get, after the list is applied ("" when decorative or missing). */
	alt: string;
	/** Where the alt text comes from. With different answers on different pages, the worst one ("missing" first). */
	source: AltSource;
	/** Pages the image is on, e.g. ["/", "/pricing/"]. */
	pages: string[];
	width?: number;
	height?: number;
}

const RANK: Record<AltSource, number> = { missing: 0, list: 1, field: 2, decorative: 3 };

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The image's path on this site (no query or #hash, decoded), or the full URL for another site's image. */
export function imageKey(src: string, origin: string): string {
	try {
		const url = new URL(src.trim(), origin + '/');
		if (url.origin !== origin) return url.origin + url.pathname;
		return decodeURI(url.pathname);
	} catch {
		return src.trim();
	}
}

/** Sets (or replaces) one attribute of an `<img …>` tag. */
function setAttr(tag: string, name: string, value: string): string {
	const re = new RegExp(`(\\s)${name}(\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+))?(?=[\\s/>])`, 'i');
	const html = `${name}="${escapeAttr(value)}"`;
	if (re.test(tag)) return tag.replace(re, (_m, space) => `${space}${html}`);
	return tag.replace(/\s*(\/?)>$/, (_m, slash) => ` ${html}${slash ? ' /' : ''}>`);
}

export class ImageAlt {
	private readonly byKey = new Map<string, ImageDescription>();
	private readonly uses = new Map<string, ImageUse>();
	/** List entries that didn't apply to any image in the build (e.g. the image was removed from the site). */
	readonly problems: string[] = [];

	constructor(
		private readonly origin: string,
		list: ImageDescription[],
	) {
		list.forEach((entry, i) => {
			if (!entry?.src?.trim()) {
				this.problems.push(`Image descriptions, row ${i + 1}: no image chosen.`);
				return;
			}
			this.byKey.set(imageKey(entry.src, origin), entry);
		});
	}

	/** Applies the list to one built page and records its images. Returns the new HTML. */
	apply(html: string, pagePath: string): string {
		return html.replace(/<img\b[^>]*>/gi, (tag) => {
			const src = attr(tag, 'src');
			if (!src || src.startsWith('data:')) return tag;
			const key = imageKey(src, this.origin);
			const own = (attr(tag, 'alt') ?? '').trim();
			const entry = this.byKey.get(key);
			let source: AltSource;
			let alt = own;
			let out = tag;
			if (own) source = 'field';
			else if (entry?.decorative) {
				source = 'decorative';
				out = setAttr(setAttr(out, 'alt', ''), 'role', 'presentation');
			} else if (entry?.alt?.trim()) {
				source = 'list';
				alt = entry.alt.trim();
				out = setAttr(out, 'alt', alt);
			} else source = 'missing';
			this.record(key, alt, source, pagePath, tag);
			return out;
		});
	}

	private record(key: string, alt: string, source: AltSource, pagePath: string, tag: string) {
		const use = this.uses.get(key);
		if (!use) {
			const width = Number(attr(tag, 'width')) || undefined;
			const height = Number(attr(tag, 'height')) || undefined;
			this.uses.set(key, { src: key, alt, source, pages: [pagePath], width, height });
			return;
		}
		if (!use.pages.includes(pagePath)) use.pages.push(pagePath);
		if (RANK[source] < RANK[use.source]) {
			use.source = source;
			use.alt = alt;
		}
	}

	/** Every image in the build, those still missing a description first. */
	images(): ImageUse[] {
		return [...this.uses.values()].sort((a, b) => RANK[a.source] - RANK[b.source] || a.src.localeCompare(b.src));
	}

	/** List entries whose image isn't on any built page. */
	unused(): string[] {
		return [...this.byKey.keys()].filter((key) => !this.uses.has(key));
	}
}
