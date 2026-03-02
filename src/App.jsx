import React, { useState, useEffect } from 'react';
import { LayoutGrid, Compass, Bookmark, Settings, Search, Clock, ChevronRight, Share2, BookOpen, ExternalLink, X, Sun, Moon, Github, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { branches, timeFilters } from './data/config';
import { fetchTrendingRepos } from './services/github';
import { fetchResearchPapers } from './services/research';
import { fetchHFPapers } from './services/huggingface';
import { fetchIndustryNews } from './services/news';
import { summarizeAbstract } from './services/summarizer';
import { useLocalStorage } from './hooks/useLocalStorage';
import VaultPage from './pages/VaultPage';
import ExplorePage from './pages/ExplorePage';
import { auth, loginWithGitHub, logout } from './services/firebase';
import { findOrCreateGist, pullFromCloud, pushToCloud } from './services/githubSync';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeBranch, setActiveBranch] = useState(branches[0]);
  const [activeFilter, setActiveFilter] = useState(timeFilters[1]); // Weekly

  const [repos, setRepos] = useState([]);
  const [papers, setPapers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const [vault, setVault] = useLocalStorage('blueprint-vault', []);
  const [theme, setTheme] = useLocalStorage('blueprint-theme', 'light');

  const [user, setUser] = useState(null);
  const [githubToken, setGithubToken] = useState(null);
  const [gistId, setGistId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth Observer
  useEffect(() => {
    return auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // On login, we need the token from local storage or previous login
        // For simplicity in this demo, we'll re-auth or use state from login call
      } else {
        setUser(null);
        setGithubToken(null);
        setGistId(null);
      }
    });
  }, []);

  // Sync Data on Login
  useEffect(() => {
    if (user && githubToken && !gistId) {
      const initSync = async () => {
        try {
          setSyncing(true);
          const id = await findOrCreateGist(githubToken);
          setGistId(id);
          const cloudData = await pullFromCloud(id, githubToken);

          if (cloudData && cloudData.vault) {
            // Merge logic: prefer cloud, but keep unique local items
            const localMap = new Map(vault.map(item => [item.id, item]));
            cloudData.vault.forEach(item => localMap.set(item.id, item));
            setVault(Array.from(localMap.values()));
            setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
          setSyncing(false);
        } catch (err) {
          console.error("Sync Initialization Failed", err);
          setSyncing(false);
        }
      };
      initSync();
    }
  }, [user, githubToken, gistId]);

  // Manual/Action-triggered sync helper
  const triggerSync = async (data) => {
    if (!user || !githubToken || !gistId || syncing) return;
    try {
      setSyncing(true);
      await pushToCloud(gistId, githubToken, data);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSyncing(false);
    } catch (err) {
      console.error("Manual sync failed", err);
      setSyncing(false);
    }
  };

  const handleLogin = async () => {
    try {
      const { user: fbUser, token } = await loginWithGitHub();
      setUser(fbUser);
      setGithubToken(token);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  // Fetch data when branch or filter changes
  useEffect(() => {
    if (activeTab !== 'home') return;

    const loadData = async () => {
      setLoading(true);
      const isCS = activeBranch.id === 'cs';
      const [repoData, paperData, newsData, hfPaperData] = await Promise.all([
        fetchTrendingRepos(activeBranch.githubTopic, parseInt(activeFilter.value)),
        fetchResearchPapers(activeBranch.arxivCategory),
        fetchIndustryNews(activeBranch.id),
        isCS ? fetchHFPapers('machine learning') : Promise.resolve([])
      ]);

      const injectBranch = (items) => items.map(item => ({ ...item, branchId: activeBranch.id }));

      setRepos(injectBranch(repoData));

      const mergedPapers = isCS
        ? [...paperData.slice(0, 5), ...hfPaperData, ...paperData.slice(5)]
        : paperData;
      setPapers(injectBranch(mergedPapers));

      setNews(injectBranch(newsData));
      setLoading(false);
    };
    loadData();
  }, [activeBranch, activeFilter, activeTab]);



  const toggleBookmark = (item) => {
    const isBookmarked = vault.some(v => v.id === item.id);
    let newVault;
    if (isBookmarked) {
      newVault = vault.filter(v => v.id !== item.id);
    } else {
      newVault = [...vault, item];
    }
    setVault(newVault);

    // Only sync if logged in and item is physically being saved/removed
    if (user && githubToken && gistId) {
      triggerSync(newVault);
    }
  };

  const handleSummarize = (paper) => {
    setSelectedPaper(paper);
    setSummarizing(true);
    setSummary('');

    // Simulate LLM processing time
    setTimeout(() => {
      const result = summarizeAbstract(paper.abstract);
      setSummary(result);
      setSummarizing(false);
    }, 1500);
  };

  const isBookmarked = (id) => vault.some(v => v.id === id);

  return (
    <div className="app-container" style={{ '--branch-accent': `var(--color-${activeBranch.id})` }}>
      {/* Header (Only on Home) */}
      <AnimatePresence>
        {activeTab === 'home' && (
          <header className="glass">
            <div className="header-top">
              <h1 className="font-heading">The Blueprint</h1>
              <div className="header-icons">
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="btn-icon-md"
                  style={{ border: 'none' }}
                >
                  {theme === 'light' ? <Moon size={20} className="text-dim" /> : <Sun size={20} className="text-dim" />}
                </button>

                {user ? (
                  <div className="user-profile-nav">
                    {syncing && <Clock size={14} className="sync-spinner text-dim" />}
                    <div className="user-info-brief" onClick={() => setActiveTab('settings')}>
                      <img src={user.photoURL} alt="Profile" className="user-avatar-img" title="Open Settings" />
                      <div className="sync-indicator">
                        <Cloud size={10} style={{ color: gistId ? 'var(--color-online)' : 'var(--text-dim)' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className="btn-premium login-btn" onClick={handleLogin}>
                    <Github size={14} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>

            {/* Branch Selector */}
            <div className="branch-nav">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setActiveBranch(branch)}
                  className={`branch-btn ${activeBranch.id === branch.id ? 'active' : ''}`}
                >
                  <span>{branch.name}</span>
                </button>
              ))}
            </div>

            {/* Temporal Filter */}
            <div className="filter-nav">
              {timeFilters.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setActiveFilter(filter)}
                  className={`filter-btn ${activeFilter.label === filter.label ? 'active' : ''}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container">
        {activeTab === 'home' ? (
          loading ? (
            <div className="loading-state">
              <div className="shimmer card-premium" style={{ height: '160px', marginBottom: '20px' }} />
              <div className="shimmer card-premium" style={{ height: '120px', marginBottom: '20px' }} />
              <div className="shimmer card-premium" style={{ height: '120px' }} />
            </div>
          ) : (
            <>
              <section className="feed-section animate-fade-in">
                <div className="section-header">
                  <h2 className="font-heading">Trending Repositories</h2>
                  <button className="header-action-btn">Browse {activeBranch.id.toUpperCase()}</button>
                </div>
                {activeFilter.label === 'Daily' && (
                  <div className="daily-notice">
                    <span>📅 Showing top repos from the past 48h. Data refreshes daily at 6:00 PM.</span>
                  </div>
                )}
                <div className="horizontal-scroll-container">
                  <div className="horizontal-scroll">
                    {repos.length === 0 ? (
                      <p className="text-dim text-sm italic">No trending repos found this week.</p>
                    ) : (
                      // Single mapping for manual scroll
                      repos.map((repo, idx) => (
                        <motion.div
                          key={`${repo.id}-${idx}`}
                          className="card-premium repo-card"
                          onClick={(e) => {
                            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }}
                        >
                          <div className="repo-header">
                            <div className={`branch-tag branch-tag-${activeBranch.id}`}>{activeBranch.id.toUpperCase()}</div>
                            <div className="card-actions-row">
                              <button
                                className={`btn-icon-sm ${isBookmarked(repo.id) ? 'btn-saved' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleBookmark(repo); }}
                                title={isBookmarked(repo.id) ? 'Saved to Vault' : 'Save to Vault'}
                              >
                                <Bookmark
                                  size={16}
                                  className={isBookmarked(repo.id) ? 'icon-filled' : 'text-dim'}
                                />
                              </button>
                              <a href={repo.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink size={16} className="icon-accent" />
                              </a>
                            </div>
                          </div>
                          <h3 className="repo-name">{repo.name}</h3>
                          <p className="repo-desc text-dim">{repo.description || 'No description provided.'}</p>
                          <div className="repo-stats font-mono">
                            <span>★ {repo.stars}</span>
                            <span>{repo.forks} forks</span>
                            {repo.language && <span className="repo-lang">{repo.language}</span>}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="feed-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="section-header">
                  <h2 className="font-heading">Latest Research</h2>
                </div>
                <div className="vertical-stack">
                  {papers.length === 0 ? (
                    <p className="text-dim text-sm italic">Searching arXiv for {activeBranch.name}...</p>
                  ) : (
                    papers.map((paper, idx) => (
                      <motion.div
                        key={paper.id}
                        className="card-premium paper-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        <div className="paper-meta">
                          <span className="source-tag">{paper.source}</span>
                          <span className="date-tag">{paper.date}</span>
                        </div>
                        <h3 className="paper-title">{paper.title}</h3>
                        <p className="paper-authors">{paper.authors}</p>
                        <div className="paper-actions">
                          <button className="btn-summarize" onClick={() => handleSummarize(paper)}>
                            <BookOpen size={16} />
                            <span>Summarize</span>
                          </button>
                          <button
                            className={`btn-icon-md ${isBookmarked(paper.id) ? 'btn-saved' : ''}`}
                            onClick={() => toggleBookmark(paper)}
                            title={isBookmarked(paper.id) ? 'Saved to Vault' : 'Save to Vault'}
                          >
                            <Bookmark
                              size={20}
                              className={isBookmarked(paper.id) ? 'icon-filled' : 'text-dim'}
                            />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>

              <section className="feed-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="section-header">
                  <h2 className="font-heading">Industry News</h2>
                </div>
                {activeFilter.label === 'Daily' && (
                  <div className="daily-notice">
                    <span>📅 News curated daily at 6:00 PM for {activeBranch.name}.</span>
                  </div>
                )}
                <div className="vertical-stack">
                  {news.map((item) => (
                    <div key={item.id} className="card-premium news-card">
                      <div className="news-content">
                        <div className="news-meta">
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                        <h3 className="news-title">{item.title}</h3>
                        <div className="news-actions">
                          <button
                            className="news-action-link"
                            onClick={() => handleSummarize(item)}
                          >
                            <BookOpen size={14} /> Summarize
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="news-link-external"
                          >
                            Read more →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )
        ) : activeTab === 'vault' ? (
          <VaultPage savedItems={vault} onRemove={(id) => setVault(vault.filter(v => v.id !== id))} />
        ) : activeTab === 'explore' ? (
          <ExplorePage
            onSummarize={handleSummarize}
            onToggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
        ) : activeTab === 'settings' ? (
          <ProfilePage
            user={user}
            gistId={gistId}
            syncing={syncing}
            lastSynced={lastSynced}
            onSync={() => triggerSync(vault)}
            onLogout={() => {
              logout();
              setActiveTab('home');
            }}
          />
        ) : (
          <div className="placeholder-page animate-fade-in" style={{ padding: '40px 0', textAlign: 'center' }}>
            <h2 className="font-heading" style={{ fontSize: '24px' }}>Coming Soon</h2>
            <p className="text-dim">Module unavailable.</p>
          </div>
        )}
      </main>

      {/* Summary Modal / Slide-up Overlay */}
      <AnimatePresence>
        {selectedPaper && (
          <motion.div
            className="overlay glass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPaper(null)}
          >
            <motion.div
              className="summary-card"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="summary-header">
                <h4 className="font-heading">Abstract-to-Brief</h4>
                <button className="close-btn" onClick={() => setSelectedPaper(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="summary-content">
                <p className="summary-paper-title">{selectedPaper.title}</p>

                {summarizing ? (
                  <div className="summarizing-loader">
                    <div className="shimmer" style={{ height: '16px', borderRadius: '4px', marginBottom: '8px' }} />
                    <div className="shimmer" style={{ height: '16px', borderRadius: '4px', width: '80%' }} />
                    <p className="loader-text font-mono">Distilling research insights...</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="summary-text"
                  >
                    {summary}
                  </motion.div>
                )}
              </div>

              <div className="summary-actions">
                <button className="btn-full-paper" onClick={() => window.open(selectedPaper.url, '_blank')}>
                  Read Full Paper
                </button>
                <button
                  className={`btn-save-vault ${isBookmarked(selectedPaper.id) ? 'active' : ''}`}
                  onClick={() => toggleBookmark(selectedPaper)}
                >
                  <Bookmark size={18} className={isBookmarked(selectedPaper.id) ? 'icon-filled' : ''} />
                  <span>{isBookmarked(selectedPaper.id) ? 'In Vault' : 'Save to Vault'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {[
          { id: 'home', icon: <LayoutGrid size={24} />, label: 'Home' },
          { id: 'explore', icon: <Compass size={24} />, label: 'Explore' },
          { id: 'vault', icon: <Bookmark size={24} />, label: 'Vault' },
          { id: 'settings', icon: <Settings size={24} />, label: 'Profile' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'settings' && !user) {
                handleLogin();
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div >
  );
}

export default App;
