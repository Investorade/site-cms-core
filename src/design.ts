/**
 * Designs: free-design pages, on every site (CMS → Designs, src/content/designs/*.md, cms/designs.yml). A page is a
 * list of sections; a section has a background, a width, spacing and 1 to 4 columns; each column holds blocks
 * (heading, text, image, gallery, buttons, card, list, features, stats, quote, accordion, video, map, form, divider,
 * spacer, custom code). The look comes from these settings and the site's own fonts and colours, not from section
 * types a developer made, so any layout can be built, and the site's header and footer can be switched off for a
 * stand-alone page (a PPC landing page).
 *
 * The site makes a collection with this schema and a route that renders it (components/design/DesignPage.astro):
 *
 *   // src/content.config.ts
 *   import { createDesignSchema } from '@investorade/site-cms-core/design';
 *   const designs = defineCollection({ loader: glob({ pattern: '**\/*.md', base: './src/content/designs' }), schema: createDesignSchema({ siteName }) });
 *
 * The build exports the schema to admin/content-rules.json, so the CMS's AI connector checks what it saves against it.
 */
import { z } from 'astro/zod';
import { group, image, seoGroup, seoTitle } from './schemas.ts';

export const DESIGNS_FOLDER = 'src/content/designs';

/** A design page's own address: lower case words with dashes, optionally in folders ("lp/botox-special"). */
export const DESIGN_ADDRESS = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

// ── Choices (the CMS's select fields use the same values: cms/designs.yml) ──

export const SPACES = ['none', 'small', 'medium', 'large', 'xlarge'] as const;
export const WIDTHS = ['narrow', 'normal', 'wide', 'full'] as const;
export const LAYOUTS = ['1', '1-1', '2-1', '1-2', '1-1-1', '1-1-1-1', '1-3', '3-1'] as const;
export const TONES = ['auto', 'dark', 'light'] as const;
export const ALIGNS = ['left', 'center', 'right'] as const;
export const VALIGNS = ['top', 'center', 'bottom', 'stretch'] as const;
export const TEXT_SIZES = ['small', 'medium', 'large'] as const;
export const HEADING_SIZES = ['small', 'medium', 'large', 'xlarge', 'huge'] as const;
export const RATIOS = ['auto', '1:1', '4:3', '3:2', '16:9', '21:9', '3:4', '2:3', '9:16'] as const;
export const BUTTON_STYLES = ['primary', 'secondary', 'outline', 'text'] as const;
export const FIELD_TYPES = ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'date', 'number'] as const;

const text = z.string().nullish().transform((v) => v ?? '');
const optionalImage = z.preprocess((v) => (v && typeof v === 'object' && !(v as { src?: unknown }).src ? undefined : v), image.optional());
const link = z.object({ label: z.string(), link: z.string() });

// ── Blocks ──

const block = <T extends string, S extends z.ZodRawShape>(type: T, shape: S) => z.object({ _type: z.literal(type), hidden: z.boolean().default(false), ...shape });

export const designBlock = z.discriminatedUnion('_type', [
	block('heading', {
		eyebrow: text,
		text: z.string(),
		level: z.enum(['h1', 'h2', 'h3', 'h4']).default('h2'),
		size: z.enum(HEADING_SIZES).default('large'),
		align: z.enum(ALIGNS).optional(),
		color: text,
	}),
	block('text', { text: z.string(), size: z.enum(TEXT_SIZES).default('medium'), align: z.enum(ALIGNS).optional() }),
	block('image', {
		image,
		ratio: z.enum(RATIOS).default('auto'),
		fit: z.enum(['cover', 'contain']).default('cover'),
		rounded: z.boolean().default(false),
		shadow: z.boolean().default(false),
		link: text,
		caption: text,
		max_width: z.number().int().min(40).max(3000).optional(),
	}),
	block('gallery', {
		images: z.array(image).default([]),
		columns: z.number().int().min(1).max(6).default(3),
		ratio: z.enum(RATIOS).default('1:1'),
		rounded: z.boolean().default(false),
	}),
	block('buttons', {
		items: z.array(link.extend({ style: z.enum(BUTTON_STYLES).default('primary'), new_tab: z.boolean().default(false) })).default([]),
		align: z.enum(ALIGNS).optional(),
		size: z.enum(TEXT_SIZES).default('medium'),
	}),
	block('card', {
		image: optionalImage,
		eyebrow: text,
		heading: text,
		text: text,
		button: z.preprocess((v) => (v && typeof v === 'object' && !(v as { label?: unknown }).label ? undefined : v), link.optional()),
		style: z.enum(['plain', 'border', 'shadow', 'filled']).default('border'),
		align: z.enum(ALIGNS).optional(),
	}),
	block('list', {
		items: z.array(z.object({ text: z.string(), icon: text })).default([]),
		marker: z.enum(['check', 'dot', 'number', 'none', 'icon']).default('check'),
		columns: z.number().int().min(1).max(3).default(1),
	}),
	block('features', {
		items: z.array(z.object({ icon: text, image: optionalImage, heading: z.string(), text: text, link: text })).default([]),
		columns: z.number().int().min(1).max(4).default(3),
		align: z.enum(ALIGNS).optional(),
		style: z.enum(['plain', 'card']).default('plain'),
	}),
	block('stats', {
		items: z.array(z.object({ value: z.string(), label: text })).default([]),
		columns: z.number().int().min(1).max(6).default(4),
		align: z.enum(ALIGNS).optional(),
	}),
	block('quote', { text: z.string(), author: text, role: text, image: optionalImage, style: z.enum(['plain', 'card', 'large']).default('plain') }),
	block('accordion', { items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]), open_first: z.boolean().default(false) }),
	block('video', { url: z.string(), ratio: z.enum(RATIOS).default('16:9'), caption: text }),
	block('map', { query: z.string(), height: z.number().int().min(150).max(1200).default(400), zoom: z.number().int().min(1).max(20).default(14) }),
	block('form', {
		form_id: z.string(),
		heading: text,
		text: text,
		fields: z
			.array(
				z.object({
					name: z.string().regex(/^[a-z][a-z0-9_]{0,40}$/, 'A form field name: lower case letters, digits and _ (e.g. "phone").'),
					label: z.string(),
					type: z.enum(FIELD_TYPES).default('text'),
					required: z.boolean().default(false),
					placeholder: text,
					options: z.array(z.string()).default([]),
					width: z.enum(['full', 'half']).default('full'),
				}),
			)
			.default([]),
		submit_label: z.string().default('Send'),
		success_message: z.string().default('Thank you! We’ll be in touch soon.'),
		redirect: text,
		button_style: z.enum(BUTTON_STYLES).default('primary'),
	}),
	block('divider', { style: z.enum(['line', 'dots', 'short']).default('line') }),
	block('spacer', { size: z.enum(SPACES).default('medium') }),
	block('html', { custom_html: text, custom_css: text }),
]);
export type DesignBlock = z.output<typeof designBlock>;

