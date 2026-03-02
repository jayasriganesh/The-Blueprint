import React from 'react';
import { Bookmark, BookOpen, ExternalLink, Trash2, Github, LayoutGrid, Cpu, Rocket, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { branches } from '../data/config';

function VaultPage({ savedItems, onRemove }) {
    if (savedItems.length === 0) {
        return (
            <div className="vault-empty animate-fade-in">
                <div className="vault-empty-icon vault-accent-icon">
                    <Bookmark size={40} className="icon-filled" />
                </div>
                <h2 className="font-heading" style={{ fontSize: '28px', marginBottom: '8px' }}>Your Vault is Empty</h2>
                <p className="text-dim" style={{ fontSize: '14px' }}>Bookmark research papers and repositories to keep them here.</p>
            </div>
        );
    }

    // Branch Meta Mapping
    const branchMeta = {
        cs: { icon: <Cpu size={14} />, name: 'Comp. Science' },
        mech: { icon: <Rocket size={14} />, name: 'Mechanical' },
        civil: { icon: <Building2 size={14} />, name: 'Civil' },
        elec: { icon: <LayoutGrid size={14} />, name: 'Electrical' }
    };

    // Grouping items by category
    const groupedItems = savedItems.reduce((acc, item) => {
        const cat = item.branchId || 'uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'uncategorized') return 1;
        if (b === 'uncategorized') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="vault-page animate-fade-in">
            <div className="vault-header">
                <div>
                    <h2 className="font-heading" style={{ fontSize: '32px' }}>Personal Vault</h2>
                    <p className="text-dim" style={{ fontSize: '13px' }}>Your curated engineering archive.</p>
                </div>
                <span className="vault-count">{savedItems.length} items</span>
            </div>

            <AnimatePresence>
                {sortedCategories.map((catId) => {
                    const items = groupedItems[catId];
                    const meta = branchMeta[catId] || { icon: <Bookmark size={14} />, name: 'General Archives' };

                    return (
                        <div key={catId} className="vault-group" style={{ '--branch-accent': `var(--color-${catId})` }}>
                            <p className="vault-group-label">
                                {meta.icon}
                                <span>{meta.name}</span>
                            </p>

                            <div className="vertical-stack" style={{ gap: '12px' }}>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="card-premium vault-card"
                                    >
                                        <div className="vault-card-main">
                                            <div className="vault-paper-meta" style={{ marginBottom: '8px' }}>
                                                <span className="source-tag">
                                                    {item.source || 'GitHub'}
                                                </span>
                                                {item.date && <span className="date-tag" style={{ marginLeft: '12px', fontSize: '10px', opacity: 0.6 }}>{item.date}</span>}
                                            </div>
                                            <p className="vault-item-title">{item.name || item.title}</p>
                                            {item.authors && <p className="paper-authors" style={{ margin: '4px 0', opacity: 0.8 }}>{item.authors}</p>}
                                            <div className="vault-item-meta" style={{ marginTop: '8px' }}>
                                                {item.language && <span className="repo-lang" style={{ fontSize: '10px' }}>{item.language}</span>}
                                                {item.stars && <span className="text-dim" style={{ fontSize: '10px' }}>★ {item.stars}</span>}
                                            </div>
                                        </div>
                                        <div className="vault-card-actions">
                                            <a href={item.url} target="_blank" rel="noreferrer" className="vault-action-btn icon-accent">
                                                <ExternalLink size={15} />
                                            </a>
                                            <button className="vault-action-btn vault-remove-btn" onClick={() => onRemove(item.id)}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export default VaultPage;
