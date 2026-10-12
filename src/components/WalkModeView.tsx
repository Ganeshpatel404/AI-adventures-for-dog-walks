import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Quest, QuestCheckpoint, WalkHistoryItem } from '../types';

interface WalkModeViewProps {
  quest: Quest | null;
  dogName: string;
  onExitWalk: () => void;
  onSelectAnotherQuest: () => void;
  onWalkSaved?: (walk: WalkHistoryItem) => void;
}

export const WalkModeView: FC<WalkModeViewProps> = ({
  quest,
  dogName,
  onExitWalk,
  onSelectAnotherQuest,
  onWalkSaved,
}) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [sniffCount, setSniffCount] = useState<number>(3);
  const [checkpoints, setCheckpoints] = useState<QuestCheckpoint[]>(quest?.checkpoints || []);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [narratorAudio, setNarratorAudio] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [sniffFeedback, setSniffFeedback] = useState<boolean>(false);

  // Walk feedback state
  const [rating, setRating] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [feedbackSaved, setFeedbackSaved] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && !isFinished && quest) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished, quest]);

  if (!quest) {
    return (
      <section className="walk-mode-empty container">
        <div className="glass-panel empty-walk-box text-center">
          <div className="empty-walk-icon">🐾</div>
          <h2>No Active Quest Selected</h2>
          <p>Pick one of the sample quests or generate one in the AI Planner to enter Walk Mode!</p>
          <button className="btn-primary" onClick={onSelectAnotherQuest}>
            Browse Quests
          </button>
        </div>
      </section>
    );
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddSniff = () => {
    setSniffCount((prev) => prev + 1);
    setSniffFeedback(true);
    setTimeout(() => setSniffFeedback(false), 600);

    // Update active checkpoint sniffs
    setCheckpoints((prev) =>
      prev.map((cp, idx) => {
        if (idx === activeStepIndex) {
          const newRecorded = cp.sniffsRecorded + 1;
          const isNowCompleted = newRecorded >= cp.targetSniffs;
          return {
            ...cp,
            sniffsRecorded: newRecorded,
            completed: isNowCompleted || cp.completed,
          };
        }
        return cp;
      })
    );
  };

  const toggleCheckpoint = (index: number) => {
    setCheckpoints((prev) =>
      prev.map((cp, idx) => {
        if (idx === index) {
          const nextCompleted = !cp.completed;
          return {
            ...cp,
            completed: nextCompleted,
            sniffsRecorded: nextCompleted ? Math.max(cp.sniffsRecorded, cp.targetSniffs) : cp.sniffsRecorded,
          };
        }
        return cp;
      })
    );

    // If next checkpoint available, step forward
    if (index === activeStepIndex && index < checkpoints.length - 1) {
      setActiveStepIndex(index + 1);
    }
  };

  const completedCount = checkpoints.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / checkpoints.length) * 100);

  const saveWalkRecord = (currentRating = rating, currentNotes = feedbackNotes) => {
    if (!quest) return;
    const item: WalkHistoryItem = {
      id: `walk-${Date.now()}`,
      questTitle: quest.title,
      questTheme: quest.theme,
      dogName: dogName || 'Pup',
      completedAt: new Date().toISOString(),
      durationSeconds: seconds,
      sniffCount,
      checkpointsCompleted: checkpoints.filter((c) => c.completed).length,
      totalCheckpoints: checkpoints.length,
      badgeReward: quest.badgeReward,
      rating: currentRating,
      feedbackNotes: currentNotes.trim() || undefined,
    };

    try {
      const existing = localStorage.getItem('sniffquest_walk_history');
      const list: WalkHistoryItem[] = existing ? JSON.parse(existing) : [];
      list.unshift(item);
      localStorage.setItem('sniffquest_walk_history', JSON.stringify(list));
      setFeedbackSaved(true);
      if (onWalkSaved) {
        onWalkSaved(item);
      }
    } catch (e) {
      console.warn('Could not save walk history:', e);
    }
  };

  const handleFinishWalk = () => {
    setIsFinished(true);
    setIsActive(false);
    saveWalkRecord(rating, feedbackNotes);

    // Fire festive celebratory confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2e663c', '#fbbf24', '#d97706', '#86c997', '#faf6ec'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const activeCheckpoint = checkpoints[activeStepIndex] || checkpoints[0];

  return (
    <div className="walk-mode-page">
      <div className="container walk-mode-container">
        {/* Top bar */}
        <div className="walk-mode-topbar">
          <button className="btn-back-link" onClick={onExitWalk}>
            <ArrowLeft size={18} />
            <span>Back to Quests</span>
          </button>

          <div className="companion-tag">
            <span>🐕 Companion:</span>
            <strong>{dogName}</strong>
          </div>

          <button
            className={`audio-toggle-btn ${narratorAudio ? 'active' : ''}`}
            onClick={() => setNarratorAudio(!narratorAudio)}
            title="Toggle AI Narrator Audio Chime"
          >
            {narratorAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{narratorAudio ? 'AI Voice Prompts ON' : 'Audio Muted'}</span>
          </button>
        </div>

        {/* Live HUD Header */}
        <div className="glass-panel walk-hud-card">
          <div className="hud-quest-details">
            <div className="hud-badge-row">
              <span className="badge-pill badge-forest">Live Adventure Mode</span>
              <span className="badge-pill badge-gold">{quest.theme.toUpperCase()}</span>
            </div>
            <h2 className="hud-quest-title">{quest.title}</h2>
            <p className="hud-quest-tagline">{quest.tagline}</p>
          </div>

          {/* Stats Bar */}
          <div className="hud-stats-bar">
            {/* Timer */}
            <div className="hud-stat-item">
              <div className="stat-label-tiny">ELAPSED TIME</div>
              <div className="stat-value-big font-mono">{formatTime(seconds)}</div>
              <div className="timer-controls">
                <button
                  className={`btn-timer-action ${isActive ? 'is-pause' : 'is-play'}`}
                  onClick={() => setIsActive(!isActive)}
                  title={isActive ? 'Pause Timer' : 'Resume Timer'}
                >
                  {isActive ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isActive ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  className="btn-timer-reset"
                  onClick={() => setSeconds(0)}
                  title="Reset Timer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Sniff Counter */}
            <div className="hud-stat-item">
              <div className="stat-label-tiny">SNIFF STOPS FOUND</div>
              <div className={`stat-value-big sniff-number ${sniffFeedback ? 'sniff-pop' : ''}`}>
                👃 {sniffCount}
              </div>
              <button
                className="btn-add-sniff"
                onClick={handleAddSniff}
                id="record-sniff-btn"
              >
                <Sparkles size={14} />
                <span>+1 Sniff Spot!</span>
              </button>
            </div>

            {/* Checkpoint Progress */}
            <div className="hud-stat-item">
              <div className="stat-label-tiny">PROGRESS</div>
              <div className="stat-value-big">
                {completedCount} / {checkpoints.length}
              </div>
              <div className="hud-progress-track">
                <div
                  className="hud-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Waypoint Spotlight */}
        <div className="active-waypoint-spotlight glass-panel">
          <div className="spotlight-header">
            <span className="badge-pill badge-cream">
              📍 Current Objective: Step {activeCheckpoint.stepNumber} of {checkpoints.length}
            </span>
            <span className="spotlight-scent-target">
              Target: {activeCheckpoint.targetSniffs} deep sniffs (
              {activeCheckpoint.sniffsRecorded} logged)
            </span>
          </div>

          <h3 className="spotlight-title">{activeCheckpoint.title}</h3>
          <p className="spotlight-desc">{activeCheckpoint.description}</p>

          <div className="spotlight-prompt-box">
            <div className="prompt-icon">🐾</div>
            <div>
              <div className="prompt-title">What {dogName} should sniff for:</div>
              <div className="prompt-text">{activeCheckpoint.scentPrompt}</div>
            </div>
          </div>

          <div className="spotlight-action-row">
            <button
              className={`btn-primary ${activeCheckpoint.completed ? 'completed-btn' : ''}`}
              onClick={() => toggleCheckpoint(activeStepIndex)}
            >
              <CheckCircle2 size={18} />
              <span>
                {activeCheckpoint.completed
                  ? 'Waypoint Completed! (Tap to uncheck)'
                  : 'Mark Checkpoint Complete'}
              </span>
            </button>

            {completedCount === checkpoints.length && !isFinished && (
              <button className="btn-finish-quest anim-bounce" onClick={handleFinishWalk}>
                <Trophy size={18} />
                <span>Complete Quest & Claim Trophy!</span>
              </button>
            )}
          </div>
        </div>

        {/* All Checkpoints Checklist */}
        <div className="checkpoints-interactive-section">
          <h3 className="interactive-section-title">Trail Checkpoints Roadmap</h3>

          <div className="interactive-checkpoints-grid">
            {checkpoints.map((cp, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={cp.id}
                  className={`checkpoint-step-card ${cp.completed ? 'is-done' : ''} ${
                    isCurrent ? 'is-selected' : ''
                  }`}
                  onClick={() => setActiveStepIndex(idx)}
                >
                  <div className="step-card-header">
                    <button
                      className={`step-checkbox ${cp.completed ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheckpoint(idx);
                      }}
                    >
                      {cp.completed && <CheckCircle2 size={20} />}
                    </button>
                    <div className="step-title-wrap">
                      <div className="step-tag">Step {cp.stepNumber}</div>
                      <h4 className="step-heading">{cp.title}</h4>
                    </div>
                  </div>

                  <p className="step-subdesc">{cp.description}</p>

                  <div className="step-footer-meta">
                    <span className="step-scent-snip">🎯 {cp.scentPrompt}</span>
                    <span className="step-sniff-ratio">
                      {cp.sniffsRecorded} / {cp.targetSniffs} sniffs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Celebration Modal when finished */}
        {isFinished && (
          <div className="finish-modal-overlay">
            <div className="glass-panel finish-modal-card">
              <div className="finish-trophy-emoji">{quest.badgeReward.iconEmoji}</div>
              <div className="badge-pill badge-gold mb-2">Quest Completed!</div>
              <h2 className="finish-title">Pawsome Job, {dogName}!</h2>
              <p className="finish-subtitle">
                You successfully guided your pup through{' '}
                <strong>{quest.title}</strong>!
              </p>

              <div className="finish-stats-summary">
                <div className="finish-stat-box">
                  <div className="finish-stat-value">{formatTime(seconds)}</div>
                  <div className="finish-stat-label">Walk Duration</div>
                </div>
                <div className="finish-stat-box">
                  <div className="finish-stat-value">{sniffCount}</div>
                  <div className="finish-stat-label">Sniffs Logged</div>
                </div>
                <div className="finish-stat-box">
                  <div className="finish-stat-value">{checkpoints.length}</div>
                  <div className="finish-stat-label">Waypoints Cleared</div>
                </div>
              </div>

              <div className="finish-badge-awarded">
                <div className="awarded-header">
                  <Award size={18} />
                  <span>New Badge Unlocked</span>
                </div>
                <div className="awarded-title">{quest.badgeReward.title}</div>
                <div className="awarded-desc">{quest.badgeReward.description}</div>
              </div>

              {/* Feedback & Walk Notes Section */}
              <div className="finish-feedback-card">
                <h4 className="feedback-card-title">How was {dogName}'s adventure?</h4>
                <div className="feedback-rating-stars">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      className={`star-rating-btn ${starVal <= rating ? 'active' : ''}`}
                      onClick={() => {
                        setRating(starVal);
                        saveWalkRecord(starVal, feedbackNotes);
                      }}
                      title={`Rate ${starVal} out of 5 paws`}
                    >
                      🐾
                    </button>
                  ))}
                  <span className="rating-text-hint">{rating} / 5 Paws Rating</span>
                </div>

                <div className="feedback-notes-input-wrap">
                  <textarea
                    className="feedback-notes-input"
                    placeholder={`Walk notes (e.g. ${dogName} loved the mossy logs and stayed calm!)`}
                    value={feedbackNotes}
                    rows={2}
                    onChange={(e) => {
                      setFeedbackNotes(e.target.value);
                      setFeedbackSaved(false);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-save-notes"
                    onClick={() => saveWalkRecord(rating, feedbackNotes)}
                  >
                    {feedbackSaved ? '✓ Saved to Walk Journal' : 'Save Walk Notes'}
                  </button>
                </div>
              </div>

              <div className="finish-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsFinished(false);
                    onSelectAnotherQuest();
                  }}
                >
                  Embark on Another Adventure
                </button>
                <button className="btn-secondary" onClick={onExitWalk}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
