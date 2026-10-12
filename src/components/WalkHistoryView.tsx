import type { FC } from 'react';
import { Award, Clock, Sparkles, Trash2, Calendar, Star, ArrowLeft } from 'lucide-react';
import type { WalkHistoryItem } from '../types';

interface WalkHistoryViewProps {
  history: WalkHistoryItem[];
  onClearHistory: () => void;
  onStartNewWalk: () => void;
}

export const WalkHistoryView: FC<WalkHistoryViewProps> = ({
  history,
  onClearHistory,
  onStartNewWalk,
}) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const totalSniffs = history.reduce((acc, h) => acc + (h.sniffCount || 0), 0);
  const totalDuration = history.reduce((acc, h) => acc + (h.durationSeconds || 0), 0);
  const uniqueBadges = new Set(history.map((h) => h.badgeReward.title)).size;

  return (
    <section className="history-section container" id="walk-history-section">
      <div className="section-header text-center">
        <div className="badge-pill badge-forest">
          <Award size={14} />
          <span>Locally Saved Walk History</span>
        </div>
        <h2 className="section-title">Canine Adventure Journal</h2>
        <p className="section-subtitle">
          Every walk and badge is stored safely in your browser's local storage. Zero logins, zero cloud leaks.
        </p>

        {history.length > 0 && (
          <div className="history-overview-stats">
            <div className="history-stat-chip">
              <span className="stat-chip-icon">🐾</span>
              <div>
                <strong>{history.length}</strong>
                <span>Walks Finished</span>
              </div>
            </div>
            <div className="history-stat-chip">
              <span className="stat-chip-icon">👃</span>
              <div>
                <strong>{totalSniffs}</strong>
                <span>Total Sniffs</span>
              </div>
            </div>
            <div className="history-stat-chip">
              <span className="stat-chip-icon">⏱️</span>
              <div>
                <strong>{Math.round(totalDuration / 60)} min</strong>
                <span>Time Exploring</span>
              </div>
            </div>
            <div className="history-stat-chip">
              <span className="stat-chip-icon">🏆</span>
              <div>
                <strong>{uniqueBadges}</strong>
                <span>Unique Badges</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel empty-history-card text-center">
          <div className="empty-history-icon">🗺️</div>
          <h3>No Walks Logged Yet</h3>
          <p>
            Choose any quest in the planner or sample list, tap <strong>Walk Mode</strong>, and complete
            your checkpoints to earn badges and save walk history!
          </p>
          <button className="btn-primary" onClick={onStartNewWalk}>
            <Sparkles size={16} />
            <span>Embark on First Quest</span>
          </button>
        </div>
      ) : (
        <>
          <div className="history-actions-bar">
            <span className="history-count-text">
              Showing {history.length} recorded {history.length === 1 ? 'adventure' : 'adventures'}
            </span>
            <button
              className="btn-clear-history"
              onClick={onClearHistory}
              title="Clear all saved walks from this browser"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>

          <div className="history-cards-grid">
            {history.map((walk) => (
              <div key={walk.id} className="glass-panel history-card">
                <div className="history-card-header">
                  <div className="history-date">
                    <Calendar size={14} />
                    <span>{formatDate(walk.completedAt)}</span>
                  </div>
                  <span className="badge-pill badge-forest">🐕 {walk.dogName}</span>
                </div>

                <h3 className="history-quest-title">{walk.questTitle}</h3>

                <div className="history-metrics-row">
                  <div className="history-metric">
                    <Clock size={14} />
                    <span>{formatTime(walk.durationSeconds)}</span>
                  </div>
                  <div className="history-metric">
                    <span>👃 {walk.sniffCount} sniffs</span>
                  </div>
                  <div className="history-metric">
                    <span>
                      ✓ {walk.checkpointsCompleted}/{walk.totalCheckpoints} stops
                    </span>
                  </div>
                </div>

                {/* Badge Awarded */}
                <div className="history-badge-box">
                  <span className="badge-icon-emoji">{walk.badgeReward.iconEmoji}</span>
                  <div>
                    <div className="badge-box-title">{walk.badgeReward.title}</div>
                    <div className="badge-box-desc">{walk.badgeReward.description}</div>
                  </div>
                </div>

                {/* Rating & Feedback Notes */}
                {(walk.rating || walk.feedbackNotes) && (
                  <div className="history-feedback-box">
                    {walk.rating && (
                      <div className="history-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= walk.rating! ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                        <span className="rating-label">{walk.rating}/5 Enjoyment</span>
                      </div>
                    )}
                    {walk.feedbackNotes && (
                      <p className="history-feedback-text">"{walk.feedbackNotes}"</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="history-footer-cta text-center mt-4">
            <button className="btn-primary" onClick={onStartNewWalk}>
              <ArrowLeft size={16} />
              <span>Start Another Adventure</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
};
