import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, Star, Download, Heart, BookOpen, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchRepos } from '../services/github';
import { searchPapers } from '../services/research';
import { searchModels } from '../services/huggingface';
import { branches } from '../data/config';

// Flat list of quick-search topic chips from all branches
const TOPIC_CHIPS = [
    ...branches.flatMap(b => b.keywords.map(k => ({ label: k, branch: b.id, color: b.color })))
];

const TABS = ['All', 'Repos', 'Papers', 'Models'];

function ModelCard({ model, isBookmarked, onToggleBookmark }) {
    return (
        <motion.div
            className="card-premium explore-model-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
            <div className="model-header">
                <span className="model-task-tag">{model.task}</span>
                <div className="card-actions-row">
                    <button
                        className={`btn-icon-sm ${isBookmarked ? 'btn-saved' : ''}`}
                        onClick={() => onToggleBookmark(model)}
                        title={isBookmarked ? 'Saved to Vault' : 'Save to Vault'}
                    >
                        <Bookmark
                            size={14}
                            className={isBookmarked ? 'icon-filled' : 'text-dim'}
                        />
                    </button>
                    <a href={model.url} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} className="text-dim" />
                    </a>
                </div>
            </div>
            <p className="model-id">{model.modelId}</p>
            <p className="model-author text-dim">{model.author}</p>
            <div className="model-stats">
                <span><Download size={12} /> {(model.downloads / 1000).toFixed(0)}k</span>
                <span><Heart size={12} /> {model.likes}</span>
            </div>
        </motion.div>
    );
}

function RepoCard({ repo, isBookmarked, onToggleBookmark }) {
    return (
        <motion.div
            className="card-premium explore-repo-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
            <div className="explore-card-header">
                <span className="source-tag">GitHub</span>
                <div className="card-actions-row">
                    <button
                        className={`btn-icon-sm ${isBookmarked ? 'btn-saved' : ''}`}
                        onClick={() => onToggleBookmark(repo)}
                        title={isBookmarked ? 'Saved to Vault' : 'Save to Vault'}
                    >
                        <Bookmark
                            size={14}
                            className={isBookmarked ? 'icon-filled' : 'text-dim'}
                        />
                    </button>
                    <a href={repo.url} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} className="text-dim" />
                    </a>
                </div>
            </div>
            <h3 className="explore-item-title">{repo.name}</h3>
            <p className="explore-item-desc text-dim">{repo.description || 'No description provided.'}</p>
            <div className="explore-stats">
                <span><Star size={12} /> {repo.stars}</span>
                {repo.language && <span className="repo-lang">{repo.language}</span>}
            </div>
        </motion.div>
    );
}

function PaperCard({ paper, onSummarize, isBookmarked, onToggleBookmark }) {
    return (
        <motion.div
            className="card-premium explore-paper-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
            <div className="explore-card-header">
                <span className="source-tag">arXiv</span>
                <div className="card-actions-row">
                    <button
                        className={`btn-icon-sm ${isBookmarked ? 'btn-saved' : ''}`}
                        onClick={() => onToggleBookmark(paper)}
                        title={isBookmarked ? 'Saved to Vault' : 'Save to Vault'}
                    >
                        <Bookmark
                            size={14}
                            className={isBookmarked ? 'icon-filled' : 'text-dim'}
                        />
                    </button>
                    <a href={paper.url} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} className="text-dim" />
                    </a>
                </div>
            </div>
            <h3 className="explore-item-title">{paper.title}</h3>
            <p className="paper-authors">{paper.authors}</p>
            <div className="explore-actions">
                <button className="btn-summarize" onClick={() => onSummarize(paper)}>
                    <BookOpen size={14} />
                    <span>Summarize</span>
                </button>
            </div>
        </motion.div>
    );
}

function ExplorePage({ onSummarize, onToggleBookmark, isBookmarked }) {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [repos, setRepos] = useState([]);
    const [papers, setPapers] = useState([]);
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef(null);

    const runSearch = async (q) => {
        if (!q.trim()) {
            setRepos([]); setPapers([]); setModels([]);
            setHasSearched(false);
            return;
        }
        setLoading(true);
        setHasSearched(true);
        const [r, p, m] = await Promise.all([
            searchRepos(q),
            searchPapers(q),
            searchModels(q),
        ]);
        setRepos(r);
        setPapers(p);
        setModels(m);
        setLoading(false);
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(val), 500);
    };

    const handleChip = (label) => {
        setQuery(label);
        runSearch(label);
    };

    const clearSearch = () => {
        setQuery('');
        setRepos([]); setPapers([]); setModels([]);
        setHasSearched(false);
    };

    const allResults = [
        ...repos.map(r => ({ ...r, _type: 'repo' })),
        ...papers.map(p => ({ ...p, _type: 'paper' })),
        ...models.map(m => ({ ...m, _type: 'model' })),
    ];

    const displayed = activeTab === 'All' ? allResults
        : activeTab === 'Repos' ? repos.map(r => ({ ...r, _type: 'repo' }))
            : activeTab === 'Papers' ? papers.map(p => ({ ...p, _type: 'paper' }))
                : models.map(m => ({ ...m, _type: 'model' }));

    const tabCounts = {
        All: allResults.length,
        Repos: repos.length,
        Papers: papers.length,
        Models: models.length,
    };

    return (
        <div className="explore-page animate-fade-in">
            <h2 className="font-heading explore-title">Explore the Archive</h2>

            {/* Search Bar */}
            <div className="explore-search-bar">
                <Search size={18} className="search-icon text-dim" />
                <input
                    className="explore-input"
                    type="text"
                    placeholder="Search papers, models, repos..."
                    value={query}
                    onChange={handleInput}
                    autoFocus
                />
                {query && (
                    <button className="search-clear-btn" onClick={clearSearch}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Topic Chips */}
            {!hasSearched && (
                <div className="topic-chips-row">
                    {TOPIC_CHIPS.map(chip => (
                        <button
                            key={chip.label}
                            className="topic-chip"
                            style={{ '--chip-color': chip.color }}
                            onClick={() => handleChip(chip.label)}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabs */}
            {hasSearched && (
                <div className="explore-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`explore-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                            {tabCounts[tab] > 0 && (
                                <span className="tab-count">{tabCounts[tab]}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="vertical-stack" style={{ marginTop: '24px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="shimmer card-premium" style={{ height: '100px' }} />
                    ))}
                </div>
            ) : hasSearched && displayed.length === 0 ? (
                <div className="explore-empty">
                    <p className="text-dim">No results found for "{query}"</p>
                </div>
            ) : (
                <div className="explore-results">
                    <AnimatePresence>
                        {displayed.map((item, idx) => {
                            const bookmarked = isBookmarked(item.id);
                            if (item._type === 'model') return <ModelCard key={item.id + idx} model={item} isBookmarked={bookmarked} onToggleBookmark={onToggleBookmark} />;
                            if (item._type === 'repo') return <RepoCard key={item.id + idx} repo={item} isBookmarked={bookmarked} onToggleBookmark={onToggleBookmark} />;
                            if (item._type === 'paper') return <PaperCard key={item.id + idx} paper={item} onSummarize={onSummarize} isBookmarked={bookmarked} onToggleBookmark={onToggleBookmark} />;
                            return null;
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default ExplorePage;
