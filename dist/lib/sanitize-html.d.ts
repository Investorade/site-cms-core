/** http(s), mailto:, tel:, a path on the site (/…, ./…, ../…), a #anchor or ?query; nothing else (javascript:, data:…). */
export declare function isSafeUrl(value: string): boolean;
/** A free-design page's custom HTML: the design allow-list (layout tags, class and style), still nothing that runs. */
export declare const sanitizeDesignHtml: (html: string) => string;
export declare function sanitizeHtml(html: string, design?: boolean): string;
