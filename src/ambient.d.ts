// Types for modules that only exist inside a site's build (Astro's content layer and the site's own files). The site
// itself has the real types; these only let the core compile on its own.
declare module 'astro:content' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type CollectionEntry<C extends string> = any;
	export function getCollection(collection: string, filter?: (entry: any) => unknown): Promise<any[]>;
	export function getEntry(collection: string, id: string): Promise<any>;
	export function render(entry: any): Promise<any>;
}

declare module 'virtual:site-cms-core/popups' {
	const value: Record<string, { id?: string } | unknown>;
	export default value;
}

declare module '@site/*' {
	const value: any;
	export default value;
}
