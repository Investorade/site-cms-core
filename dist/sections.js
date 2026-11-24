/**
 * Shared page sections: section types any site can use instead of building its own. Each one has three parts, all in
 * the core, all with the same name:
 *
 * - its schema (here): what the section holds;
 * - its CMS fields: cms/sections/<name>.yml, used in the site's cms/sections.yml as `- !section <name>`;
 * - its look: components/sections/<Name>.astro, drawn by components/Sections.astro.
 *
 * A site picks the ones it wants and mixes them with its own section types:
 *
 *   import { coreSections } from '@investorade/site-cms-core/sections';
 *   const contentBlock = z.discriminatedUnion('_type', [coreSections.hero, coreSections.faq, myOwnBlock, blogListBlock]);
 *
 * The design stays the site's: the sections read the site's colour and size tokens (CSS variables, see the README,
 * "Shared sections"), their styles are in a CSS layer so any rule in the site's own CSS wins, and a site can draw any
 * section with its own component instead (Sections.astro → `components`). Fixes and new options reach every site that
 * uses a section through a core update.
 */
import { z } from 'astro/zod';
import { button, image } from "./schemas.js";
// Every section can be hidden in the CMS ("Hide this section") without deleting it.
const hidden = z.boolean().default(false);
/** The top of a page: the page's main heading (H1), a short text, a button and an optional background photo. */
export const heroSection = z.object({
    _type: z.literal('hero'),
    hidden,
    heading: z.string(),
    text: z.string().default(''),
    button: button.optional(),
    image: image.optional(),
    align: z.enum(['left', 'center']).default('left'),
});
/** A heading and Markdown text, in a narrow column. */
export const textSection = z.object({
    _type: z.literal('text'),
    hidden,
    heading: z.string().default(''),
    body: z.string().default(''),
});
/** An image beside a heading, Markdown text and a button. */
export const imageTextSection = z.object({
    _type: z.literal('image_text'),
    hidden,
    heading: z.string().default(''),
    body: z.string().default(''),
    image,
    image_position: z.enum(['left', 'right']).default('left'),
    button: button.optional(),
});
/** Questions and answers that open one by one; also FAQ data for Google. */
export const faqSection = z.object({
    _type: z.literal('faq'),
    hidden,
    heading: z.string().default('Frequently asked questions'),
    items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});
/** A coloured band with a heading, text and a button. */
export const ctaSection = z.object({
    _type: z.literal('cta'),
    hidden,
    heading: z.string(),
    text: z.string().default(''),
    button: button.optional(),
    style: z.enum(['brand', 'soft']).default('brand'),
});
/** The phone, email and address from Site settings → Site info, with a heading and text. */
export const contactSection = z.object({
    _type: z.literal('contact'),
    hidden,
    heading: z.string().default('Contact us'),
    text: z.string().default(''),
});
/** A grid of cards: each with an optional image, a heading, text and an optional link. */
export const cardsSection = z.object({
    _type: z.literal('cards'),
    hidden,
    heading: z.string().default(''),
    intro: z.string().default(''),
    columns: z.coerce.number().int().min(2).max(4).default(3),
    cards: z
        .array(z.object({
        image: image.optional(),
        heading: z.string(),
        text: z.string().default(''),
        link: button.optional(),
    }))
        .default([]),
});
/** A grid of photos. */
export const gallerySection = z.object({
    _type: z.literal('gallery'),
    hidden,
    heading: z.string().default(''),
    intro: z.string().default(''),
    columns: z.coerce.number().int().min(2).max(4).default(3),
    images: z.array(image).default([]),
});
/** Every shared section type, by name (the `_type` value, the CMS file name and the component). */
export const coreSections = {
    hero: heroSection,
    text: textSection,
    image_text: imageTextSection,
    faq: faqSection,
    cta: ctaSection,
    contact: contactSection,
    cards: cardsSection,
    gallery: gallerySection,
};
export const coreSectionNames = Object.keys(coreSections);
