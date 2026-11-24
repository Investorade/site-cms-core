/** Split CMS text into paragraphs on blank lines. */
export function paragraphs(text) {
    return text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
}
