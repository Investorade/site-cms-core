import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
const coreDir = fileURLToPath(new URL('../cms/', import.meta.url));
const HEADER = `# Made by the CMS core (@investorade/site-cms-core) when the site builds. Don't edit this file:
# change the site's cms/*.yml (sections, its own Site settings, repo, CMS title) or the core's cms/*.yml.
`;
function readYaml(file, fields) {
    const customTags = [
        {
            tag: '!core',
            resolve(name) {
                if (!fields || !(name in fields))
                    throw new Error(`"!core ${name}" is not a shared field set. There are: ${Object.keys(fields ?? {}).join(', ')}.`);
                return structuredClone(fields[name]);
            },
        },
    ];
    try {
        return YAML.parse(fs.readFileSync(file, 'utf8'), { customTags });
    }
    catch (error) {
        throw new Error(`The CMS config file ${file} is not valid: ${error.message}`);
    }
}
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
/** The site's CMS config as data. `root` is the site's folder. */
export function readCmsConfig(root) {
    const siteDir = path.join(root, 'cms');
    const fields = readYaml(path.join(coreDir, 'fields.yml'));
    const core = (name) => readYaml(path.join(coreDir, name), fields);
    const site = (name, required = false) => {
        const file = path.join(siteDir, name);
        if (!fs.existsSync(file)) {
            if (required)
                throw new Error(`The site's CMS config is missing: ${file}. See the site-cms-core README ("CMS config").`);
            return undefined;
        }
        return readYaml(file, fields);
    };
    const base = core('base.yml');
    const pages = core('pages.yml');
    const posts = core('posts.yml');
    const settings = core('settings.yml');
    const siteConfig = (site('site.yml', true) ?? {});
    const sections = site('sections.yml') ?? [];
    const siteSettings = site('settings.yml') ?? [];
    if (!isObj(siteConfig))
        throw new Error('cms/site.yml must hold settings (backend:, app_title: …), not a list.');
    if (!Array.isArray(sections))
        throw new Error('cms/sections.yml must be a list of section types (- name: hero …).');
    if (!Array.isArray(siteSettings))
        throw new Error('cms/settings.yml must be a list of Site settings files (- name: header …).');
    const { backend: siteBackend, collections: siteCollections = [], ...siteTop } = siteConfig;
    if (!isObj(siteBackend) || typeof siteBackend.repo !== 'string')
        throw new Error('cms/site.yml needs the GitHub repo: backend: { repo: Owner/name }.');
    if (!Array.isArray(siteCollections))
        throw new Error('cms/site.yml: collections must be a list.');
    // Page sections: the site's types. A site without sections has no "Page sections" field.
    const pageFields = pages.fields;
    const blocks = pageFields.find((f) => f.name === 'content_blocks');
    if (blocks) {
        if (sections.length)
            blocks.types = sections;
        else
            pageFields.splice(pageFields.indexOf(blocks), 1);
    }
    settings.files = [...(settings.files ?? []), ...siteSettings];
    const names = new Set();
    for (const file of settings.files) {
        if (names.has(String(file.name)))
            throw new Error(`Two Site settings files are called "${file.name}" (the core's and cms/settings.yml). Give the site's another name.`);
        names.add(String(file.name));
    }
    return {
        ...base,
        backend: { ...base.backend, ...siteBackend },
        ...siteTop,
        collections: [pages, posts, ...siteCollections, { divider: true }, settings],
    };
}
/** The site's /admin/config.yml as text. */
export function cmsConfigYaml(root) {
    return HEADER + '\n' + YAML.stringify(readCmsConfig(root), { lineWidth: 0 });
}
/** Serves /admin/config.yml in dev, checks it before the build and writes it to dist/admin/config.yml after. */
export default function cmsConfig() {
    let root = process.cwd();
    return {
        name: 'site-cms-core/cms-config',
        hooks: {
            'astro:config:setup': ({ config }) => {
                root = fileURLToPath(config.root);
                if (fs.existsSync(path.join(root, 'public/admin/config.yml')))
                    throw new Error("public/admin/config.yml is made by the CMS core now. Move the site's parts to cms/site.yml, cms/sections.yml and cms/settings.yml, then delete it.");
            },
            'astro:server:setup': ({ server }) => {
                server.middlewares.use((req, res, next) => {
                    if ((req.url ?? '').split('?')[0] !== '/admin/config.yml')
                        return next();
                    try {
                        const body = cmsConfigYaml(root);
                        res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
                        res.setHeader('Cache-Control', 'no-store');
                        res.end(body);
                    }
                    catch (error) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                        res.end(error.message);
                    }
                });
            },
            // Fail early (before pages are built) when a cms/*.yml file is broken.
            'astro:build:start': () => {
                readCmsConfig(root);
            },
            'astro:build:done': ({ dir, logger }) => {
                const file = path.join(fileURLToPath(dir), 'admin', 'config.yml');
                fs.mkdirSync(path.dirname(file), { recursive: true });
                fs.writeFileSync(file, cmsConfigYaml(root));
                logger.info('admin/config.yml: the CMS config (core + cms/*.yml).');
            },
        },
    };
}
