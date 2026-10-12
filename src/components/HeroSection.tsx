import type { FC } from 'react';
import { Sparkles, Compass, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onPlanClick: () => void;
  onExploreClick: () => void;
}

export const HeroSection: FC<HeroSectionProps> = ({ onPlanClick, onExploreClick }) => {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge-pill badge-forest hero-pill">
            <Sparkles size={14} className="text-forest-green" />
            <span>Hackathon Edition • AI Olfactory Exploration</span>
          </div>

          <h1 className="hero-title">
            Transform Dog Walks into <span className="highlight-text">Epic Quests</span>
          </h1>

          <p className="hero-subtitle">
            Dogs experience 90% of their world through scent. SniffQuest uses AI storytelling to turn
            everyday neighborhood strolls into captivating detective missions, hidden forest trails, and
            enriching sensory adventures tailored to your pup.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={onPlanClick}>
              <span>Plan an Adventure</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={onExploreClick}>
              <Compass size={18} />
              <span>Explore Sample Quests</span>
            </button>
          </div>

          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <div className="stat-icon-wrap forest">
                <Heart size={20} />
              </div>
              <div>
                <div className="stat-number">100%</div>
                <div className="stat-label">Canine Mental Stimulation</div>
              </div>
            </div>

            <div className="hero-stat-card">
              <div className="stat-icon-wrap gold">
                <Award size={20} />
              </div>
              <div>
                <div className="stat-number">3 Quests</div>
                <div className="stat-label">Handcrafted Trails Ready</div>
              </div>
            </div>

            <div className="hero-stat-card">
              <div className="stat-icon-wrap warm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="stat-number">Sensory-First</div>
                <div className="stat-label">Zero High-Stress Routes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual-card">
          <div className="dog-badge-float top">
            <span className="badge-emoji">🐾</span>
            <div>
              <p className="badge-title">Barnaby's Sniff Score</p>
              <p className="badge-sub">14 Scents Discovered</p>
            </div>
          </div>

          <div className="visual-card-inner">
            <div className="quest-preview-header">
              <span className="badge-pill badge-gold">Active Quest Preview</span>
              <span className="quest-timer-chip">⏱️ 20 min loop</span>
            </div>

            <h3 className="preview-title">The Squirrel Detective Trail</h3>
            <p className="preview-desc">
              "Your hound enters the shaded moss corridor. A faint whisper of acorn bark lingers on the
              breeze..."
            </p>

            <div className="preview-scents">
              <span className="scent-tag">🌲 Pine needles</span>
              <span className="scent-tag">🐿️ Fresh acorn</span>
              <span className="scent-tag">🪵 Damp oak</span>
            </div>

            <div className="preview-progress-box">
              <div className="progress-info">
                <span>Checkpoint 1 / 3 complete</span>
                <span className="progress-pct">33%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>

          <div className="dog-badge-float bottom">
            <span className="badge-emoji">🏆</span>
            <div>
              <p className="badge-title">Badge Unlocked</p>
              <p className="badge-sub">Master Detective Sniffer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
