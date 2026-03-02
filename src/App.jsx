import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Compass, Bookmark, Settings, Search, Clock, ChevronRight, ChevronLeft, Share2, BookOpen, ExternalLink, X, Sun, Moon, Github, Cloud } from 'lucide-react';
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
import LoginPage from './pages/LoginPage';
import BookmarkModal from './components/BookmarkModal';
import { auth, loginWithGitHub, logout } from './services/firebase';
import { findOrCreateGist, pullFromCloud, pushToCloud } from './services/githubSync';
import ProfilePage from './pages/ProfilePage';
import logo from './assets/Logo.png';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeBranch, setActiveBranch] = useState(branches[0]);
  const [activeFilter, setActiveFilter] = useState(timeFilters[1]); // Weekly

  const [repos, setRepos] = useState([]);
  const [visibleHorizontalCount, setVisibleHorizontalCount] = useState(5);
  const [visibleVerticalCount, setVisibleVerticalCount] = useState(10);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [activeRepoIndex, setActiveRepoIndex] = useState(0);

  const [papers, setPapers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const [vaultData, setVaultData] = useLocalStorage('blueprint-vault-data', {
    lists: [{ id: 'default', name: 'General Bookmarks' }],
    items: []
  });
  const [modalItem, setModalItem] = useState(null);

  const [theme, setTheme] = useLocalStorage('blueprint-theme', 'light');

  // Migration effect for old flat array bookmarks
  useEffect(() => {
    const oldVaultStr = window.localStorage.getItem('blueprint-vault');
    if (oldVaultStr) {
      try {
        const oldVault = JSON.parse(oldVaultStr);
        if (Array.isArray(oldVault) && oldVault.length > 0) {
          const migratedItems = oldVault.map(item => ({ ...item, listId: 'default' }));
          setVaultData(prev => ({
            lists: prev.lists,
            items: [...prev.items, ...migratedItems]
          }));
          window.localStorage.removeItem('blueprint-vault');
        }
      } catch (e) {
        console.error("Migration failed", e);
      }
    }
  }, [setVaultData]);

  const [user, setUser] = useState(null);
  const [githubToken, setGithubToken] = useState(null);
  const [gistId, setGistId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth Observer
  useEffect(() => {
    if (!auth) return;
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
            if (Array.isArray(cloudData.vault)) {
              // Legacy generic pull
              const localMap = new Map(vaultData.items.map(item => [item.id, item]));
              cloudData.vault.forEach(item => {
                item.listId = item.listId || 'default';
                localMap.set(item.id, item);
              });
              setVaultData({ lists: vaultData.lists, items: Array.from(localMap.values()) });
            } else if (cloudData.vault.items) {
              // Merge objects
              const localMap = new Map(vaultData.items.map(item => [item.id, item]));
              cloudData.vault.items.forEach(item => localMap.set(item.id, item));

              const localListMap = new Map(vaultData.lists.map(list => [list.id, list]));
              cloudData.vault.lists.forEach(list => localListMap.set(list.id, list));

              setVaultData({
                lists: Array.from(localListMap.values()),
                items: Array.from(localMap.values())
              });
            }
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
      setVisibleHorizontalCount(5); // Reset pagination on branch change
      setVisibleVerticalCount(10);
      setActiveRepoIndex(0);

      const mergedPapers = isCS
        ? [...paperData.slice(0, 5), ...hfPaperData, ...paperData.slice(5)]
        : paperData;
      setPapers(injectBranch(mergedPapers));

      setNews(injectBranch(newsData));
      setLoading(false);
    };
    loadData();
  }, [activeBranch, activeFilter, activeTab]);



  const isBookmarked = (id) => vaultData.items.some(v => v.id === id);

  const toggleBookmark = (item) => {
    if (isBookmarked(item.id)) {
      const newData = {
        ...vaultData,
        items: vaultData.items.filter(v => v.id !== item.id)
      };
      setVaultData(newData);
      if (user && githubToken && gistId) triggerSync(newData);
    } else {
      setModalItem(item);
    }
  };

  const handleSaveBookmark = (item, listId, newListName) => {
    let newLists = [...vaultData.lists];
    let finalListId = listId;

    if (newListName) {
      finalListId = Date.now().toString();
      newLists.push({ id: finalListId, name: newListName });
    }

    const newItem = { ...item, listId: finalListId };
    const newData = {
      lists: newLists,
      items: [...vaultData.items.filter(i => i.id !== item.id), newItem]
    };

    setVaultData(newData);
    setModalItem(null);

    if (user && githubToken && gistId) {
      triggerSync(newData);
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

  const handleScrollRepos = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollPanelOnScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const cardWidthWithGap = 340; // approximate
    const newIndex = Math.round(scrollLeft / cardWidthWithGap);
    if (newIndex !== activeRepoIndex) {
      setActiveRepoIndex(newIndex);
    }
  };

  const visibleRepos = repos.slice(0, visibleHorizontalCount);

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container" style={{ '--branch-accent': `var(--color-${activeBranch.id})` }}>
      {/* Header (Only on Home) */}
      <AnimatePresence>
        {activeTab === 'home' && (
          <header className="glass">
            <div className="header-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={logo} alt="The Blueprint Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                <h1 className="font-heading" style={{ margin: 0 }}>The Blueprint</h1>
              </div>
              <div className="header-icons">
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="btn-icon-md"
                  style={{ border: 'none' }}
                >
                  {theme === 'light' ? <Moon size={20} className="text-dim" /> : <Sun size={20} className="text-dim" />}
                </button>

                {user && (
                  <div className="user-profile-nav">
                    {syncing && <Clock size={14} className="sync-spinner text-dim" />}
                    <div className="user-info-brief" onClick={() => setActiveTab('settings')}>
                      <img src={user.photoURL} alt="Profile" className="user-avatar-img" title="Open Settings" />
                      <div className="sync-indicator">
                        <Cloud size={10} style={{ color: gistId ? 'var(--color-online)' : 'var(--text-dim)' }} />
                      </div>
                    </div>
                  </div>
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
                  <div className="header-controls">
                    <button className="header-action-btn" onClick={() => setIsBrowseModalOpen(true)}>
                      Browse {activeBranch.id.toUpperCase()}
                    </button>
                  </div>
                </div>
                {activeFilter.label === 'Daily' && (
                  <div className="daily-notice">
                    <span>📅 Showing top repos from the past 48h. Data refreshes daily at 6:00 PM.</span>
                  </div>
                )}

                <div className="carousel-wrapper">
                  <div className="horizontal-scroll-container" ref={scrollRef} onScroll={handleScrollPanelOnScroll}>
                    <div className="horizontal-scroll snap-x-mandatory">
                      {repos.length === 0 ? (
                        <p className="text-dim text-sm italic">No trending repos found this week.</p>
                      ) : (
                        visibleRepos.map((repo, idx) => (
                          <motion.div
                            key={`${repo.id}-${idx}`}
                            className="card-premium repo-card snap-center"
                            onClick={(e) => {
                              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                              setActiveRepoIndex(idx);
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

                      {repos.length > visibleHorizontalCount && (
                        <div
                          className="card-premium repo-card view-more-card snap-center"
                          onClick={() => setIsBrowseModalOpen(true)}
                        >
                          <Compass size={32} className="text-dim mb-2" />
                          <h3 className="font-heading">View More</h3>
                          <p className="text-dim text-xs">Browse all repositories</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dots Navigation */}
                  <div className="repo-nav-footer">
                    <button className="carousel-btn-inline" onClick={() => handleScrollRepos('left')}>
                      <ChevronLeft size={20} />
                    </button>

                    <div className="repo-dots-container">
                      {Array.from({ length: visibleRepos.length + (repos.length > visibleHorizontalCount ? 1 : 0) }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`repo-dot ${idx === activeRepoIndex ? 'active' : ''}`}
                          onClick={() => {
                            if (scrollRef.current) {
                              scrollRef.current.scrollTo({ left: idx * 340, behavior: 'smooth' });
                            }
                          }}
                        />
                      ))}
                    </div>

                    <button className="carousel-btn-inline" onClick={() => handleScrollRepos('right')}>
                      <ChevronRight size={20} />
                    </button>
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
          <VaultPage
            vaultData={vaultData}
            onUpdateVault={(newData) => {
              setVaultData(newData);
              if (user && githubToken && gistId) triggerSync(newData);
            }}
          />
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
            onSync={() => triggerSync(vaultData)}
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

      {/* Browse Modal Overlay (Vertical Repos List) */}
      <AnimatePresence>
        {isBrowseModalOpen && (
          <motion.div
            className="overlay glass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBrowseModalOpen(false)}
            style={{ zIndex: 1200 }}
          >
            <motion.div
              className="browse-modal card-premium"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header sticky-header">
                <div>
                  <h3 className="font-heading" style={{ fontSize: '24px' }}>Browse {activeBranch.id.toUpperCase()}</h3>
                  <p className="text-dim text-sm">Trending Repositories ({activeFilter.label})</p>
                </div>
                <button className="btn-icon-sm" onClick={() => setIsBrowseModalOpen(false)}><X size={20} /></button>
              </div>

              <div className="browse-content vertical-stack p-md" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                {repos.slice(0, visibleVerticalCount).map((repo, idx) => (
                  <motion.div
                    key={`${repo.id}-${idx}-vert`}
                    className="card-premium repo-card-vertical"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="repo-header">
                      <h3 className="repo-name" style={{ fontSize: '16px', margin: 0 }}>{repo.name}</h3>
                      <div className="card-actions-row">
                        <button
                          className={`btn-icon-sm ${isBookmarked(repo.id) ? 'btn-saved' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(repo); }}
                        >
                          <Bookmark size={16} className={isBookmarked(repo.id) ? 'icon-filled' : 'text-dim'} />
                        </button>
                        <a href={repo.url} target="_blank" rel="noreferrer">
                          <ExternalLink size={16} className="icon-accent" />
                        </a>
                      </div>
                    </div>
                    <p className="repo-desc text-dim" style={{ fontSize: '13px', margin: '8px 0' }}>{repo.description || 'No description provided.'}</p>
                    <div className="repo-stats font-mono" style={{ fontSize: '11px' }}>
                      <span>★ {repo.stars}</span>
                      <span>{repo.forks} forks</span>
                      {repo.language && <span className="repo-lang">{repo.language}</span>}
                    </div>
                  </motion.div>
                ))}

                {repos.length > visibleVerticalCount && (
                  <button
                    className="btn-load-more"
                    onClick={() => setVisibleVerticalCount(prev => prev + 5)}
                  >
                    Load More Repositories
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {modalItem && (
          <BookmarkModal
            vaultData={vaultData}
            item={modalItem}
            onClose={() => setModalItem(null)}
            onSave={handleSaveBookmark}
          />
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
                // Should not happen as App requires login now, but safe fallback
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
