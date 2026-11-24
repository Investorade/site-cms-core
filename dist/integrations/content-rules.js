import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import YAML from 'yaml';
import { readCmsConfig } from "../cms-config.js";
/**
 * Writes dist/admin/content-rules.json: what a page and a blog post may contain, for the CMS's AI connector
 * (dadscampgrounds-cms-auth, /admin/mcp on the park's address). It checks every page or post an AI writes against
 * these rules before saving, so nothing the site's build would reject (or a section that doesn't exist) is committed.
 *
 * - `schema`: the front matter as JSON Schema, made from the same Zod schemas the site builds with
 *   (src/lib/content-schemas.ts).
 * - `cms`: the CMS fields from the CMS config (cms/*.yml) (labels, hints, select options), so the AI knows what each
 *   section and field is for, and select fields (icons, looks) only take the CMS's choices.
 * - Where things live: content folders, the media folder, the redirects and menu files, reserved addresses.
 * - `settings`: the Site settings files an AI may change (only for people given "Site settings too" by an admin), with
 *   their CMS fields and the parts that stay locked (form recipients, tracking, logos…). The AI connector's own switch
 *   (ai.json) is never in this list.
 */
/**
 * Site settings an AI may change (by the settings entry's name in the CMS config (cms/*.yml)), and what stays locked in
 * each: dot paths, where * is any key or list item. Locked parts are kept as they are and hidden from the AI. Files
 * not listed here (ai.json above all) can't be changed by an AI.
 */
const FORM_LOCKS = ['form.name', 'form.endpoint', 'form.redirect', 'form.turnstile', 'form.notifications'];
const AI_SETTINGS = {
    site: ['url', 'discourage_search_engines', 'locale', 'language', 'favicon', 'tracking', 'schema.logo'],
    navigation: [],
    header: ['logo'],
    footer: ['logo', 'holdings'],
    cta: [],
    redirects: [],
    'not-found': [],
    // Forms: the texts and fields may change; where leads go (and the spam check) may not.
    popups: FORM_LOCKS.flatMap((p) => [`book_now.${p}`, `exit_intent.${p}`, `page_forms.*.${p}`]).concat(['book_now.id', 'exit_intent.id', 'page_forms.*.id']),
    chat: ['id', 'endpoint', 'redirect', 'notifications'],
};
function simplifyField(raw) {
    const field = { name: String(raw.name) };
    for (const key of ['label', 'widget', 'hint', 'required', 'default'])
        if (raw[key] !== undefined)
            field[key] = raw[key];
    if (Array.isArray(raw.options))
        field.options = raw.options.map((o) => (o && typeof o === 'object' ? { value: o.value, label: o.label } : { value: o }));
    if (Array.isArray(raw.fields))
        field.fields = raw.fields.map((f) => simplifyField(f));
    if (raw.field && typeof raw.field === 'object')
        field.fields = [simplifyField(raw.field)];
    if (Array.isArray(raw.types))
        field.types = raw.types.map((t) => {
            const type = t;
            return { name: String(type.name), label: type.label, fields: (type.fields ?? []).map(simplifyField) };
        });
    return field;
}
/**
 * A settings field for the AI connector's checks: like simplifyField, but a list of plain values keeps its one `field`
 * (so it isn't mistaken for a list of objects), and url/email types and patterns are kept.
 */
