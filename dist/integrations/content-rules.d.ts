import type { AstroIntegration } from 'astro';
import { z } from 'astro/zod';
/** The site's page and post schemas (from createPageSchema / createPostSchema). */
export interface ContentRulesOptions {
    /** `pages` only for sites whose pages are made of sections (cms/features.yml → features.pages). */
    schemas: {
        pages?: z.ZodType;
        posts: z.ZodType;
    };
}
export default function contentRules({ schemas }: ContentRulesOptions): AstroIntegration;
