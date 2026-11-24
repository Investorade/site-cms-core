const SITE_FILES = new Set(['/admin/content-rules.json', '/admin/seo-report.json']);
const CONNECTOR_PATH = /^\/(admin\/mcp(\/.*)?|\.well-known\/oauth-(protected-resource|authorization-server)(\/.*)?)$/;
export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);
        if (!CONNECTOR_PATH.test(pathname))
            return env.ASSETS.fetch(request);
        const headers = new Headers(request.headers);
        headers.delete('Cookie');
        const forward = new Request(request, { headers });
        const siteFile = async (path) => SITE_FILES.has(path) ? env.ASSETS.fetch(new Request(new URL(path, request.url))) : new Response('Not found', { status: 404 });
        return env.CMS_MCP.serve(forward, siteFile);
    },
};