function settingsField(raw) {
    const field = { ...simplifyField(raw) };
    delete field.fields;
    if (Array.isArray(raw.fields))
        field.fields = raw.fields.map((f) => settingsField(f));
    if (raw.field && typeof raw.field === 'object')
        field.field = settingsField(raw.field);
    if (typeof raw.type === 'string')
        field.type = raw.type;
    if (Array.isArray(raw.pattern))
        field.pattern = raw.pattern;
    return field;
}
const jsonSchema = (schema) => z.toJSONSchema(schema, {
    io: 'input',
    unrepresentable: 'any',
    // Dates (z.coerce.date) are written as "YYYY-MM-DD" in the front matter.
    override: (ctx) => {
        const def = ctx.zodSchema._zod.def;
        if (def.type === 'date')
            Object.assign(ctx.jsonSchema, { type: 'string', format: 'date' });
    },
});
// Only the title is required (the build fills in the rest, see content-schemas.ts); Zod lists fields with fallbacks as required.
const titleOnly = (schema) => ({ ...schema, required: ['title'] });
export default function contentRules({ schemas }) {
    return {
        name: 'content-rules',
        hooks: {
            // Pages and posts share the site root, so no two may have the same address. The CMS stops this on save; this
            // catches the rest (files edited directly). Astro itself only warns when two posts share a URL slug, and drops one.
            'astro:build:start': () => {
                const root = process.cwd();
                const seen = new Map();
                const problems = [];
                const reserved = new Set(['admin', 'api', 'kit', 'uploads', '_astro']);
                for (const [folder, label, useSlug] of [['src/content/pages', 'page', false], ['src/content/posts', 'post', true]]) {
                    const dir = path.join(root, folder);
                    if (!fs.existsSync(dir))
                        continue;
                    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
                        const base = name.slice(0, -3);
                        if (folder.endsWith('pages') && base === 'index')
                            continue;
                        const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(path.join(dir, name), 'utf8'));
                        const data = (fm ? YAML.parse(fm[1]) : {});
                        const address = String((useSlug && typeof data.slug === 'string' && data.slug.trim()) || base).toLowerCase();
                        const where = `${folder}/${name}`;
                        if (reserved.has(address))
                            problems.push(`The ${label} ${where} has the address /${address}/, which the site uses itself.`);
                        if (seen.has(address))
                            problems.push(`The ${label} ${where} has the address /${address}/, which ${seen.get(address)} already uses.`);
                        else
                            seen.set(address, where);
                    }
                }
                if (problems.length)
                    throw new Error(`Two pages can't share an address. Change one of them in the CMS (title or URL slug):\n- ${problems.join('\n- ')}`);
            },
            'astro:build:done': ({ dir, logger }) => {
                const root = process.cwd();
                const outDir = fileURLToPath(dir);
                const config = readCmsConfig(root);
                const collection = (name) => config.collections.find((c) => c.name === name);
                const cmsFields = (name) => (collection(name)?.fields ?? []).map(simplifyField);
                const settingsFiles = (collection('settings')?.files ?? []).filter((f) => f.name !== 'ai' && AI_SETTINGS[String(f.name)]);
                const settings = settingsFiles.map((f) => ({
                    name: String(f.name),
                    label: f.label,
                    file: String(f.file),
                    locked: AI_SETTINGS[String(f.name)],
                    cms: (f.fields ?? []).map(settingsField),
                }));
                // Taken addresses that aren't pages or posts: build files (robots.txt, sitemap.xml…) and folders without a page.
                const reserved = fs
                    .readdirSync(outDir, { withFileTypes: true })
                    .filter((e) => (e.isDirectory() ? !fs.existsSync(path.join(outDir, e.name, 'index.html')) : !e.name.endsWith('.html')))
                    .map((e) => e.name.replace(/\.[a-z0-9]+$/i, ''));
                const rules = {
                    version: 1,
                    builtAt: new Date().toISOString(),
                    collections: {
                        pages: {
                            folder: 'src/content/pages',
                            // The home page is index.md (/); every other page is /<file name>/.
                            address: '/{file}/',
                            home: 'index',
                            // Pages built by their own route (blog.md is the /blog/ list): they can't be deleted through the connector.
                            protected: ['blog'],
                            body: false,
                            schema: titleOnly(jsonSchema(schemas.pages)),
                            cms: cmsFields('pages'),
                        },
                        posts: {
                            folder: 'src/content/posts',
                            // /<slug>/: the front matter's slug when set, otherwise the file name.
                            address: '/{slug|file}/',
                            body: 'markdown',
                            schema: titleOnly(jsonSchema(schemas.posts)),
                            cms: cmsFields('posts'),
                        },
                    },
                    media: { folder: config.media_folder ?? 'public/uploads', public: config.public_folder ?? '/uploads' },
                    redirects: 'src/data/redirects.json',
                    menus: ['src/data/navigation.json'],
                    settings,
                    // Addresses that are taken by something other than a page or post (folders and files the build makes).
                    reserved: [...new Set(['admin', 'blog', 'uploads', 'api', 'kit', ...reserved])].sort(),
                };
                fs.mkdirSync(path.join(outDir, 'admin'), { recursive: true });
                fs.writeFileSync(path.join(outDir, 'admin/content-rules.json'), JSON.stringify(rules));
                logger.info(`admin/content-rules.json: page and post rules for the CMS's AI connector.`);
            },
        },
    };
}
