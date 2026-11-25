/**
 * The site's Worker (sites on Cloudflare Workers; sites on Cloudflare Pages use ./pages-function.ts). Almost everything is static files (Cloudflare serves dist/ before this runs). Only the AI
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
export interface Env {
    ASSETS: Fetcher;
    CMS_MCP: Fetcher & {
        serve(request: Request, siteFile: (path: string) => Promise<Response>): Promise<Response>;
    };
}
/** Whether a path is one of the AI connector's (the rest of the site is static files). */
export declare const isConnectorPath: (pathname: string) => boolean;
/** Pass an AI connector request (without cookies) to the CMS login, with the two built files it may read. */
export declare function serveConnector(request: Request, env: Env): Promise<Response>;
declare const _default: {
    fetch(request: Request, env: Env): Promise<Response>;
};
export default _default;