export const designColumn = z.object({
	blocks: z.preprocess((v) => v ?? [], z.array(designBlock)),
	align: z.enum(ALIGNS).optional(),
	background: text,
	padding: z.enum(SPACES).default('none'),
});

export const designSection = z.object({
	name: text,
	hidden: z.boolean().default(false),
	anchor: z
		.string()
		.regex(/^[a-z0-9-]*$/, 'An anchor: lower case letters, digits and dashes (the section is then at #anchor).')
		.nullish()
		.transform((v) => v ?? ''),
	layout: z.enum(LAYOUTS).default('1'),
	width: z.enum(WIDTHS).default('normal'),
	padding: z.enum(SPACES).default('large'),
	gap: z.enum(SPACES).default('medium'),
	valign: z.enum(VALIGNS).default('top'),
	align: z.enum(ALIGNS).default('left'),
	tone: z.enum(TONES).default('auto'),
	background: group({
		color: text,
		image: optionalImage,
		overlay: z.number().int().min(0).max(95).default(0),
	}),
	reverse_on_mobile: z.boolean().default(false),
	columns: z.preprocess((v) => v ?? [], z.array(designColumn)),
	custom_css: text,
});
export type DesignSection = z.output<typeof designSection>;

/** A design page (src/content/designs/<file>.md). */
export function createDesignSchema({ siteName }: { siteName: string }) {
	const title = seoTitle(siteName);
	return z
		.object({
			title: z.string(),
			draft: z.boolean().default(false),
			// The address. Empty: the file name (/<file>/).
			slug: z.string().regex(DESIGN_ADDRESS, 'An address: lower case words with dashes, optionally in folders (e.g. lp/botox-special).').optional(),
			header: z.boolean().default(true),
			footer: z.boolean().default(true),
			page: group({ background: text, text_color: text, custom_css: text }),
			seo: seoGroup,
			social: group({ og_title: z.string().optional(), og_type: z.string().default('website'), og_image: image.optional() }),
			advanced: group({
				canonical: z.string().optional(),
				hide_from_search: z.boolean().default(false),
				robots: z.string().default('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
				date_published: z.string().optional(),
				date_modified: z.string().optional(),
			}),
			sections: z.preprocess((v) => v ?? [], z.array(designSection)),
		})
		.transform(({ seo, social, advanced, ...page }) => ({
			...page,
			// Drafts are hidden from search engines like other drafts.
			seo: { ...seo, title: title(seo, page.title), ...social, ...advanced, hide_from_search: advanced.hide_from_search || page.draft },
		}));
}
export type DesignPageData = z.output<ReturnType<typeof createDesignSchema>>;

/** The URL path a design page is built at: its own address, or its file name ("lp/botox-special" → that). */
export const designPath = (id: string, data: { slug?: string }) => (data.slug?.trim() || id).replace(/^\/+|\/+$/g, '');

// ── Helpers for the components ──

/** A colour or gradient for a style attribute, or '' if it could do anything else (url(), ;, {}). */
export function safeColor(value: unknown): string {
	const v = typeof value === 'string' ? value.trim() : '';
	if (!v || v.length > 300 || /[;{}<>\\"]|url\s*\(|expression|javascript/i.test(v)) return '';
	return /^(#[0-9a-f]{3,8}|[a-z]+|var\(--[a-z0-9-]+\)|(rgb|rgba|hsl|hsla|oklch|color-mix|(repeating-)?(linear|radial|conic)-gradient)\(.*\))$/i.test(v) ? v : '';
}

/** A YouTube or Vimeo address as its embed address, or '' for anything else. */
export function videoEmbed(url: string): string {
	const u = (() => {
		try {
			return new URL(url.trim());
		} catch {
			return null;
		}
	})();
	if (!u || u.protocol !== 'https:') return '';
	const host = u.hostname.replace(/^www\.|^m\./, '');
	let id = '';
	if (host === 'youtu.be') id = u.pathname.slice(1);
	else if (host === 'youtube.com' || host === 'youtube-nocookie.com') id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? '';
	if (id && /^[A-Za-z0-9_-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
	if (host === 'vimeo.com' || host === 'player.vimeo.com') {
		const vimeo = u.pathname.match(/(\d{5,12})/)?.[1];
		if (vimeo) return `https://player.vimeo.com/video/${vimeo}`;
	}
	return '';
}
