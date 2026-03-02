import React from 'react';
import { Github } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/Logo.png';

export default function LoginPage({ onLogin }) {
    return (
        <div className="login-page-container">
            <motion.div
                className="login-card glass"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
                <div className="login-header">
                    <img src={logo} alt="The Blueprint Logo" className="login-logo" />
                    <h1 className="font-heading login-title">The Blueprint</h1>
                    <p className="login-subtitle text-dim">
                        A minimalist developer dashboard
                    </p>
                </div>

                <div className="login-actions">
                    <button className="btn-premium login-btn-large" onClick={onLogin}>
                        <Github size={20} />
                        <span>Sign In with GitHub</span>
                    </button>
                    <p className="login-note text-dim">
                        Authentication is required to sync your Vault.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
