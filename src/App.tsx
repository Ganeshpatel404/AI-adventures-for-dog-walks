import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PlannerForm } from './components/PlannerForm';
import { QuestList } from './components/QuestList';
import { WalkModeView } from './components/WalkModeView';
import { WalkHistoryView } from './components/WalkHistoryView';
import { SAMPLE_QUESTS } from './data/sampleQuests';
import type { NavigationTab, Quest, SystemStatus, WalkHistoryItem } from './types';
import { fetchSystemStatus } from './services/questApi';
import { Compass, Sparkles, MapPin, Footprints, Award, ShieldCheck, Heart, X } from 'lucide-react';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [activeModal, setActiveModal] = useState<'privacy' | 'safety' | null>(null);
  const [sampleQuests] = useState<Quest[]>(SAMPLE_QUESTS);
  const [customQuests, setCustomQuests] = useState<Quest[]>([]);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(SAMPLE_QUESTS[0]);
  const [currentDogName, setCurrentDogName] = useState<string>('Barnaby');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Locally saved walk history state
  const [walkHistory, setWalkHistory] = useState<WalkHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sniffquest_walk_history');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('sniffquest_walk_history');
    } catch { /* ignore */ }
    setWalkHistory([]);
  };

  const handleWalkSaved = (item: WalkHistoryItem) => {
    setWalkHistory((prev) => [item, ...prev.filter((w) => w.id !== item.id)]);
  };

  // Load backend capabilities and API key status on mount and when tab changes
  useEffect(() => {
    fetchSystemStatus().then((status) => {
      setSystemStatus(status);
    });
  }, [activeTab]);

  const handleStartWalk = (quest: Quest) => {
    setActiveQuest(quest);
    setActiveTab('walk-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateQuest = (newQuest: Quest) => {
    setCustomQuests((prev) => [newQuest, ...prev]);
    // Extract dog name from the custom quest title
    const nameMatch = newQuest.title.match(/^([^']+)'s/);
    if (nameMatch && nameMatch[1]) {
      setCurrentDogName(nameMatch[1]);
    }
    // Automatically smooth scroll to quests section
    const questSection = document.getElementById('sample-quests-section');
    if (questSection) {
      questSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlanClick = () => {
    setActiveTab('planner');
    const plannerEl = document.getElementById('planner-form');
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    setActiveTab('quests');
    const questsEl = document.getElementById('sample-quests-section');
    if (questsEl) {
      questsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFooterLinkClick = (target: 'about' | 'how-it-works' | 'privacy' | 'safety') => {
    if (target === 'about') {
      setActiveTab('home');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } else if (target === 'how-it-works') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('sample-quests-section') || document.getElementById('planner-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (target === 'privacy') {
      setActiveModal('privacy');
    } else if (target === 'safety') {
      setActiveModal('safety');
    }
  };

  return (
    <div className="sniffquest-app">
      {/* Top Sticky Header with Online / Offline pill */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWalkActive={activeTab === 'walk-mode'}
        systemStatus={systemStatus}
        historyCount={walkHistory.length}
      />

      {/* Main Content Area */}
      <main id="main-content">
        {activeTab === 'walk-mode' ? (
          <WalkModeView
            key={activeQuest?.id || 'empty'}
            quest={activeQuest}
            dogName={currentDogName}
            onExitWalk={() => setActiveTab('quests')}
            onSelectAnotherQuest={() => setActiveTab('quests')}
            onWalkSaved={handleWalkSaved}
          />
        ) : activeTab === 'history' ? (
          <WalkHistoryView
            history={walkHistory}
            onClearHistory={handleClearHistory}
            onStartNewWalk={() => setActiveTab('quests')}
          />
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection
              onPlanClick={handlePlanClick}
              onExploreClick={handleExploreClick}
            />

            {/* Dog-Walk Planner Form with Mode Controls */}
            <PlannerForm
              onGenerateQuest={handleGenerateQuest}
              systemStatus={systemStatus}
            />

            {/* Sample & Generated Quest Cards Section */}
            <QuestList
              sampleQuests={sampleQuests}
              customQuests={customQuests}
              onStartWalk={handleStartWalk}
              activeWalkQuestId={activeQuest?.id}
            />

            {/* Recent Walk History & Badges Section */}
            {walkHistory.length > 0 && (
              <WalkHistoryView
                history={walkHistory}
                onClearHistory={handleClearHistory}
                onStartNewWalk={() => setActiveTab('quests')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container footer-inner">
          <div className="footer-brand-column">
            <div className="footer-brand-header">
              <div className="brand-icon-wrapper" style={{ width: 36, height: 36 }}>
                <Footprints size={20} />
              </div>
              <span className="footer-brand-title">SniffQuest</span>
            </div>
            <p className="footer-tagline">Little adventures. Happier walks.</p>
            <p className="footer-description">
              Discover new ways to let your dog sniff, explore, and enjoy the world—one walk at a time.
            </p>
          </div>

          <nav className="footer-links-nav" aria-label="Footer navigation">
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => handleFooterLinkClick('about')}
            >
              About
            </button>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => handleFooterLinkClick('how-it-works')}
            >
              How It Works
            </button>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => handleFooterLinkClick('privacy')}
            >
              Privacy
            </button>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => handleFooterLinkClick('safety')}
            >
              Dog Safety
            </button>
          </nav>

          <div className="footer-divider" />

          <p className="footer-closing-line">
            Made for curious noses and screen-free adventures.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Bar for quick navigation */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          className={`mobile-bottom-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Compass size={20} />
          <span>Home</span>
        </button>

        <button
          className={`mobile-bottom-btn ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('planner');
            const el = document.getElementById('planner-form');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Sparkles size={20} />
          <span>Planner</span>
        </button>

        <button
          className={`mobile-bottom-btn ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('quests');
            const el = document.getElementById('sample-quests-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <MapPin size={20} />
          <span>Quests</span>
        </button>

        <button
          className={`mobile-bottom-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('history');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Award size={20} />
          <span>Journal</span>
        </button>

        <button
          className={`mobile-bottom-btn ${activeTab === 'walk-mode' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('walk-mode');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Footprints size={20} />
          <span>Walk Mode</span>
        </button>
      </nav>

      {/* Informative Modals for Privacy and Dog Safety */}
      {activeModal && (
        <div className="info-modal-backdrop" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true">
          <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <div className="info-modal-title-wrap">
                {activeModal === 'privacy' ? (
                  <>
                    <div className="info-modal-icon-badge">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 className="info-modal-title">Privacy Policy</h3>
                      <p className="info-modal-subtitle">Private, local-first, and respectful of your walks</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-modal-icon-badge safety">
                      <Heart size={22} />
                    </div>
                    <div>
                      <h3 className="info-modal-title">Dog Safety Guidelines</h3>
                      <p className="info-modal-subtitle">Enriching walks with safety and comfort first</p>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="info-modal-close-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="info-modal-body">
              {activeModal === 'privacy' ? (
                <div className="info-modal-text">
                  <div className="info-modal-item">
                    <h4>🐾 100% Local Walk History</h4>
                    <p>Your dog's walk journal, earned badges, and notes are saved directly in your browser's local storage. None of your walks are stored on remote tracking servers.</p>
                  </div>
                  <div className="info-modal-item">
                    <h4>🔒 Zero Personal Profile Tracking</h4>
                    <p>Information you provide in the planner—such as dog names, energy levels, and preferred terrain—is used exclusively to generate your adventure quests.</p>
                  </div>
                  <div className="info-modal-item">
                    <h4>🛡️ Secure & Private Architecture</h4>
                    <p>We do not track analytics or use third-party advertising cookies. Everything is designed to keep you and your dog focused on the outdoor trail.</p>
                  </div>
                </div>
              ) : (
                <div className="info-modal-text">
                  <div className="info-modal-item">
                    <h4>🌿 Follow Your Dog's Nose</h4>
                    <p>Sniff walks are about sensory decompression and mental enrichment, not physical mileage. Give your dog plenty of leash slack and time to explore intriguing scent plumes.</p>
                  </div>
                  <div className="info-modal-item">
                    <h4>☀️ Pavement & Surface Temperature Check</h4>
                    <p>Asphalt and pavement can quickly become dangerously hot. Place the back of your hand flat on the ground for 7 seconds before walking on sunny days.</p>
                  </div>
                  <div className="info-modal-item">
                    <h4>👀 Environmental Awareness</h4>
                    <p>Stay mindful of roadside debris, toxic plants, foxtails, and wildlife while your dog sniffs grass lines or park bushes.</p>
                  </div>
                  <div className="info-modal-item">
                    <h4>💧 Hydration & Comfort</h4>
                    <p>Always bring fresh water, adjust walk length to your dog's age and health, and pause whenever your pup wants to rest in the shade.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="info-modal-footer">
              <button
                type="button"
                className="btn-primary info-modal-confirm-btn"
                onClick={() => setActiveModal(null)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
