/**
 * Abstract-to-Brief Summarizer
 * For the demo, this uses an extractive approach:
 * 1. Cleans the abstract
 * 2. Extracts the first two meaningful sentences
 * 3. Prepends a "Key Insight" or "innovation" tag
 */

export const summarizeAbstract = (abstract) => {
    if (!abstract) return "No abstract available to summarize.";

    // Clean up LaTeX fragments often found in arXiv
    const cleanAbstract = abstract
        .replace(/\$.*?\$/g, '') // remove math mode
        .replace(/\[.*?\]/g, '') // remove brackets
        .replace(/[\n\r]+/g, ' ') // remove newlines
        .trim();

    // Simple sentence splitter
    const sentences = cleanAbstract.split(/(?<=[.!?])\s+/);

    // Take first 2 sentences, or 1 if it's very long
    let summary = sentences.slice(0, 2).join(' ');

    // If it's still too long, trim it to ~150 chars
    if (summary.length > 200) {
        summary = sentences[0];
    }

    // Add a "plain English" flavor
    const prefixes = [
        "Innovation: ",
        "Key Insight: ",
        "Discovery: ",
        "In short: "
    ];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    return `${randomPrefix}${summary}`;
};
