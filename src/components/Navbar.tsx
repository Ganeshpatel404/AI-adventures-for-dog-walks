import type { FC, Dispatch, SetStateAction } from 'react';
import { Compass, Footprints, Sparkles, MapPin, Wifi, WifiOff, Cpu, Award } from 'lucide-react';
import type { NavigationTab, SystemStatus } from '../types';

export interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: ((tab: NavigationTab) => void) | Dispatch<SetStateAction<NavigationTab>>;
  isWalkActive: boolean;
  systemStatus?: SystemStatus | null;
  historyCount?: number;
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isWalkActive,
  systemStatus,
  historyCount = 0,
}) => {
  const isGeminiVerified = systemStatus?.gemini?.verified === true;
  const isGeminiUnavailable = systemStatus?.gemini?.status === 'unavailable';
  const isGeminiConfigured = Boolean(systemStatus?.gemini?.configured);
  const isOllamaReady = Boolean(
    systemStatus?.ollama?.available &&
      (systemStatus?.ollama?.models?.length || 0) > 0
  );

  return (
    <header className="navbar-header">
      <div className="container navbar-inner">
        <div className="navbar-brand" onClick={() => setActiveTab('home')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <Footprints className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-name">SniffQuest</span>
            <span className="brand-tagline">AI Canine Adventures</span>
          </div>
        </div>

        {/* Online / Offline Mode Indicator Pill - Honestly labeled based on verified requests */}
        <div className="navbar-status-indicator">
          {isGeminiVerified ? (
            <span className="mode-pill mode-online" title="Google Gemini verified with active cloud connection">
              <Wifi size={13} />
              <span>Online (Gemini Cloud)</span>
            </span>
          ) : isGeminiUnavailable ? (
            <span
              className="mode-pill mode-offline"
              title="Gemini is temporarily unavailable due to high demand (HTTP 503). Safe offline library in use."
            >
              <WifiOff size={13} />
              <span>Offline (Gemini Busy)</span>
            </span>
          ) : isOllamaReady ? (
            <span className="mode-pill mode-ollama" title="Ollama running locally on your machine">
              <Cpu size={13} />
              <span>Offline (Local Ollama AI)</span>
            </span>
          ) : isGeminiConfigured ? (
            <span
              className="mode-pill mode-standby"
              title="Gemini API key configured in .env; will verify on first adventure request"
            >
              <Wifi size={13} />
              <span>Standby (Key Configured)</span>
            </span>
          ) : (
            <span
              className="mode-pill mode-offline"
              title="Safe offline activity library active (Add GEMINI_API_KEY to .env for Cloud AI)"
            >
              <WifiOff size={13} />
              <span>Offline Mode (Safe Library)</span>
            </span>
          )}
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Compass size={18} />
            <span>Discover</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            <Sparkles size={18} />
            <span>AI Planner</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => setActiveTab('quests')}
          >
            <MapPin size={18} />
            <span>Quests</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Award size={18} />
            <span>Journal {historyCount > 0 ? `(${historyCount})` : ''}</span>
          </button>
          <button
            className={`nav-link nav-walk-btn ${activeTab === 'walk-mode' ? 'active' : ''} ${
              isWalkActive ? 'is-live' : ''
            }`}
            onClick={() => setActiveTab('walk-mode')}
          >
            <span className="live-indicator-dot"></span>
            <span>Walk Mode</span>
            {isWalkActive && <span className="live-badge">LIVE</span>}
          </button>
        </nav>
      </div>
    </header>
  );
};
