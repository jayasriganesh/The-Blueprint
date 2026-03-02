/**
 * Hugging Face Hub Service
 * Searches publicly available models, datasets, and papers — no API key required.
 */

export const fetchHFPapers = async (query = 'machine learning') => {
    try {
        // HF daily papers list — always fresh, no query needed for CS/ML
        const url = `https://huggingface.co/api/papers?limit=6`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('HuggingFace Papers API failed');
        const data = await response.json();
        const papers = Array.isArray(data) ? data : (data.papers || []);
        return papers.slice(0, 6).map(paper => ({
            id: paper.id || paper.arxivId || paper.paper?.id || String(Math.random()),
            title: paper.title || paper.paper?.title || 'Untitled',
            abstract: paper.abstract || paper.paper?.summary || '',
            authors: (paper.authors || paper.paper?.authors || []).map(a => a.name || a).join(', '),
            date: paper.publishedAt
                ? new Date(paper.publishedAt).toLocaleDateString()
                : paper.submittedOnDate || '—',
            url: `https://huggingface.co/papers/${paper.id || paper.arxivId || paper.paper?.id}`,
            source: 'HF Papers',
            type: 'paper'
        }));
    } catch (error) {
        console.error('Error fetching HuggingFace papers:', error);
        return [];
    }
};

export const searchModels = async (query) => {
    try {
        const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=8&sort=downloads&direction=-1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Hugging Face API failed');
        const data = await response.json();
        return data.map(model => ({
            id: model.id || model.modelId,
            modelId: model.modelId || model.id,
            author: model.author || model.modelId?.split('/')[0] || 'Community',
            downloads: model.downloads ?? 0,
            likes: model.likes ?? 0,
            task: model.pipeline_tag || 'General',
            url: `https://huggingface.co/${model.modelId || model.id}`,
            lastModified: model.lastModified ? new Date(model.lastModified).toLocaleDateString() : '—',
            type: 'model'
        }));
    } catch (error) {
        console.error('Error fetching HuggingFace models:', error);
        return [];
    }
};

export const searchDatasets = async (query) => {
    try {
        const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=4&sort=downloads&direction=-1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Hugging Face Datasets API failed');
        const data = await response.json();
        return data.map(ds => ({
            id: ds.id || ds.datasetId,
            modelId: ds.id || ds.datasetId,
            author: ds.author || ds.id?.split('/')[0] || 'Community',
            downloads: ds.downloads ?? 0,
            likes: ds.likes ?? 0,
            task: 'Dataset',
            url: `https://huggingface.co/datasets/${ds.id || ds.datasetId}`,
            lastModified: ds.lastModified ? new Date(ds.lastModified).toLocaleDateString() : '—',
            type: 'model'
        }));
    } catch (error) {
        console.error('Error fetching HuggingFace datasets:', error);
        return [];
    }
};
