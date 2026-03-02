import React from 'react';
import { X, Github, Cloud, LogOut, Clock, RefreshCcw, Database, Shield, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = ({ user, gistId, syncing, lastSynced, onSync, onLogout }) => {
    if (!user) return null;

    return (
        <div className="profile-page animate-fade-in">
            <div className="profile-header">
                <div className="header-title-group">
                    <Shield size={24} className="text-civil" />
                    <h2 className="font-heading" style={{ fontSize: '32px' }}>Research Identity</h2>
                </div>
                <p className="text-dim" style={{ fontSize: '13px' }}>Manage your engineering profile and cloud persistence.</p>
            </div>

            <div className="dashboard-grid no-modal">
                {/* Identity Section */}
                <div className="dashboard-section identity-card">
                    <div className="user-hero">
                        <img src={user.photoURL} alt="Profile" className="user-avatar-xl" />
                        <div className="user-text">
                            <h3>{user.displayName || 'Researcher'}</h3>
                            <p className="text-dim">{user.email}</p>
                            <div className="badge-github">
                                <Github size={12} />
                                <span>Verified via GitHub</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sync Status Section */}
                <div className="dashboard-section sync-status-card">
                    <div className="section-label">
                        <Database size={14} />
                        <span>Cloud Persistence</span>
                    </div>
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="label">Status</span>
                            <span className={`value pill ${gistId ? 'online' : 'connecting'}`}>
                                {gistId ? 'Connected' : 'Linking...'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="label">Vault ID</span>
                            <span className="value code-text">{gistId ? `${gistId.substring(0, 12)}...` : '--'}</span>
                            {gistId && (
                                <a
                                    href={`https://gist.github.com/${gistId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="gist-reference"
                                >
                                    <Github size={12} />
                                    <span>View Gist Data</span>
                                </a>
                            )}
                        </div>
                        <div className="status-item">
                            <span className="label">Last Sync</span>
                            <span className="value">{lastSynced || 'Initial Sync Pending'}</span>
                        </div>
                    </div>
                </div>

                {/* Control Section */}
                <div className="dashboard-section controls-card">
                    <div className="section-label">
                        <Layout size={14} />
                        <span>Synchronization Control</span>
                    </div>
                    <p className="text-dim text-xs mb-md">Manual override for immediate cloud persistence.</p>
                    <button
                        className={`btn-premium sync-action-btn ${syncing ? 'loading' : ''}`}
                        onClick={onSync}
                        disabled={syncing}
                    >
                        <RefreshCcw size={16} className={syncing ? 'spin' : ''} />
                        <span>{syncing ? 'Saving to Cloud...' : 'Synchronize Now'}</span>
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="dashboard-footer">
                    <button className="btn-secondary logout-action" onClick={onLogout}>
                        <LogOut size={16} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
