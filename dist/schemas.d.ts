/**
 * The page and blog post schemas (front matter), shared by every site. A site builds its own section types (its design)
 * from the helpers here and passes them in:
 *
 *   export const pageSchema = createPageSchema({ siteName: site.site_name, contentBlock: z.discriminatedUnion('_type', [...]) });
 *   export const postSchema = createPostSchema({ siteName: site.site_name });
 *
 * content.config.ts uses them for the site's collections, and the build exports them as JSON Schema to
 * admin/content-rules.json, so the CMS's AI connector checks new and changed pages against exactly what the site accepts.
 */
import { z } from 'astro/zod';
export declare const image: z.ZodObject<{
    src: z.ZodString;
    alt: z.ZodDefault<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const button: z.ZodObject<{
    label: z.ZodString;
    link: z.ZodString;
}, z.core.$strip>;
export declare const blogListBlock: z.ZodObject<{
    _type: z.ZodLiteral<"blog_list">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    eyebrow: z.ZodDefault<z.ZodString>;
    heading: z.ZodString;
    intro: z.ZodOptional<z.ZodString>;
    header_image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    posts_per_page: z.ZodDefault<z.ZodNumber>;
    sidebar: z.ZodObject<{
        heading: z.ZodString;
        text: z.ZodDefault<z.ZodString>;
        button_label: z.ZodString;
        button_link: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type BlogListBlock = z.output<typeof blogListBlock>;
/** A group of optional fields: the CMS leaves the whole group out when all of its fields are empty. */
export declare const group: <T extends z.ZodRawShape>(shape: T) => z.ZodPreprocess<z.ZodObject<{ -readonly [P in keyof T]: T[P]; }, z.core.$strip>, unknown>;
/**
 * Pages: the CMS shows the page's SEO in three blocks, stored as three groups:
 * - `seo`: what search results show (title, description);
 * - `social`: social share title, type and image (Open Graph, also used in the schema.org data);
 * - `advanced`: canonical URL, search engine visibility, robots, dates.
 * They're merged back into one `seo` object here, which the SEO components (SEO.astro, SchemaOrg.astro) read.
 * `contentBlock` is the site's own section types (a discriminated union on `_type`).
 */
export declare function createPageSchema<B extends z.ZodType>({ siteName, contentBlock }: {
    siteName: string;
    contentBlock: B;
}): z.ZodPipe<z.ZodObject<{
    title: z.ZodString;
    draft: z.ZodDefault<z.ZodBoolean>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    social: z.ZodPreprocess<z.ZodObject<{
        og_title: z.ZodOptional<z.ZodString>;
        og_type: z.ZodDefault<z.ZodString>;
        og_image: z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        canonical: z.ZodOptional<z.ZodString>;
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
        date_published: z.ZodOptional<z.ZodString>;
        date_modified: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, unknown>;
    content_blocks: z.ZodPreprocess<z.ZodArray<B>, unknown>;
}, z.core.$strip>, z.ZodTransform<{
    seo: {
        hide_from_search: boolean;
        robots: string;
        canonical?: string | undefined;
        date_published?: string | undefined;
        date_modified?: string | undefined;
        og_type: string;
        og_title?: string | undefined;
        og_image?: {
            src: string;
            alt: string;
            width?: number | undefined;
            height?: number | undefined;
        } | undefined;
        title: string;
        description: string;
        focus_keyword: string | undefined;
    };
    title: string;
    draft: boolean;
    content_blocks: z.core.output<B>[];
}, {
    title: string;
    draft: boolean;
    seo: {
        title: string;
        description: string;
        focus_keyword: string | undefined;
    };
    social: {
        og_type: string;
        og_title?: string | undefined;
        og_image?: {
            src: string;
            alt: string;
            width?: number | undefined;
            height?: number | undefined;
        } | undefined;
    };
    advanced: {
        hide_from_search: boolean;
        robots: string;
        canonical?: string | undefined;
        date_published?: string | undefined;
        date_modified?: string | undefined;
    };
    content_blocks: z.core.output<B>[];
}>>;
export declare function createPostSchema<E extends z.ZodRawShape = {}>({ siteName, extend }: {
    siteName: string;
    extend?: E;
}): z.ZodPipe<z.ZodObject<(("seo" | "image" | "date" | "title" | "excerpt" | "draft" | "advanced" | "slug" | "updated") & keyof E extends never ? {
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
    updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>, unknown>;
} & { -readonly [P in keyof E]: E[P]; } : ({
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
    updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>, unknown>;
} extends infer T_1 extends z.core.util.SomeObject ? { [K in keyof T_1 as K extends keyof E ? never : K]: T_1[K]; } : never) & { [K_1 in keyof { -readonly [P in keyof E]: E[P]; }]: { -readonly [P in keyof E]: E[P]; }[K_1]; }) extends infer T ? { [k in keyof T]: T[k]; } : never, z.core.$strip>, z.ZodTransform<Awaited<Omit<z.core.$InferObjectOutput<(("seo" | "image" | "date" | "title" | "excerpt" | "draft" | "advanced" | "slug" | "updated") & keyof E extends never ? {
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
    updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>, unknown>;
} & { -readonly [P in keyof E]: E[P]; } : ({
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
    updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>, unknown>;
} extends infer T_3 extends z.core.util.SomeObject ? { [K in keyof T_3 as K extends keyof E ? never : K]: T_3[K]; } : never) & { [K_1 in keyof { -readonly [P in keyof E]: E[P]; }]: { -readonly [P in keyof E]: E[P]; }[K_1]; }) extends infer T_2 ? { [k in keyof T_2]: T_2[k]; } : never, {}> & {
    title: string;
    date: Date;
    draft: boolean;
    excerpt: string;
    seo: {
        title: string;
        description: string;
        focus_keyword: string | undefined;
    };
    advanced: {
        hide_from_search: boolean;
        robots: string;
    };
    slug?: string | undefined;
    updated?: Date | undefined;
    image?: {
        src: string;
        alt: string;
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
}, "seo" | "advanced"> & {
    seo: {
        og_type: string;
        og_title: (z.core.$InferObjectOutput<(("seo" | "image" | "date" | "title" | "excerpt" | "draft" | "advanced" | "slug" | "updated") & keyof E extends never ? {
            title: z.ZodString;
            slug: z.ZodOptional<z.ZodString>;
            date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
            updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            draft: z.ZodDefault<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            seo: z.ZodPreprocess<z.ZodObject<{
                title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
            }, z.core.$strip>, unknown>;
            advanced: z.ZodPreprocess<z.ZodObject<{
                hide_from_search: z.ZodDefault<z.ZodBoolean>;
                robots: z.ZodDefault<z.ZodString>;
            }, z.core.$strip>, unknown>;
        } & { -readonly [P in keyof E]: E[P]; } : ({
            title: z.ZodString;
            slug: z.ZodOptional<z.ZodString>;
            date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
            updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            draft: z.ZodDefault<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            seo: z.ZodPreprocess<z.ZodObject<{
                title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
            }, z.core.$strip>, unknown>;
            advanced: z.ZodPreprocess<z.ZodObject<{
                hide_from_search: z.ZodDefault<z.ZodBoolean>;
                robots: z.ZodDefault<z.ZodString>;
            }, z.core.$strip>, unknown>;
        } extends infer T_5 extends z.core.util.SomeObject ? { [K in keyof T_5 as K extends keyof E ? never : K]: T_5[K]; } : never) & { [K_1 in keyof { -readonly [P in keyof E]: E[P]; }]: { -readonly [P in keyof E]: E[P]; }[K_1]; }) extends infer T_4 ? { [k in keyof T_4]: T_4[k]; } : never, {}> & {
            title: string;
            date: Date;
            draft: boolean;
            excerpt: string;
            seo: {
                title: string;
                description: string;
                focus_keyword: string | undefined;
            };
            advanced: {
                hide_from_search: boolean;
                robots: string;
            };
            slug?: string | undefined;
            updated?: Date | undefined;
            image?: {
                src: string;
                alt: string;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
        })["title"];
        og_image: (z.core.$InferObjectOutput<(("seo" | "image" | "date" | "title" | "excerpt" | "draft" | "advanced" | "slug" | "updated") & keyof E extends never ? {
            title: z.ZodString;
            slug: z.ZodOptional<z.ZodString>;
            date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
            updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            draft: z.ZodDefault<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            seo: z.ZodPreprocess<z.ZodObject<{
                title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
            }, z.core.$strip>, unknown>;
            advanced: z.ZodPreprocess<z.ZodObject<{
                hide_from_search: z.ZodDefault<z.ZodBoolean>;
                robots: z.ZodDefault<z.ZodString>;
            }, z.core.$strip>, unknown>;
        } & { -readonly [P in keyof E]: E[P]; } : ({
            title: z.ZodString;
            slug: z.ZodOptional<z.ZodString>;
            date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
            updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
            draft: z.ZodDefault<z.ZodBoolean>;
            image: z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            seo: z.ZodPreprocess<z.ZodObject<{
                title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
            }, z.core.$strip>, unknown>;
            advanced: z.ZodPreprocess<z.ZodObject<{
                hide_from_search: z.ZodDefault<z.ZodBoolean>;
                robots: z.ZodDefault<z.ZodString>;
            }, z.core.$strip>, unknown>;
        } extends infer T_7 extends z.core.util.SomeObject ? { [K in keyof T_7 as K extends keyof E ? never : K]: T_7[K]; } : never) & { [K_1 in keyof { -readonly [P in keyof E]: E[P]; }]: { -readonly [P in keyof E]: E[P]; }[K_1]; }) extends infer T_6 ? { [k in keyof T_6]: T_6[k]; } : never, {}> & {
            title: string;
            date: Date;
            draft: boolean;
            excerpt: string;
            seo: {
                title: string;
                description: string;
                focus_keyword: string | undefined;
            };
            advanced: {
                hide_from_search: boolean;
                robots: string;
            };
            slug?: string | undefined;
            updated?: Date | undefined;
            image?: {
                src: string;
                alt: string;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
        })["image"] | undefined;
        date_published: string;
        date_modified: string;
        canonical: string | undefined;
        hide_from_search: boolean;
        robots: string;
        title: string;
        description: string;
        focus_keyword: string | undefined;
    };
}>, z.core.$InferObjectOutput<(("seo" | "image" | "date" | "title" | "excerpt" | "draft" | "advanced" | "slug" | "updated") & keyof E extends never ? {
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
    updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>, unknown>;
} & { -readonly [P in keyof E]: E[P]; } : ({
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    date: z.ZodPreprocess<z.ZodCoercedDate<unknown>, unknown>;
    updated: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    excerpt: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    seo: z.ZodPreprocess<z.ZodObject<{
        title: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        focus_keyword: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
    advanced: z.ZodPreprocess<z.ZodObject<{
        hide_from_search: z.ZodDefault<z.ZodBoolean>;
        robots: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>, unknown>;
} extends infer T_9 extends z.core.util.SomeObject ? { [K in keyof T_9 as K extends keyof E ? never : K]: T_9[K]; } : never) & { [K_1 in keyof { -readonly [P in keyof E]: E[P]; }]: { -readonly [P in keyof E]: E[P]; }[K_1]; }) extends infer T_8 ? { [k in keyof T_8]: T_8[k]; } : never, {}>>>;
/** What the SEO components read: a page's or post's merged `seo`. */
export type PageSeo = z.output<ReturnType<typeof createPageSchema>>['seo'] | z.output<ReturnType<typeof createPostSchema>>['seo'];
