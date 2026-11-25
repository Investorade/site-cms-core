import { isConnectorPath, serveConnector, type Env } from './worker.ts';

/**
 * The AI connector for sites on Cloudflare Pages (a site whose domain's DNS is outside Cloudflare can't use Workers).
 * The site adds it as its root middleware and lets Pages run Functions only for the connector's paths (and its own
 * routes, e.g. a form handler):
 *
 *   // functions/_middleware.js
 *   export { onRequest } from '@investorade/site-cms-core/pages';
 *
 *   // public/_routes.json
 *   { "version": 1, "include": ["/admin/mcp", "/admin/mcp/*", "/.well-known/oauth-*", "/api/*"], "exclude": [] }
 *
 * and the service binding CMS_MCP → Worker dadscampgrounds-cms-auth, entrypoint ParkMcp (Pages project → Settings →
 * Bindings, or wrangler.toml [[services]]). Everything else goes on to the next Function or the static files.
 */
interface PagesContext {
	request: Request;
	env: Env;
	next: () => Promise<Response>;
}

export const onRequest = async ({ request, env, next }: PagesContext): Promise<Response> =>
	isConnectorPath(new URL(request.url).pathname) ? serveConnector(request, env) : next();
