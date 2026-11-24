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
/** The top of a page: the page's main heading (H1), a short text, a button and an optional background photo. */
export declare const heroSection: z.ZodObject<{
    _type: z.ZodLiteral<"hero">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodString;
    text: z.ZodDefault<z.ZodString>;
    button: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        link: z.ZodString;
    }, z.core.$strip>>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    align: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
    }>>;
}, z.core.$strip>;
/** A heading and Markdown text, in a narrow column. */
export declare const textSection: z.ZodObject<{
    _type: z.ZodLiteral<"text">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodDefault<z.ZodString>;
    body: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
/** An image beside a heading, Markdown text and a button. */
export declare const imageTextSection: z.ZodObject<{
    _type: z.ZodLiteral<"image_text">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodDefault<z.ZodString>;
    body: z.ZodDefault<z.ZodString>;
    image: z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    image_position: z.ZodDefault<z.ZodEnum<{
        left: "left";
        right: "right";
    }>>;
    button: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        link: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** Questions and answers that open one by one; also FAQ data for Google. */
export declare const faqSection: z.ZodObject<{
    _type: z.ZodLiteral<"faq">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodDefault<z.ZodString>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/** A coloured band with a heading, text and a button. */
export declare const ctaSection: z.ZodObject<{
    _type: z.ZodLiteral<"cta">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodString;
    text: z.ZodDefault<z.ZodString>;
    button: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        link: z.ZodString;
    }, z.core.$strip>>;
    style: z.ZodDefault<z.ZodEnum<{
        brand: "brand";
        soft: "soft";
    }>>;
}, z.core.$strip>;
/** The phone, email and address from Site settings → Site info, with a heading and text. */
export declare const contactSection: z.ZodObject<{
    _type: z.ZodLiteral<"contact">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodDefault<z.ZodString>;
    text: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
/** A grid of cards: each with an optional image, a heading, text and an optional link. */
export declare const cardsSection: z.ZodObject<{
    _type: z.ZodLiteral<"cards">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodDefault<z.ZodString>;
    intro: z.ZodDefault<z.ZodString>;
    columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    cards: z.ZodDefault<z.ZodArray<z.ZodObject<{
        image: z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        heading: z.ZodString;
        text: z.ZodDefault<z.ZodString>;
        link: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            link: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/** A grid of photos. */
export declare const gallerySection: z.ZodObject<{
    _type: z.ZodLiteral<"gallery">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    heading: z.ZodDefault<z.ZodString>;
    intro: z.ZodDefault<z.ZodString>;
    columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    images: z.ZodDefault<z.ZodArray<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/** Every shared section type, by name (the `_type` value, the CMS file name and the component). */
export declare const coreSections: {
    hero: z.ZodObject<{
        _type: z.ZodLiteral<"hero">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodString;
        text: z.ZodDefault<z.ZodString>;
        button: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            link: z.ZodString;
        }, z.core.$strip>>;
        image: z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        align: z.ZodDefault<z.ZodEnum<{
            left: "left";
            center: "center";
        }>>;
    }, z.core.$strip>;
    text: z.ZodObject<{
        _type: z.ZodLiteral<"text">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodDefault<z.ZodString>;
        body: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    image_text: z.ZodObject<{
        _type: z.ZodLiteral<"image_text">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodDefault<z.ZodString>;
        body: z.ZodDefault<z.ZodString>;
        image: z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        image_position: z.ZodDefault<z.ZodEnum<{
            left: "left";
            right: "right";
        }>>;
        button: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            link: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    faq: z.ZodObject<{
        _type: z.ZodLiteral<"faq">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodDefault<z.ZodString>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            answer: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    cta: z.ZodObject<{
        _type: z.ZodLiteral<"cta">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodString;
        text: z.ZodDefault<z.ZodString>;
        button: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            link: z.ZodString;
        }, z.core.$strip>>;
        style: z.ZodDefault<z.ZodEnum<{
            brand: "brand";
            soft: "soft";
        }>>;
    }, z.core.$strip>;
    contact: z.ZodObject<{
        _type: z.ZodLiteral<"contact">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodDefault<z.ZodString>;
        text: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    cards: z.ZodObject<{
        _type: z.ZodLiteral<"cards">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodDefault<z.ZodString>;
        intro: z.ZodDefault<z.ZodString>;
        columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        cards: z.ZodDefault<z.ZodArray<z.ZodObject<{
            image: z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            heading: z.ZodString;
            text: z.ZodDefault<z.ZodString>;
            link: z.ZodOptional<z.ZodObject<{
                label: z.ZodString;
                link: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    gallery: z.ZodObject<{
        _type: z.ZodLiteral<"gallery">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        heading: z.ZodDefault<z.ZodString>;
        intro: z.ZodDefault<z.ZodString>;
        columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        images: z.ZodDefault<z.ZodArray<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
};
export type CoreSectionName = keyof typeof coreSections;
export type CoreSection<N extends CoreSectionName = CoreSectionName> = z.output<(typeof coreSections)[N]>;
export declare const coreSectionNames: CoreSectionName[];
