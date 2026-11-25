const SITE_FILES = new Set(['/admin/content-rules.json', '/admin/seo-report.json']);
const CONNECTOR_PATH = /^\/(admin\/mcp(\/.*)?|\.well-known\/oauth-(protected-resource|authorization-server)(\/.*)?)$/;
/** Whether a path is one of the AI connector's (the rest of the site is static files). */
export const isConnectorPath = (pathname) => CONNECTOR_PATH.test(pathname);
/** Pass an AI connector request (without cookies) to the CMS login, with the two built files it may read. */
export function serveConnector(request, env) {
    const headers = new Headers(request.headers);
    headers.delete('Cookie');
    const forward = new Request(request, { headers });
    const siteFile = async (path) => SITE_FILES.has(path) ? env.ASSETS.fetch(new Request(new URL(path, request.url))) : new Response('Not found', { status: 404 });
    return env.CMS_MCP.serve(forward, siteFile);
}
export default {
    async fetch(request, env) {
        if (!isConnectorPath(new URL(request.url).pathname))
            return env.ASSETS.fetch(request);
        return serveConnector(request, env);
    },
};
