/**
 * arXiv Research Service
 * Fetches latest papers from arXiv via their Atom/XML API.
 * 
 * NOTE: arXiv blocks direct browser requests due to CORS.
 * We route through corsproxy.io which handles the server-side fetch.
 */

const CORS_PROXY = 'https://corsproxy.io/?';

const parseEntries = (text, extra = {}) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');
    return Array.from(entries).map(entry => {
        const title = entry.getElementsByTagName('title')[0]?.textContent.trim() || '';
        const summary = entry.getElementsByTagName('summary')[0]?.textContent.trim() || '';
        const id = entry.getElementsByTagName('id')[0]?.textContent.trim() || '';
        const published = entry.getElementsByTagName('published')[0]?.textContent.trim() || '';
        const authors = Array.from(entry.getElementsByTagName('author'))
            .map(a => a.getElementsByTagName('name')[0]?.textContent)
            .filter(Boolean)
            .join(', ');
        return {
            id,
            title,
            abstract: summary,
            authors,
            date: published ? new Date(published).toLocaleDateString() : '—',
            url: id.replace('http://', 'https://'),
            source: 'arXiv',
            ...extra
        };
    });
};

export const fetchResearchPapers = async (category) => {
    try {
        const arxivUrl = `https://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
        const response = await fetch(CORS_PROXY + encodeURIComponent(arxivUrl));
        if (!response.ok) throw new Error('arXiv API failed');
        const text = await response.text();
        return parseEntries(text);
    } catch (error) {
        console.error('Error fetching arXiv papers:', error);
        return [];
    }
};

export const searchPapers = async (query) => {
    try {
        const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=8&sortBy=relevance&sortOrder=descending`;
        const response = await fetch(CORS_PROXY + encodeURIComponent(arxivUrl));
        if (!response.ok) throw new Error('arXiv Search API failed');
        const text = await response.text();
        return parseEntries(text, { type: 'paper' });
    } catch (error) {
        console.error('Error searching arXiv papers:', error);
        return [];
    }
};
