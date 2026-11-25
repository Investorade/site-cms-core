import { isConnectorPath, serveConnector } from "./worker.js";
export const onRequest = async ({ request, env, next }) => isConnectorPath(new URL(request.url).pathname) ? serveConnector(request, env) : next();
