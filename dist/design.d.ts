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
export declare const DESIGNS_FOLDER = "src/content/designs";
/** A design page's own address: lower case words with dashes, optionally in folders ("lp/botox-special"). */
export declare const DESIGN_ADDRESS: RegExp;
export declare const SPACES: readonly ["none", "small", "medium", "large", "xlarge"];
export declare const WIDTHS: readonly ["narrow", "normal", "wide", "full"];
export declare const LAYOUTS: readonly ["1", "1-1", "2-1", "1-2", "1-1-1", "1-1-1-1", "1-3", "3-1"];
export declare const TONES: readonly ["auto", "dark", "light"];
export declare const ALIGNS: readonly ["left", "center", "right"];
export declare const VALIGNS: readonly ["top", "center", "bottom", "stretch"];
export declare const TEXT_SIZES: readonly ["small", "medium", "large"];
export declare const HEADING_SIZES: readonly ["small", "medium", "large", "xlarge", "huge"];
export declare const RATIOS: readonly ["auto", "1:1", "4:3", "3:2", "16:9", "21:9", "3:4", "2:3", "9:16"];
export declare const BUTTON_STYLES: readonly ["primary", "secondary", "outline", "text"];
export declare const FIELD_TYPES: readonly ["text", "email", "tel", "textarea", "select", "checkbox", "date", "number"];
export declare const designBlock: z.ZodDiscriminatedUnion<[z.ZodObject<{
    _type: z.ZodLiteral<"heading">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    text: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<{
        h1: "h1";
        h2: "h2";
        h3: "h3";
        h4: "h4";
    }>>;
    size: z.ZodDefault<z.ZodEnum<{
        small: "small";
        medium: "medium";
        large: "large";
        xlarge: "xlarge";
        huge: "huge";
    }>>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
    color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"text">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    text: z.ZodString;
    size: z.ZodDefault<z.ZodEnum<{
        small: "small";
        medium: "medium";
        large: "large";
    }>>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"image">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    ratio: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        "1:1": "1:1";
        "4:3": "4:3";
        "3:2": "3:2";
        "16:9": "16:9";
        "21:9": "21:9";
        "3:4": "3:4";
        "2:3": "2:3";
        "9:16": "9:16";
    }>>;
    fit: z.ZodDefault<z.ZodEnum<{
        cover: "cover";
        contain: "contain";
    }>>;
    rounded: z.ZodDefault<z.ZodBoolean>;
    shadow: z.ZodDefault<z.ZodBoolean>;
    link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    max_width: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"gallery">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    images: z.ZodDefault<z.ZodArray<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    columns: z.ZodDefault<z.ZodNumber>;
    ratio: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        "1:1": "1:1";
        "4:3": "4:3";
        "3:2": "3:2";
        "16:9": "16:9";
        "21:9": "21:9";
        "3:4": "3:4";
        "2:3": "2:3";
        "9:16": "9:16";
    }>>;
    rounded: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"buttons">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        link: z.ZodString;
        style: z.ZodDefault<z.ZodEnum<{
            text: "text";
            primary: "primary";
            secondary: "secondary";
            outline: "outline";
        }>>;
        new_tab: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
    size: z.ZodDefault<z.ZodEnum<{
        small: "small";
        medium: "medium";
        large: "large";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"card">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>, unknown>;
    eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    button: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        link: z.ZodString;
    }, z.core.$strip>>, unknown>;
    style: z.ZodDefault<z.ZodEnum<{
        shadow: "shadow";
        plain: "plain";
        border: "border";
        filled: "filled";
    }>>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"list">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>>>;
    marker: z.ZodDefault<z.ZodEnum<{
        number: "number";
        check: "check";
        none: "none";
        icon: "icon";
        dot: "dot";
    }>>;
    columns: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"features">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>, unknown>;
        heading: z.ZodString;
        text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>>>;
    columns: z.ZodDefault<z.ZodNumber>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
    style: z.ZodDefault<z.ZodEnum<{
        card: "card";
        plain: "plain";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"stats">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        label: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>>>;
    columns: z.ZodDefault<z.ZodNumber>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"quote">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    text: z.ZodString;
    author: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    role: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodDefault<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>, unknown>;
    style: z.ZodDefault<z.ZodEnum<{
        large: "large";
        card: "card";
        plain: "plain";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"accordion">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strip>>>;
    open_first: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"video">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    url: z.ZodString;
    ratio: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        "1:1": "1:1";
        "4:3": "4:3";
        "3:2": "3:2";
        "16:9": "16:9";
        "21:9": "21:9";
        "3:4": "3:4";
        "2:3": "2:3";
        "9:16": "9:16";
    }>>;
    caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"map">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    query: z.ZodString;
    height: z.ZodDefault<z.ZodNumber>;
    zoom: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"form">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    form_id: z.ZodString;
    heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<{
            number: "number";
            email: "email";
            date: "date";
            text: "text";
            tel: "tel";
            textarea: "textarea";
            select: "select";
            checkbox: "checkbox";
        }>>;
        required: z.ZodDefault<z.ZodBoolean>;
        placeholder: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        options: z.ZodDefault<z.ZodArray<z.ZodString>>;
        width: z.ZodDefault<z.ZodEnum<{
            full: "full";
            half: "half";
        }>>;
    }, z.core.$strip>>>;
    submit_label: z.ZodDefault<z.ZodString>;
    success_message: z.ZodDefault<z.ZodString>;
    redirect: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    button_style: z.ZodDefault<z.ZodEnum<{
        text: "text";
        primary: "primary";
        secondary: "secondary";
        outline: "outline";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"divider">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    style: z.ZodDefault<z.ZodEnum<{
        line: "line";
        dots: "dots";
        short: "short";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"spacer">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    size: z.ZodDefault<z.ZodEnum<{
        small: "small";
        none: "none";
        medium: "medium";
        large: "large";
        xlarge: "xlarge";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    _type: z.ZodLiteral<"html">;
    hidden: z.ZodDefault<z.ZodBoolean>;
    custom_html: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
}, z.core.$strip>], "_type">;
export type DesignBlock = z.output<typeof designBlock>;
export declare const designColumn: z.ZodObject<{
    blocks: z.ZodPreprocess<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        _type: z.ZodLiteral<"heading">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        text: z.ZodString;
        level: z.ZodDefault<z.ZodEnum<{
            h1: "h1";
            h2: "h2";
            h3: "h3";
            h4: "h4";
        }>>;
        size: z.ZodDefault<z.ZodEnum<{
            small: "small";
            medium: "medium";
            large: "large";
            xlarge: "xlarge";
            huge: "huge";
        }>>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
        color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"text">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        text: z.ZodString;
        size: z.ZodDefault<z.ZodEnum<{
            small: "small";
            medium: "medium";
            large: "large";
        }>>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"image">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        image: z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        ratio: z.ZodDefault<z.ZodEnum<{
            auto: "auto";
            "1:1": "1:1";
            "4:3": "4:3";
            "3:2": "3:2";
            "16:9": "16:9";
            "21:9": "21:9";
            "3:4": "3:4";
            "2:3": "2:3";
            "9:16": "9:16";
        }>>;
        fit: z.ZodDefault<z.ZodEnum<{
            cover: "cover";
            contain: "contain";
        }>>;
        rounded: z.ZodDefault<z.ZodBoolean>;
        shadow: z.ZodDefault<z.ZodBoolean>;
        link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        max_width: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"gallery">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        images: z.ZodDefault<z.ZodArray<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        columns: z.ZodDefault<z.ZodNumber>;
        ratio: z.ZodDefault<z.ZodEnum<{
            auto: "auto";
            "1:1": "1:1";
            "4:3": "4:3";
            "3:2": "3:2";
            "16:9": "16:9";
            "21:9": "21:9";
            "3:4": "3:4";
            "2:3": "2:3";
            "9:16": "9:16";
        }>>;
        rounded: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"buttons">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            link: z.ZodString;
            style: z.ZodDefault<z.ZodEnum<{
                text: "text";
                primary: "primary";
                secondary: "secondary";
                outline: "outline";
            }>>;
            new_tab: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
        size: z.ZodDefault<z.ZodEnum<{
            small: "small";
            medium: "medium";
            large: "large";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"card">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>, unknown>;
        eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        button: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            link: z.ZodString;
        }, z.core.$strip>>, unknown>;
        style: z.ZodDefault<z.ZodEnum<{
            shadow: "shadow";
            plain: "plain";
            border: "border";
            filled: "filled";
        }>>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"list">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        }, z.core.$strip>>>;
        marker: z.ZodDefault<z.ZodEnum<{
            number: "number";
            check: "check";
            none: "none";
            icon: "icon";
            dot: "dot";
        }>>;
        columns: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"features">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>, unknown>;
            heading: z.ZodString;
            text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        }, z.core.$strip>>>;
        columns: z.ZodDefault<z.ZodNumber>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
        style: z.ZodDefault<z.ZodEnum<{
            card: "card";
            plain: "plain";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"stats">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            label: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        }, z.core.$strip>>>;
        columns: z.ZodDefault<z.ZodNumber>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"quote">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        text: z.ZodString;
        author: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        role: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>, unknown>;
        style: z.ZodDefault<z.ZodEnum<{
            large: "large";
            card: "card";
            plain: "plain";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"accordion">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            answer: z.ZodString;
        }, z.core.$strip>>>;
        open_first: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"video">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        url: z.ZodString;
        ratio: z.ZodDefault<z.ZodEnum<{
            auto: "auto";
            "1:1": "1:1";
            "4:3": "4:3";
            "3:2": "3:2";
            "16:9": "16:9";
            "21:9": "21:9";
            "3:4": "3:4";
            "2:3": "2:3";
            "9:16": "9:16";
        }>>;
        caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"map">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        query: z.ZodString;
        height: z.ZodDefault<z.ZodNumber>;
        zoom: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"form">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        form_id: z.ZodString;
        heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            label: z.ZodString;
            type: z.ZodDefault<z.ZodEnum<{
                number: "number";
                email: "email";
                date: "date";
                text: "text";
                tel: "tel";
                textarea: "textarea";
                select: "select";
                checkbox: "checkbox";
            }>>;
            required: z.ZodDefault<z.ZodBoolean>;
            placeholder: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            options: z.ZodDefault<z.ZodArray<z.ZodString>>;
            width: z.ZodDefault<z.ZodEnum<{
                full: "full";
                half: "half";
            }>>;
        }, z.core.$strip>>>;
        submit_label: z.ZodDefault<z.ZodString>;
        success_message: z.ZodDefault<z.ZodString>;
        redirect: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        button_style: z.ZodDefault<z.ZodEnum<{
            text: "text";
            primary: "primary";
            secondary: "secondary";
            outline: "outline";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"divider">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        style: z.ZodDefault<z.ZodEnum<{
            line: "line";
            dots: "dots";
            short: "short";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"spacer">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        size: z.ZodDefault<z.ZodEnum<{
            small: "small";
            none: "none";
            medium: "medium";
            large: "large";
            xlarge: "xlarge";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        _type: z.ZodLiteral<"html">;
        hidden: z.ZodDefault<z.ZodBoolean>;
        custom_html: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>], "_type">>, unknown>;
    align: z.ZodOptional<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
    background: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    padding: z.ZodDefault<z.ZodEnum<{
        small: "small";
        none: "none";
        medium: "medium";
        large: "large";
        xlarge: "xlarge";
    }>>;
}, z.core.$strip>;
export declare const designSection: z.ZodObject<{
    name: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    hidden: z.ZodDefault<z.ZodBoolean>;
    anchor: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    layout: z.ZodDefault<z.ZodEnum<{
        1: "1";
        "1-1": "1-1";
        "2-1": "2-1";
        "1-2": "1-2";
        "1-1-1": "1-1-1";
        "1-1-1-1": "1-1-1-1";
        "1-3": "1-3";
        "3-1": "3-1";
    }>>;
    width: z.ZodDefault<z.ZodEnum<{
        normal: "normal";
        narrow: "narrow";
        wide: "wide";
        full: "full";
    }>>;
    padding: z.ZodDefault<z.ZodEnum<{
        small: "small";
        none: "none";
        medium: "medium";
        large: "large";
        xlarge: "xlarge";
    }>>;
    gap: z.ZodDefault<z.ZodEnum<{
        small: "small";
        none: "none";
        medium: "medium";
        large: "large";
        xlarge: "xlarge";
    }>>;
    valign: z.ZodDefault<z.ZodEnum<{
        stretch: "stretch";
        center: "center";
        top: "top";
        bottom: "bottom";
    }>>;
    align: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>>;
    tone: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        light: "light";
        dark: "dark";
    }>>;
    background: z.ZodPreprocess<z.ZodObject<{
        color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            src: z.ZodString;
            alt: z.ZodDefault<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>, unknown>;
        overlay: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, unknown>;
    reverse_on_mobile: z.ZodDefault<z.ZodBoolean>;
    columns: z.ZodPreprocess<z.ZodArray<z.ZodObject<{
        blocks: z.ZodPreprocess<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            _type: z.ZodLiteral<"heading">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            text: z.ZodString;
            level: z.ZodDefault<z.ZodEnum<{
                h1: "h1";
                h2: "h2";
                h3: "h3";
                h4: "h4";
            }>>;
            size: z.ZodDefault<z.ZodEnum<{
                small: "small";
                medium: "medium";
                large: "large";
                xlarge: "xlarge";
                huge: "huge";
            }>>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
            color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"text">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            text: z.ZodString;
            size: z.ZodDefault<z.ZodEnum<{
                small: "small";
                medium: "medium";
                large: "large";
            }>>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"image">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            image: z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            ratio: z.ZodDefault<z.ZodEnum<{
                auto: "auto";
                "1:1": "1:1";
                "4:3": "4:3";
                "3:2": "3:2";
                "16:9": "16:9";
                "21:9": "21:9";
                "3:4": "3:4";
                "2:3": "2:3";
                "9:16": "9:16";
            }>>;
            fit: z.ZodDefault<z.ZodEnum<{
                cover: "cover";
                contain: "contain";
            }>>;
            rounded: z.ZodDefault<z.ZodBoolean>;
            shadow: z.ZodDefault<z.ZodBoolean>;
            link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            max_width: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"gallery">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            images: z.ZodDefault<z.ZodArray<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>>;
            columns: z.ZodDefault<z.ZodNumber>;
            ratio: z.ZodDefault<z.ZodEnum<{
                auto: "auto";
                "1:1": "1:1";
                "4:3": "4:3";
                "3:2": "3:2";
                "16:9": "16:9";
                "21:9": "21:9";
                "3:4": "3:4";
                "2:3": "2:3";
                "9:16": "9:16";
            }>>;
            rounded: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"buttons">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                link: z.ZodString;
                style: z.ZodDefault<z.ZodEnum<{
                    text: "text";
                    primary: "primary";
                    secondary: "secondary";
                    outline: "outline";
                }>>;
                new_tab: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
            size: z.ZodDefault<z.ZodEnum<{
                small: "small";
                medium: "medium";
                large: "large";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"card">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>, unknown>;
            eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            button: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                label: z.ZodString;
                link: z.ZodString;
            }, z.core.$strip>>, unknown>;
            style: z.ZodDefault<z.ZodEnum<{
                shadow: "shadow";
                plain: "plain";
                border: "border";
                filled: "filled";
            }>>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"list">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            }, z.core.$strip>>>;
            marker: z.ZodDefault<z.ZodEnum<{
                number: "number";
                check: "check";
                none: "none";
                icon: "icon";
                dot: "dot";
            }>>;
            columns: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"features">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                    src: z.ZodString;
                    alt: z.ZodDefault<z.ZodString>;
                    width: z.ZodOptional<z.ZodNumber>;
                    height: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>, unknown>;
                heading: z.ZodString;
                text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            }, z.core.$strip>>>;
            columns: z.ZodDefault<z.ZodNumber>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
            style: z.ZodDefault<z.ZodEnum<{
                card: "card";
                plain: "plain";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"stats">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                value: z.ZodString;
                label: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            }, z.core.$strip>>>;
            columns: z.ZodDefault<z.ZodNumber>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"quote">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            text: z.ZodString;
            author: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            role: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>, unknown>;
            style: z.ZodDefault<z.ZodEnum<{
                large: "large";
                card: "card";
                plain: "plain";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"accordion">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                question: z.ZodString;
                answer: z.ZodString;
            }, z.core.$strip>>>;
            open_first: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"video">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            url: z.ZodString;
            ratio: z.ZodDefault<z.ZodEnum<{
                auto: "auto";
                "1:1": "1:1";
                "4:3": "4:3";
                "3:2": "3:2";
                "16:9": "16:9";
                "21:9": "21:9";
                "3:4": "3:4";
                "2:3": "2:3";
                "9:16": "9:16";
            }>>;
            caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"map">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            query: z.ZodString;
            height: z.ZodDefault<z.ZodNumber>;
            zoom: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"form">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            form_id: z.ZodString;
            heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                label: z.ZodString;
                type: z.ZodDefault<z.ZodEnum<{
                    number: "number";
                    email: "email";
                    date: "date";
                    text: "text";
                    tel: "tel";
                    textarea: "textarea";
                    select: "select";
                    checkbox: "checkbox";
                }>>;
                required: z.ZodDefault<z.ZodBoolean>;
                placeholder: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                options: z.ZodDefault<z.ZodArray<z.ZodString>>;
                width: z.ZodDefault<z.ZodEnum<{
                    full: "full";
                    half: "half";
                }>>;
            }, z.core.$strip>>>;
            submit_label: z.ZodDefault<z.ZodString>;
            success_message: z.ZodDefault<z.ZodString>;
            redirect: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            button_style: z.ZodDefault<z.ZodEnum<{
                text: "text";
                primary: "primary";
                secondary: "secondary";
                outline: "outline";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"divider">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            style: z.ZodDefault<z.ZodEnum<{
                line: "line";
                dots: "dots";
                short: "short";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"spacer">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            size: z.ZodDefault<z.ZodEnum<{
                small: "small";
                none: "none";
                medium: "medium";
                large: "large";
                xlarge: "xlarge";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            _type: z.ZodLiteral<"html">;
            hidden: z.ZodDefault<z.ZodBoolean>;
            custom_html: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        }, z.core.$strip>], "_type">>, unknown>;
        align: z.ZodOptional<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
        background: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        padding: z.ZodDefault<z.ZodEnum<{
            small: "small";
            none: "none";
            medium: "medium";
            large: "large";
            xlarge: "xlarge";
        }>>;
    }, z.core.$strip>>, unknown>;
    custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
}, z.core.$strip>;
export type DesignSection = z.output<typeof designSection>;
/** A design page (src/content/designs/<file>.md). */
export declare function createDesignSchema({ siteName }: {
    siteName: string;
}): z.ZodPipe<z.ZodObject<{
    title: z.ZodString;
    draft: z.ZodDefault<z.ZodBoolean>;
    slug: z.ZodOptional<z.ZodString>;
    header: z.ZodDefault<z.ZodBoolean>;
    footer: z.ZodDefault<z.ZodBoolean>;
    page: z.ZodPreprocess<z.ZodObject<{
        background: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        text_color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>, unknown>;
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
    sections: z.ZodPreprocess<z.ZodArray<z.ZodObject<{
        name: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        hidden: z.ZodDefault<z.ZodBoolean>;
        anchor: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
        layout: z.ZodDefault<z.ZodEnum<{
            1: "1";
            "1-1": "1-1";
            "2-1": "2-1";
            "1-2": "1-2";
            "1-1-1": "1-1-1";
            "1-1-1-1": "1-1-1-1";
            "1-3": "1-3";
            "3-1": "3-1";
        }>>;
        width: z.ZodDefault<z.ZodEnum<{
            normal: "normal";
            narrow: "narrow";
            wide: "wide";
            full: "full";
        }>>;
        padding: z.ZodDefault<z.ZodEnum<{
            small: "small";
            none: "none";
            medium: "medium";
            large: "large";
            xlarge: "xlarge";
        }>>;
        gap: z.ZodDefault<z.ZodEnum<{
            small: "small";
            none: "none";
            medium: "medium";
            large: "large";
            xlarge: "xlarge";
        }>>;
        valign: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            center: "center";
            top: "top";
            bottom: "bottom";
        }>>;
        align: z.ZodDefault<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>>;
        tone: z.ZodDefault<z.ZodEnum<{
            auto: "auto";
            light: "light";
            dark: "dark";
        }>>;
        background: z.ZodPreprocess<z.ZodObject<{
            color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                src: z.ZodString;
                alt: z.ZodDefault<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>, unknown>;
            overlay: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>, unknown>;
        reverse_on_mobile: z.ZodDefault<z.ZodBoolean>;
        columns: z.ZodPreprocess<z.ZodArray<z.ZodObject<{
            blocks: z.ZodPreprocess<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                _type: z.ZodLiteral<"heading">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                text: z.ZodString;
                level: z.ZodDefault<z.ZodEnum<{
                    h1: "h1";
                    h2: "h2";
                    h3: "h3";
                    h4: "h4";
                }>>;
                size: z.ZodDefault<z.ZodEnum<{
                    small: "small";
                    medium: "medium";
                    large: "large";
                    xlarge: "xlarge";
                    huge: "huge";
                }>>;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
                color: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"text">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                text: z.ZodString;
                size: z.ZodDefault<z.ZodEnum<{
                    small: "small";
                    medium: "medium";
                    large: "large";
                }>>;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"image">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                image: z.ZodObject<{
                    src: z.ZodString;
                    alt: z.ZodDefault<z.ZodString>;
                    width: z.ZodOptional<z.ZodNumber>;
                    height: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                ratio: z.ZodDefault<z.ZodEnum<{
                    auto: "auto";
                    "1:1": "1:1";
                    "4:3": "4:3";
                    "3:2": "3:2";
                    "16:9": "16:9";
                    "21:9": "21:9";
                    "3:4": "3:4";
                    "2:3": "2:3";
                    "9:16": "9:16";
                }>>;
                fit: z.ZodDefault<z.ZodEnum<{
                    cover: "cover";
                    contain: "contain";
                }>>;
                rounded: z.ZodDefault<z.ZodBoolean>;
                shadow: z.ZodDefault<z.ZodBoolean>;
                link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                max_width: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"gallery">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                images: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    src: z.ZodString;
                    alt: z.ZodDefault<z.ZodString>;
                    width: z.ZodOptional<z.ZodNumber>;
                    height: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>>;
                columns: z.ZodDefault<z.ZodNumber>;
                ratio: z.ZodDefault<z.ZodEnum<{
                    auto: "auto";
                    "1:1": "1:1";
                    "4:3": "4:3";
                    "3:2": "3:2";
                    "16:9": "16:9";
                    "21:9": "21:9";
                    "3:4": "3:4";
                    "2:3": "2:3";
                    "9:16": "9:16";
                }>>;
                rounded: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"buttons">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    link: z.ZodString;
                    style: z.ZodDefault<z.ZodEnum<{
                        text: "text";
                        primary: "primary";
                        secondary: "secondary";
                        outline: "outline";
                    }>>;
                    new_tab: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>>>;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
                size: z.ZodDefault<z.ZodEnum<{
                    small: "small";
                    medium: "medium";
                    large: "large";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"card">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                    src: z.ZodString;
                    alt: z.ZodDefault<z.ZodString>;
                    width: z.ZodOptional<z.ZodNumber>;
                    height: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>, unknown>;
                eyebrow: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                button: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                    label: z.ZodString;
                    link: z.ZodString;
                }, z.core.$strip>>, unknown>;
                style: z.ZodDefault<z.ZodEnum<{
                    shadow: "shadow";
                    plain: "plain";
                    border: "border";
                    filled: "filled";
                }>>;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"list">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    text: z.ZodString;
                    icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                }, z.core.$strip>>>;
                marker: z.ZodDefault<z.ZodEnum<{
                    number: "number";
                    check: "check";
                    none: "none";
                    icon: "icon";
                    dot: "dot";
                }>>;
                columns: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"features">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    icon: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                    image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                        src: z.ZodString;
                        alt: z.ZodDefault<z.ZodString>;
                        width: z.ZodOptional<z.ZodNumber>;
                        height: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>>, unknown>;
                    heading: z.ZodString;
                    text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                    link: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                }, z.core.$strip>>>;
                columns: z.ZodDefault<z.ZodNumber>;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
                style: z.ZodDefault<z.ZodEnum<{
                    card: "card";
                    plain: "plain";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"stats">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    value: z.ZodString;
                    label: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                }, z.core.$strip>>>;
                columns: z.ZodDefault<z.ZodNumber>;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                    right: "right";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"quote">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                text: z.ZodString;
                author: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                role: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                image: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
                    src: z.ZodString;
                    alt: z.ZodDefault<z.ZodString>;
                    width: z.ZodOptional<z.ZodNumber>;
                    height: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>, unknown>;
                style: z.ZodDefault<z.ZodEnum<{
                    large: "large";
                    card: "card";
                    plain: "plain";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"accordion">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                items: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    question: z.ZodString;
                    answer: z.ZodString;
                }, z.core.$strip>>>;
                open_first: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"video">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                url: z.ZodString;
                ratio: z.ZodDefault<z.ZodEnum<{
                    auto: "auto";
                    "1:1": "1:1";
                    "4:3": "4:3";
                    "3:2": "3:2";
                    "16:9": "16:9";
                    "21:9": "21:9";
                    "3:4": "3:4";
                    "2:3": "2:3";
                    "9:16": "9:16";
                }>>;
                caption: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"map">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                query: z.ZodString;
                height: z.ZodDefault<z.ZodNumber>;
                zoom: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"form">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                form_id: z.ZodString;
                heading: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                text: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    label: z.ZodString;
                    type: z.ZodDefault<z.ZodEnum<{
                        number: "number";
                        email: "email";
                        date: "date";
                        text: "text";
                        tel: "tel";
                        textarea: "textarea";
                        select: "select";
                        checkbox: "checkbox";
                    }>>;
                    required: z.ZodDefault<z.ZodBoolean>;
                    placeholder: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                    options: z.ZodDefault<z.ZodArray<z.ZodString>>;
                    width: z.ZodDefault<z.ZodEnum<{
                        full: "full";
                        half: "half";
                    }>>;
                }, z.core.$strip>>>;
                submit_label: z.ZodDefault<z.ZodString>;
                success_message: z.ZodDefault<z.ZodString>;
                redirect: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                button_style: z.ZodDefault<z.ZodEnum<{
                    text: "text";
                    primary: "primary";
                    secondary: "secondary";
                    outline: "outline";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"divider">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                style: z.ZodDefault<z.ZodEnum<{
                    line: "line";
                    dots: "dots";
                    short: "short";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"spacer">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                size: z.ZodDefault<z.ZodEnum<{
                    small: "small";
                    none: "none";
                    medium: "medium";
                    large: "large";
                    xlarge: "xlarge";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                _type: z.ZodLiteral<"html">;
                hidden: z.ZodDefault<z.ZodBoolean>;
                custom_html: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
                custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            }, z.core.$strip>], "_type">>, unknown>;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
            background: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
            padding: z.ZodDefault<z.ZodEnum<{
                small: "small";
                none: "none";
                medium: "medium";
                large: "large";
                xlarge: "xlarge";
            }>>;
        }, z.core.$strip>>, unknown>;
        custom_css: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string, string | null | undefined>>;
    }, z.core.$strip>>, unknown>;
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
    header: boolean;
    footer: boolean;
    page: {
        background: string;
        text_color: string;
        custom_css: string;
    };
    sections: {
        name: string;
        hidden: boolean;
        anchor: string;
        layout: "1" | "1-1" | "2-1" | "1-2" | "1-1-1" | "1-1-1-1" | "1-3" | "3-1";
        width: "normal" | "narrow" | "wide" | "full";
        padding: "small" | "none" | "medium" | "large" | "xlarge";
        gap: "small" | "none" | "medium" | "large" | "xlarge";
        valign: "stretch" | "center" | "top" | "bottom";
        align: "left" | "center" | "right";
        tone: "auto" | "light" | "dark";
        background: {
            color: string;
            overlay: number;
            image?: {
                src: string;
                alt: string;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
        };
        reverse_on_mobile: boolean;
        columns: {
            blocks: ({
                _type: "heading";
                hidden: boolean;
                eyebrow: string;
                text: string;
                level: "h1" | "h2" | "h3" | "h4";
                size: "small" | "medium" | "large" | "xlarge" | "huge";
                color: string;
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "text";
                hidden: boolean;
                text: string;
                size: "small" | "medium" | "large";
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "image";
                hidden: boolean;
                image: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                };
                ratio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16";
                fit: "cover" | "contain";
                rounded: boolean;
                shadow: boolean;
                link: string;
                caption: string;
                max_width?: number | undefined;
            } | {
                _type: "gallery";
                hidden: boolean;
                images: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                }[];
                columns: number;
                ratio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16";
                rounded: boolean;
            } | {
                _type: "buttons";
                hidden: boolean;
                items: {
                    label: string;
                    link: string;
                    style: "text" | "primary" | "secondary" | "outline";
                    new_tab: boolean;
                }[];
                size: "small" | "medium" | "large";
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "card";
                hidden: boolean;
                eyebrow: string;
                heading: string;
                text: string;
                style: "shadow" | "plain" | "border" | "filled";
                image?: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                } | undefined;
                button?: {
                    label: string;
                    link: string;
                } | undefined;
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "list";
                hidden: boolean;
                items: {
                    text: string;
                    icon: string;
                }[];
                marker: "number" | "check" | "none" | "icon" | "dot";
                columns: number;
            } | {
                _type: "features";
                hidden: boolean;
                items: {
                    icon: string;
                    heading: string;
                    text: string;
                    link: string;
                    image?: {
                        src: string;
                        alt: string;
                        width?: number | undefined;
                        height?: number | undefined;
                    } | undefined;
                }[];
                columns: number;
                style: "card" | "plain";
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "stats";
                hidden: boolean;
                items: {
                    value: string;
                    label: string;
                }[];
                columns: number;
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "quote";
                hidden: boolean;
                text: string;
                author: string;
                role: string;
                style: "large" | "card" | "plain";
                image?: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                } | undefined;
            } | {
                _type: "accordion";
                hidden: boolean;
                items: {
                    question: string;
                    answer: string;
                }[];
                open_first: boolean;
            } | {
                _type: "video";
                hidden: boolean;
                url: string;
                ratio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16";
                caption: string;
            } | {
                _type: "map";
                hidden: boolean;
                query: string;
                height: number;
                zoom: number;
            } | {
                _type: "form";
                hidden: boolean;
                form_id: string;
                heading: string;
                text: string;
                fields: {
                    name: string;
                    label: string;
                    type: "number" | "email" | "date" | "text" | "tel" | "textarea" | "select" | "checkbox";
                    required: boolean;
                    placeholder: string;
                    options: string[];
                    width: "full" | "half";
                }[];
                submit_label: string;
                success_message: string;
                redirect: string;
                button_style: "text" | "primary" | "secondary" | "outline";
            } | {
                _type: "divider";
                hidden: boolean;
                style: "line" | "dots" | "short";
            } | {
                _type: "spacer";
                hidden: boolean;
                size: "small" | "none" | "medium" | "large" | "xlarge";
            } | {
                _type: "html";
                hidden: boolean;
                custom_html: string;
                custom_css: string;
            })[];
            background: string;
            padding: "small" | "none" | "medium" | "large" | "xlarge";
            align?: "left" | "center" | "right" | undefined;
        }[];
        custom_css: string;
    }[];
    slug?: string | undefined;
}, {
    title: string;
    draft: boolean;
    header: boolean;
    footer: boolean;
    page: {
        background: string;
        text_color: string;
        custom_css: string;
    };
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
    sections: {
        name: string;
        hidden: boolean;
        anchor: string;
        layout: "1" | "1-1" | "2-1" | "1-2" | "1-1-1" | "1-1-1-1" | "1-3" | "3-1";
        width: "normal" | "narrow" | "wide" | "full";
        padding: "small" | "none" | "medium" | "large" | "xlarge";
        gap: "small" | "none" | "medium" | "large" | "xlarge";
        valign: "stretch" | "center" | "top" | "bottom";
        align: "left" | "center" | "right";
        tone: "auto" | "light" | "dark";
        background: {
            color: string;
            overlay: number;
            image?: {
                src: string;
                alt: string;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
        };
        reverse_on_mobile: boolean;
        columns: {
            blocks: ({
                _type: "heading";
                hidden: boolean;
                eyebrow: string;
                text: string;
                level: "h1" | "h2" | "h3" | "h4";
                size: "small" | "medium" | "large" | "xlarge" | "huge";
                color: string;
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "text";
                hidden: boolean;
                text: string;
                size: "small" | "medium" | "large";
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "image";
                hidden: boolean;
                image: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                };
                ratio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16";
                fit: "cover" | "contain";
                rounded: boolean;
                shadow: boolean;
                link: string;
                caption: string;
                max_width?: number | undefined;
            } | {
                _type: "gallery";
                hidden: boolean;
                images: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                }[];
                columns: number;
                ratio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16";
                rounded: boolean;
            } | {
                _type: "buttons";
                hidden: boolean;
                items: {
                    label: string;
                    link: string;
                    style: "text" | "primary" | "secondary" | "outline";
                    new_tab: boolean;
                }[];
                size: "small" | "medium" | "large";
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "card";
                hidden: boolean;
                eyebrow: string;
                heading: string;
                text: string;
                style: "shadow" | "plain" | "border" | "filled";
                image?: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                } | undefined;
                button?: {
                    label: string;
                    link: string;
                } | undefined;
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "list";
                hidden: boolean;
                items: {
                    text: string;
                    icon: string;
                }[];
                marker: "number" | "check" | "none" | "icon" | "dot";
                columns: number;
            } | {
                _type: "features";
                hidden: boolean;
                items: {
                    icon: string;
                    heading: string;
                    text: string;
                    link: string;
                    image?: {
                        src: string;
                        alt: string;
                        width?: number | undefined;
                        height?: number | undefined;
                    } | undefined;
                }[];
                columns: number;
                style: "card" | "plain";
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "stats";
                hidden: boolean;
                items: {
                    value: string;
                    label: string;
                }[];
                columns: number;
                align?: "left" | "center" | "right" | undefined;
            } | {
                _type: "quote";
                hidden: boolean;
                text: string;
                author: string;
                role: string;
                style: "large" | "card" | "plain";
                image?: {
                    src: string;
                    alt: string;
                    width?: number | undefined;
                    height?: number | undefined;
                } | undefined;
            } | {
                _type: "accordion";
                hidden: boolean;
                items: {
                    question: string;
                    answer: string;
                }[];
                open_first: boolean;
            } | {
                _type: "video";
                hidden: boolean;
                url: string;
                ratio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16";
                caption: string;
            } | {
                _type: "map";
                hidden: boolean;
                query: string;
                height: number;
                zoom: number;
            } | {
                _type: "form";
                hidden: boolean;
                form_id: string;
                heading: string;
                text: string;
                fields: {
                    name: string;
                    label: string;
                    type: "number" | "email" | "date" | "text" | "tel" | "textarea" | "select" | "checkbox";
                    required: boolean;
                    placeholder: string;
                    options: string[];
                    width: "full" | "half";
                }[];
                submit_label: string;
                success_message: string;
                redirect: string;
                button_style: "text" | "primary" | "secondary" | "outline";
            } | {
                _type: "divider";
                hidden: boolean;
                style: "line" | "dots" | "short";
            } | {
                _type: "spacer";
                hidden: boolean;
                size: "small" | "none" | "medium" | "large" | "xlarge";
            } | {
                _type: "html";
                hidden: boolean;
                custom_html: string;
                custom_css: string;
            })[];
            background: string;
            padding: "small" | "none" | "medium" | "large" | "xlarge";
            align?: "left" | "center" | "right" | undefined;
        }[];
        custom_css: string;
    }[];
    slug?: string | undefined;
}>>;
export type DesignPageData = z.output<ReturnType<typeof createDesignSchema>>;
/** The URL path a design page is built at: its own address, or its file name ("lp/botox-special" → that). */
export declare const designPath: (id: string, data: {
    slug?: string;
}) => string;
/** A colour or gradient for a style attribute, or '' if it could do anything else (url(), ;, {}). */
export declare function safeColor(value: unknown): string;
/** A YouTube or Vimeo address as its embed address, or '' for anything else. */
export declare function videoEmbed(url: string): string;
