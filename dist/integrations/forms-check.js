import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]+$/;
const split = (value) => String(value ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
/** Every `notifications` block in the site's data files, with where it is. */
function findBlocks(dataDir) {
    const found = [];
    const walk = (value, where) => {
        if (Array.isArray(value))
            value.forEach((v, i) => walk(v, `${where}[${i}]`));
        else if (value && typeof value === 'object') {
            for (const [key, v] of Object.entries(value)) {
                if (key === 'notifications' && v && typeof v === 'object')
                    found.push({ where: `${where}.notifications`, block: v });
                else
                    walk(v, `${where}.${key}`);
            }
        }
    };
    for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
        walk(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
    }
    return found;
}
/** Where a form has the Turnstile spam check turned on (`"turnstile": true`). */
function findTurnstileForms(dataDir) {
    const found = [];
    const walk = (value, where) => {
        if (Array.isArray(value))
            value.forEach((v, i) => walk(v, `${where}[${i}]`));
        else if (value && typeof value === 'object') {
            for (const [key, v] of Object.entries(value)) {
                if (key === 'turnstile' && v === true)
                    found.push(where);
                else
                    walk(v, `${where}.${key}`);
            }
        }
    };
    for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')))
        walk(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
    return found;
}
export default function formsCheck() {
    let root = process.cwd();
    let secrets = [];
    return {
        name: 'forms-check',
        hooks: {
            'astro:config:done': ({ config }) => {
                root = fileURLToPath(config.root);
            },
            'astro:build:start': ({ logger }) => {
                const errors = [];
                secrets = [];
                const blocks = findBlocks(path.join(root, 'src/data'));
                for (const { where, block } of blocks) {
                    for (const field of ['email_to', 'email_cc', 'email_bcc']) {
                        for (const address of split(block[field])) {
                            if (!EMAIL.test(address))
                                errors.push(`${where}.${field}: "${address}" is not a valid email address.`);
                            else
                                secrets.push(address.toLowerCase());
                        }
                    }
                    (block.webhooks ?? []).forEach((hook, i) => {
                        const url = String(hook?.url ?? '').trim();
                        if (!url)
                            return;
                        if (!/^https:\/\/[^\s/]+\.[^\s]+$/i.test(url))
                            errors.push(`${where}.webhooks[${i}]: "${url}" must be a full https:// URL.`);
                        else
                            secrets.push(url);
                    });
                }
                // A form with the spam check on needs the Turnstile site key, or its leads would be refused.
                const siteKey = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site.json'), 'utf8'))?.tracking?.turnstile_site_key;
                for (const where of findTurnstileForms(path.join(root, 'src/data'))) {
                    if (!String(siteKey ?? '').trim())
                        errors.push(`${where}: "Spam check (Turnstile)" is on, but Site settings → Tracking → Cloudflare Turnstile site key is empty.`);
                }
                if (errors.length)
                    throw new Error(`Fix these form settings in the CMS:\n- ${errors.join('\n- ')}`);
                logger.info(`${blocks.length} form(s) with lead emails & webhooks checked.`);
            },
            'astro:build:done': ({ dir, logger }) => {
                if (!secrets.length)
                    return;
                const outDir = fileURLToPath(dir);
                const leaks = [];
                const walk = (d) => {
                    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
                        const full = path.join(d, entry.name);
                        if (entry.isDirectory()) {
                            if (entry.name !== 'uploads')
                                walk(full);
                        }
                        else if (/\.(html|js|mjs|json|css|txt|xml)$/i.test(entry.name)) {
                            const text = fs.readFileSync(full, 'utf8').toLowerCase();
                            for (const secret of secrets)
                                if (text.includes(secret.toLowerCase()))
                                    leaks.push(`${path.relative(outDir, full)} contains ${secret}`);
                        }
                    }
                };
                walk(outDir);
                if (leaks.length)
                    throw new Error(`Lead recipients or webhooks ended up in the website:\n- ${leaks.join('\n- ')}`);
                logger.info('No lead recipients or webhooks in the built site.');
            },
        },
    };
}
