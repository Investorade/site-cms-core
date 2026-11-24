import type { AstroIntegration } from 'astro';
import { z } from 'astro/zod';
/** The site's page and post schemas (from createPageSchema / createPostSchema). */
export interface ContentRulesOptions {
    schemas: {
        pages: z.ZodType;
        posts: z.ZodType;
    };
}
export default function contentRules({ schemas }: ContentRulesOptions): AstroIntegration;
