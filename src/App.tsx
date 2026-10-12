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
import { Compass, Sparkles, MapPin, Footprints, Award } from 'lucide-react';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
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
          <div className="footer-brand">
            <div className="brand-icon-wrapper" style={{ width: 34, height: 34 }}>
              <Footprints size={18} />
            </div>
            <div>
              <div className="footer-brand-title">SniffQuest</div>
              <div className="footer-tagline">Sensory Exploration for Happy Dogs</div>
            </div>
          </div>

          <div className="footer-meta">
            <p>Built for the Hackathon • Google Gemini & Ollama Ready 🐾</p>
            <p style={{ marginTop: '0.2rem', opacity: 0.8 }}>
              Privacy-first: Cloud keys strictly stored in server .env.
            </p>
          </div>
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
    </div>
  );
}

export default App;
