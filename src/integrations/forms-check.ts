import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

/**
 * Checks the forms' "Lead emails & webhooks" (a `notifications` block inside each form's settings in src/data/*.json,
 * e.g. popups.json → book_now.form.notifications, chat-assistant.json → notifications). The shared forms service
 * (forms.dadscampgrounds.com) reads them from the repo; they must never reach the website.
 *
 * - Before the build: every address must be a valid email and every webhook an https URL, or the build stops with the
 *   form and field named, so a typo never goes live.
 * - After the build: no recipient address or webhook URL may appear anywhere in the built site; if one does (e.g. a
 *   component started passing the whole settings object to the page), the build fails.
 */

interface Notifications {
	email_to?: string;
	email_cc?: string;
	email_bcc?: string;
	webhooks?: { name?: string; url?: string }[];
}

const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]+$/;
const split = (value: unknown) =>
	String(value ?? '')
		.split(',')
		.map((e) => e.trim())
		.filter(Boolean);

/** Every `notifications` block in the site's data files, with where it is. */
function findBlocks(dataDir: string): { where: string; block: Notifications }[] {
	const found: { where: string; block: Notifications }[] = [];
	const walk = (value: unknown, where: string) => {
		if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${where}[${i}]`));
		else if (value && typeof value === 'object') {
			for (const [key, v] of Object.entries(value)) {
				if (key === 'notifications' && v && typeof v === 'object') found.push({ where: `${where}.notifications`, block: v as Notifications });
				else walk(v, `${where}.${key}`);
			}
		}
	};
	for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
		walk(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
	}
	return found;
}

/** Where a form has the Turnstile spam check turned on (`"turnstile": true`). */
function findTurnstileForms(dataDir: string): string[] {
	const found: string[] = [];
	const walk = (value: unknown, where: string) => {
		if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${where}[${i}]`));
		else if (value && typeof value === 'object') {
			for (const [key, v] of Object.entries(value)) {
				if (key === 'turnstile' && v === true) found.push(where);
				else walk(v, `${where}.${key}`);
			}
		}
	};
	for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))) walk(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
	return found;
}

export default function formsCheck(): AstroIntegration {
	let root = process.cwd();
	let secrets: string[] = [];
	return {
		name: 'forms-check',
		hooks: {
			'astro:config:done': ({ config }) => {
				root = fileURLToPath(config.root);
			},
			'astro:build:start': ({ logger }) => {
				const errors: string[] = [];
				secrets = [];
				const blocks = findBlocks(path.join(root, 'src/data'));
				for (const { where, block } of blocks) {
					for (const field of ['email_to', 'email_cc', 'email_bcc'] as const) {
						for (const address of split(block[field])) {
							if (!EMAIL.test(address)) errors.push(`${where}.${field}: "${address}" is not a valid email address.`);
							else secrets.push(address.toLowerCase());
						}
					}
					(block.webhooks ?? []).forEach((hook, i) => {
						const url = String(hook?.url ?? '').trim();
						if (!url) return;
						if (!/^https:\/\/[^\s/]+\.[^\s]+$/i.test(url)) errors.push(`${where}.webhooks[${i}]: "${url}" must be a full https:// URL.`);
						else secrets.push(url);
					});
				}
				// A form with the spam check on needs the Turnstile site key, or its leads would be refused.
				const siteKey = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site.json'), 'utf8'))?.tracking?.turnstile_site_key;
				for (const where of findTurnstileForms(path.join(root, 'src/data'))) {
					if (!String(siteKey ?? '').trim()) errors.push(`${where}: "Spam check (Turnstile)" is on, but Site settings → Tracking → Cloudflare Turnstile site key is empty.`);
				}
				if (errors.length) throw new Error(`Fix these form settings in the CMS:\n- ${errors.join('\n- ')}`);
				logger.info(`${blocks.length} form(s) with lead emails & webhooks checked.`);
			},
			'astro:build:done': ({ dir, logger }) => {
				if (!secrets.length) return;
				const outDir = fileURLToPath(dir);
				const leaks: string[] = [];
				const walk = (d: string) => {
					for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
						const full = path.join(d, entry.name);
						if (entry.isDirectory()) {
							if (entry.name !== 'uploads') walk(full);
						} else if (/\.(html|js|mjs|json|css|txt|xml)$/i.test(entry.name)) {
							const text = fs.readFileSync(full, 'utf8').toLowerCase();
							for (const secret of secrets) if (text.includes(secret.toLowerCase())) leaks.push(`${path.relative(outDir, full)} contains ${secret}`);
						}
					}
				};
				walk(outDir);
				if (leaks.length) throw new Error(`Lead recipients or webhooks ended up in the website:\n- ${leaks.join('\n- ')}`);
				logger.info('No lead recipients or webhooks in the built site.');
			},
		},
	};
}
