import React, { useState } from 'react';
import { Bookmark, Folder, Trash2, ExternalLink, ChevronLeft, Edit2, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function VaultPage({ vaultData, onUpdateVault }) {
    const [activeListId, setActiveListId] = useState(null);
    const [editingListId, setEditingListId] = useState(null);
    const [editName, setEditName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'repos', 'papers'

    const lists = vaultData?.lists || [];
    const items = vaultData?.items || [];

    const handleRemoveItem = (id) => {
        const newData = {
            ...vaultData,
            items: items.filter(i => i.id !== id)
        };
        onUpdateVault(newData);
    };

    const handleDeleteList = (listId, e) => {
        e.stopPropagation();
        if (listId === 'default') {
            alert('Cannot delete the General Bookmarks folder.');
            return;
        }
        if (window.confirm('Delete this folder and all its bookmarks?')) {
            const newData = {
                lists: lists.filter(l => l.id !== listId),
                items: items.filter(i => i.listId !== listId)
            };
            onUpdateVault(newData);
            if (activeListId === listId) setActiveListId(null);
        }
    };

    const handleRenameSubmit = (listId, e) => {
        e.stopPropagation();
        if (!editName.trim()) {
            setEditingListId(null);
            return;
        }
        const newData = {
            ...vaultData,
            lists: lists.map(l => l.id === listId ? { ...l, name: editName.trim() } : l)
        };
        onUpdateVault(newData);
        setEditingListId(null);
    };

    const handleCreateFolderSubmit = (e) => {
        e.stopPropagation();
        if (!newFolderName.trim()) {
            setIsCreatingFolder(false);
            return;
        }
        const newListId = Date.now().toString();
        const newData = {
            ...vaultData,
            lists: [...lists, { id: newListId, name: newFolderName.trim() }]
        };
        onUpdateVault(newData);
        setIsCreatingFolder(false);
        setNewFolderName('');
    };

    // FOLDER VIEW
    if (!activeListId) {
        return (
            <div className="vault-page animate-fade-in">
                <div className="vault-header">
                    <div>
                        <h2 className="font-heading" style={{ fontSize: '32px' }}>Personal Vault</h2>
                        <p className="text-dim" style={{ fontSize: '13px' }}>Your curated engineering archive.</p>
                    </div>
                    <span className="vault-count">{items.length} total items</span>
                </div>

                <div className="folders-grid">
                    {/* Create New Folder Card */}
                    <motion.div
                        className="folder-card card-premium create-folder-card"
                        onClick={() => setIsCreatingFolder(true)}
                        whileHover={{ y: -4 }}
                        style={{ borderStyle: 'dashed', borderColor: 'var(--border-highlight)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isCreatingFolder ? (
                            <div className="folder-edit-form" onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '0 8px' }}>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    className="styled-input-sm"
                                    placeholder="Folder name..."
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderSubmit(e)}
                                    onBlur={() => { if (!newFolderName.trim()) setIsCreatingFolder(false); }}
                                />
                                <button className="btn-icon-sm text-online" onClick={handleCreateFolderSubmit}>
                                    <Check size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                                <Plus size={24} />
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>New Folder</span>
                            </div>
                        )}
                    </motion.div>

                    {lists.map(list => {
                        const listItems = items.filter(i => i.listId === list.id);
                        return (
                            <motion.div
                                key={list.id}
                                className="folder-card card-premium"
                                onClick={() => setActiveListId(list.id)}
                                whileHover={{ y: -4 }}
                            >
                                <div className="folder-icon-wrapper">
                                    <Folder size={24} className="icon-accent" />
                                </div>

                                {editingListId === list.id ? (
                                    <div className="folder-edit-form" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="styled-input-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(list.id, e)}
                                        />
                                        <button className="btn-icon-sm text-online" onClick={(e) => handleRenameSubmit(list.id, e)}>
                                            <Check size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="folder-info">
                                        <h3 className="folder-name">{list.name}</h3>
                                        <p className="folder-count text-dim">{listItems.length} items</p>
                                    </div>
                                )}

                                <div className="folder-actions" onClick={e => e.stopPropagation()}>
                                    {list.id !== 'default' && editingListId !== list.id && (
                                        <>
                                            <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); setEditName(list.name); setEditingListId(list.id); }}>
                                                <Edit2 size={14} className="text-dim" />
                                            </button>
                                            <button className="btn-icon-sm" onClick={(e) => handleDeleteList(list.id, e)}>
                                                <Trash2 size={14} className="text-dim" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // INNER LIST VIEW
    const activeList = lists.find(l => l.id === activeListId);
    if (!activeList) {
        setActiveListId(null);
        return null;
    }

    const listItems = items.filter(i => i.listId === activeListId);

    return (
        <div className="vault-page animate-fade-in">
            <button className="vault-breadcrumbs" onClick={() => setActiveListId(null)}>
                <ChevronLeft size={16} />
                <span>Back to Folders</span>
            </button>

            <div className="vault-header">
                <div>
                    <h2 className="font-heading" style={{ fontSize: '28px' }}>{activeList.name}</h2>
                </div>
                <span className="vault-count">{listItems.length} items</span>
            </div>

            {/* Filter Toggle */}
            <div className="vault-filters" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['all', 'repos', 'papers'].map(type => (
                    <button
                        key={type}
                        className={`filter-pill ${filterType === type ? 'active' : ''}`}
                        onClick={() => setFilterType(type)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            background: filterType === type ? 'var(--text-main)' : 'transparent',
                            color: filterType === type ? 'var(--bg-card)' : 'var(--text-dim)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {listItems.length === 0 ? (
                <div className="vault-empty">
                    <p className="text-dim" style={{ fontSize: '14px' }}>This folder is empty.</p>
                </div>
            ) : (
                <div className="vertical-stack mt-lg">
                    <AnimatePresence>
                        {listItems.filter(item => {
                            if (filterType === 'repos') return item.url?.includes('github.com');
                            if (filterType === 'papers') return item.url?.includes('arxiv.org') || item.url?.includes('huggingface.co');
                            return true;
                        }).map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card-premium vault-card"
                            >
                                <div className="vault-card-main">
                                    <div className="vault-paper-meta" style={{ marginBottom: '8px' }}>
                                        <span className="source-tag">{item.source || 'GitHub'}</span>
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
                                    <button className="vault-action-btn vault-remove-btn" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default VaultPage;
