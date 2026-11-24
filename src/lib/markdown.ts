import { marked } from 'marked';
import { sanitizeHtml } from './sanitize-html.ts';

/**
 * CMS text (Markdown, line breaks kept) as HTML for set:html, cleaned (src/lib/sanitize-html.ts): every section that
 * shows Markdown text goes through here.
 */
export const md = (text?: string | null): string => (text ? sanitizeHtml(marked.parse(text, { async: false, breaks: true }) as string) : '');
