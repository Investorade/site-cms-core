/**
 * The park site's Worker. Almost everything is static files (Cloudflare serves dist/ before this runs). Only the AI
 * connector's paths come here (wrangler.jsonc → assets.run_worker_first):
 * - /admin/mcp: the MCP endpoint people add to their AI app (Claude, ChatGPT…) to work on this park's pages and posts;
 * - /.well-known/oauth-protected-resource…, /.well-known/oauth-authorization-server…: how AI apps find the sign-in.
 *
 * They're passed, without cookies, to the Dad's Campgrounds CMS login (Worker "dadscampgrounds-cms-auth", entrypoint
 * ParkMcp) over a service binding: a private connection between the two Workers. That MCP entrypoint has no public
 * address, so it can only be reached through a park's own address, and it serves the park this address belongs to.
 * The login can't fetch this site's own address (Cloudflare blocks Worker → workers.dev requests), so this Worker
 * also hands it the two built files it reads: the content rules and the SEO report. Nothing else.
 */
interface Fetcher {
	fetch(request: Request): Promise<Response>;
}

interface Env {
	ASSETS: Fetcher;
	CMS_MCP: Fetcher & { serve(request: Request, siteFile: (path: string) => Promise<Response>): Promise<Response> };
}

const SITE_FILES = new Set(['/admin/content-rules.json', '/admin/seo-report.json']);

const CONNECTOR_PATH = /^\/(admin\/mcp(\/.*)?|\.well-known\/oauth-(protected-resource|authorization-server)(\/.*)?)$/;

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (!CONNECTOR_PATH.test(pathname)) return env.ASSETS.fetch(request);
		const headers = new Headers(request.headers);
		headers.delete('Cookie');
		const forward = new Request(request, { headers });
		const siteFile = async (path: string) =>
			SITE_FILES.has(path) ? env.ASSETS.fetch(new Request(new URL(path, request.url))) : new Response('Not found', { status: 404 });
		return env.CMS_MCP.serve(forward, siteFile);
	},
};
