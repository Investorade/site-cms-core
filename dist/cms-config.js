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
    // What this site uses (cms/features.yml): the blog and the AI connector settings only when switched on.
    const profile = readSiteProfile(root);
    if (!profile.features.ai_connector)
        settings.files = settings.files.filter((f) => f.name !== 'ai');
    const config = {
        ...base,
        backend: { ...base.backend, ...siteBackend },
        ...siteTop,
        collections: [pages, ...(profile.features.blog ? [posts] : []), ...siteCollections, { divider: true }, settings],
    };
    return fillWording(config, wordingFor(root, profile));
}
/**
 * The site's cms/features.yml: its type and which shared parts it uses. Without the file a site is a "business" site
 * with the blog and the AI connector and without pop-ups. (Sites made before 1.3.0 get the file from the 1.3.0
 * update, as "park" sites.)
 *
 *   site_type: park            # park | business: the examples in the CMS's hints
 *   features:
 *     blog: true               # the Blog collection
 *     popups: true             # Book Now / exit pop-ups: #book-now in link hints
 *     ai_connector: true       # Site settings → AI connector
 *   wording:                   # optional: replace any hint example from the core's cms/wording.yml
 *     image_alt_example: "…"
 */
export function readSiteProfile(root) {
    const file = path.join(root, 'cms', 'features.yml');
    const raw = (fs.existsSync(file) ? readYaml(file) : {});
    if (raw !== null && !isObj(raw))
        throw new Error('cms/features.yml must hold settings (site_type:, features: …), not a list.');
    const data = raw ?? {};
    const type = data.site_type ?? 'business';
    if (type !== 'park' && type !== 'business')
        throw new Error(`cms/features.yml: site_type must be park or business, not "${String(type)}".`);
    const features = (data.features ?? {});
    if (!isObj(features))
        throw new Error('cms/features.yml: features must be a list of switches (blog: true …).');
    for (const [key, value] of Object.entries(features)) {
        if (!['blog', 'popups', 'ai_connector'].includes(key))
            throw new Error(`cms/features.yml: unknown feature "${key}" (there are blog, popups, ai_connector).`);
        if (typeof value !== 'boolean')
            throw new Error(`cms/features.yml: ${key} must be true or false.`);
    }
    const wording = (data.wording ?? {});
    if (!isObj(wording) || Object.values(wording).some((v) => typeof v !== 'string'))
        throw new Error('cms/features.yml: wording must map names to texts.');
    return {
        site_type: type,
        features: {
            blog: features.blog !== false,
            popups: typeof features.popups === 'boolean' ? features.popups : type === 'park',
            ai_connector: features.ai_connector !== false,
        },
        wording: wording,
    };
}
const slug = (v) => v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/** The texts for [[name]] in the core's CMS files: the type's examples (cms/wording.yml), the site's own, and the
 * feature-dependent bits. {name}, {city} and {region} in them come from the site's src/data/site.json. */
function wordingFor(root, profile) {
    const table = readYaml(path.join(coreDir, 'wording.yml'));
    const popups = profile.features.popups;
    const words = {
        ...table[profile.site_type],
        ...profile.wording,
        or_popup_link: popups ? ', or #book-now to open the Book Now popup' : '',
        popup_link_sentence: popups ? ' Use #book-now to open the Book Now popup.' : '',
        link_choices: popups ? ', a full URL or #book-now' : ' or a full URL',
    };
    let info = {};
    try {
        info = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'site.json'), 'utf8'));
    }
    catch {
        // No site.json: the placeholders stay generic.
    }
    const city = info.address?.city || 'your city';
    const region = info.address?.region || '';
    const values = { name: info.name || 'your business', city, region, 'city-slug': slug(city), 'region-slug': slug(region) };
    for (const key of Object.keys(words))
        words[key] = words[key].replace(/\{([\w-]+)\}/g, (m, k) => values[k] ?? m).replace(/ +/g, ' ').replace(/-+\//g, '/');
    return words;
}
function fillWording(value, words) {
    if (typeof value === 'string')
        return value.replace(/\[\[([\w-]+)\]\]/g, (_, key) => {
            if (!(key in words))
                throw new Error(`The CMS core's config uses [[${key}]], which cms/wording.yml doesn't define.`);
            return words[key];
        });
    if (Array.isArray(value))
        return value.map((v) => fillWording(v, words));
    if (isObj(value))
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillWording(v, words)]));
    return value;
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
