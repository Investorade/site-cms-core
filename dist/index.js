import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cmsConfig from "./cms-config.js";
import contentRules from "./integrations/content-rules.js";
import formsCheck from "./integrations/forms-check.js";
import seoFiles from "./integrations/seo-files.js";
export { readCmsConfig, cmsConfigYaml } from "./cms-config.js";
function setup() {
    return {
        name: 'site-cms-core',
        hooks: {
            'astro:config:setup': ({ config, updateConfig }) => {
                const popupsFile = fileURLToPath(new URL('./src/data/popups.json', config.root));
                updateConfig({
                    vite: {
                        // virtual:site-cms-core/popups: the site's src/data/popups.json, or {} when it has none.
                        plugins: [
                            {
                                name: 'site-cms-core/popups',
                                resolveId: (id) => (id === 'virtual:site-cms-core/popups' ? '\0site-cms-core-popups' : undefined),
                                load: (id) => {
                                    if (id !== '\0site-cms-core-popups')
                                        return undefined;
                                    return `export default ${fs.existsSync(popupsFile) ? fs.readFileSync(popupsFile, 'utf8') : '{}'};`;
                                },
                            },
                        ],
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
    return [setup(), cmsConfig(), seoFiles(), formsCheck(), contentRules(options)];
}
