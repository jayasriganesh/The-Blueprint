import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Folder } from 'lucide-react';

export default function BookmarkModal({ vaultData, item, onClose, onSave }) {
    const [selectedListId, setSelectedListId] = useState('default');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newListName, setNewListName] = useState('');

    const handleSave = () => {
        if (isCreatingNew) {
            if (!newListName.trim()) return;
            onSave(item, null, newListName.trim());
        } else {
            onSave(item, selectedListId, null);
        }
    };

    if (!item) return null;

    return (
        <div className="overlay glass" onClick={onClose} style={{ zIndex: 1100 }}>
            <motion.div
                className="bookmark-modal card-premium"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="font-heading">Save to Vault</h3>
                    <button className="btn-icon-sm" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="modal-body">
                    <p className="item-to-save text-dim truncate" style={{ marginBottom: '16px', fontSize: '14px' }}>
                        {item.title || item.name}
                    </p>

                    {!isCreatingNew ? (
                        <div className="list-selection">
                            <p className="section-label text-xs text-dim" style={{ marginBottom: '8px' }}>SELECT FOLDER</p>
                            <div className="folder-list">
                                {vaultData.lists.map(list => (
                                    <button
                                        key={list.id}
                                        className={`folder-select-btn ${selectedListId === list.id ? 'active' : ''}`}
                                        onClick={() => setSelectedListId(list.id)}
                                    >
                                        <Folder size={16} className={selectedListId === list.id ? 'icon-filled' : ''} />
                                        <span>{list.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button className="create-new-btn" onClick={() => setIsCreatingNew(true)} style={{ marginTop: '16px' }}>
                                <Plus size={16} /> Create New Folder
                            </button>
                        </div>
                    ) : (
                        <div className="create-list-form">
                            <p className="section-label text-xs text-dim" style={{ marginBottom: '8px' }}>NEW FOLDER NAME</p>
                            <input
                                type="text"
                                className="styled-input"
                                placeholder="e.g. Machine Learning"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                autoFocus
                            />
                            <button className="create-new-btn" onClick={() => setIsCreatingNew(false)} style={{ marginTop: '16px', color: 'var(--text-dim)' }}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ marginTop: '24px' }}>
                    <button className="btn-save-chunky" style={{ width: '100%' }} onClick={handleSave} disabled={isCreatingNew && !newListName.trim()}>
                        Save Bookmark
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
