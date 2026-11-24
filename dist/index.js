import { fileURLToPath } from 'node:url';
import contentRules from "./integrations/content-rules.js";
import formsCheck from "./integrations/forms-check.js";
import seoFiles from "./integrations/seo-files.js";
function setup() {
    return {
        name: 'site-cms-core',
        hooks: {
            'astro:config:setup': ({ config, updateConfig }) => {
                updateConfig({
                    vite: {
                        // The core's components and helpers use astro:content and @site/, so the build must process them (in every
                        // build environment: server, prerender).
                        resolve: { alias: [{ find: /^@site\//, replacement: fileURLToPath(new URL('./src/', config.root)) }], noExternal: ['@investorade/site-cms-core'] },
                        ssr: { noExternal: ['@investorade/site-cms-core'] },
                    },
                });
            },
        },
    };
}
export default function siteCmsCore(options) {
    return [setup(), seoFiles(), formsCheck(), contentRules(options)];
}
