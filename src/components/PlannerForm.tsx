import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Sparkles,
  Dog,
  Battery,
  Compass,
  Clock,
  CloudSun,
  Check,
  Wifi,
  Cpu,
  BookOpen,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type {
  AdventureTheme,
  EnergyLevel,
  OperationMode,
  PlannerFormData,
  Quest,
  SystemStatus,
} from '../types';
import { requestQuestGeneration } from '../services/questApi';

interface PlannerFormProps {
  onGenerateQuest: (customQuest: Quest) => void;
  systemStatus: SystemStatus | null;
}

export const PlannerForm: FC<PlannerFormProps> = ({ onGenerateQuest, systemStatus }) => {
  const [formData, setFormData] = useState<PlannerFormData>(() => {
    try {
      const saved = localStorage.getItem('sniffquest_planner_form');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch { /* ignore */ }
    return {
      dogName: 'Barnaby',
      dogBreed: 'Golden Retriever',
      energyLevel: 'moderate',
      adventureTheme: 'detective',
      durationMinutes: 25,
      weatherCondition: 'Crisp Morning & Dew',
      operationMode: 'auto',
    };
  });

  // Keep user selections persistent in browser storage
  useEffect(() => {
    try {
      localStorage.setItem('sniffquest_planner_form', JSON.stringify(formData));
    } catch { /* ignore */ }
  }, [formData]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorTip, setErrorTip] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    label: string;
    isAIGenerated: boolean;
    fallbackReason?: string;
  } | null>(null);

  const isGeminiVerified = systemStatus?.gemini?.verified === true;
  const isGeminiUnavailable = systemStatus?.gemini?.status === 'unavailable';
  const isGeminiConfigured = Boolean(systemStatus?.gemini?.configured);
  const isOllamaAvailable = Boolean(systemStatus?.ollama?.available && (systemStatus?.ollama?.models?.length || 0) > 0);

  const handleEnergySelect = (level: EnergyLevel) => {
    setFormData((prev) => ({ ...prev, energyLevel: level }));
  };

  const handleThemeSelect = (theme: AdventureTheme) => {
    setFormData((prev) => ({ ...prev, adventureTheme: theme }));
  };

  const handleModeSelect = (mode: OperationMode) => {
    setFormData((prev) => ({ ...prev, operationMode: mode }));
    setErrorMsg(null);
    setSuccessInfo(null);
  };

  const executeGeneration = async (modeOverride?: OperationMode) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setErrorCode(null);
    setErrorTip(null);
    setSuccessInfo(null);

    const activeForm = modeOverride
      ? { ...formData, operationMode: modeOverride }
      : formData;

    try {
      const result = await requestQuestGeneration(activeForm);
      setIsGenerating(false);

      setSuccessInfo({
        label: result.metadata.label,
        isAIGenerated: result.metadata.isAIGenerated,
        fallbackReason: result.metadata.fallbackReason || result.warning,
      });

      onGenerateQuest(result.quest);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || 'An unexpected error occurred while generating the adventure.');
      setErrorCode(err.errorCode || 'unknown');
      setErrorTip(err.tip || null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeGeneration();
  };

  const getLoadingText = () => {
    switch (formData.operationMode) {
      case 'online':
        return 'Connecting to Google Gemini via secure backend...';
      case 'offline_ollama':
        return 'Generating via local Ollama open-weight model...';
      case 'offline_library':
        return 'Selecting from Offline Safe Activity Library...';
      default:
        return 'SniffQuest AI is generating your adventure...';
    }
  };

  return (
    <section className="planner-section" id="planner-form">
      <div className="container">
        <div className="section-header text-center">
          <div className="badge-pill badge-forest">
            <Sparkles size={14} />
            <span>AI Walk Generator • Online & Offline</span>
          </div>
          <h2 className="section-title">Design a Custom Adventure</h2>
          <p className="section-subtitle">
            Configure your pup's traits and choose between Cloud AI (Google Gemini), Local AI (Ollama),
            or our Built-in Offline Activity Library.
          </p>
        </div>

        <form className="glass-panel planner-form-card" onSubmit={handleSubmit}>
          {/* Operation Mode Selector */}
          <div className="mode-selector-wrapper">
            <div className="mode-selector-label">
              <span>Choose Operation Mode:</span>
            </div>
            <div className="mode-options-grid">
              <button
                type="button"
                className={`mode-btn ${formData.operationMode === 'auto' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('auto')}
              >
                <div className="mode-btn-header">
                  <Sparkles size={16} />
                  <strong>Auto Resilient</strong>
                </div>
                <span className="mode-btn-desc">
                  Tries Gemini Cloud → Local Ollama → Offline Library automatically
                </span>
                <span className="mode-btn-badge badge-forest">Recommended</span>
              </button>

              <button
                type="button"
                className={`mode-btn ${formData.operationMode === 'online' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('online')}
              >
                <div className="mode-btn-header">
                  <Wifi size={16} />
                  <strong>Google Gemini (Online)</strong>
                </div>
                <span className="mode-btn-desc">
                  Cloud generative AI via secure backend (requires GEMINI_API_KEY)
                </span>
                <span
                  className={`mode-btn-badge ${isGeminiVerified
                    ? 'badge-forest'
                    : isGeminiUnavailable
                      ? 'badge-gold'
                      : isGeminiConfigured
                        ? 'badge-forest'
                        : 'badge-gold'
                    }`}
                >
                  {isGeminiVerified
                    ? 'Verified Online'
                    : isGeminiUnavailable
                      ? 'Temporarily Busy'
                      : isGeminiConfigured
                        ? 'Key Configured'
                        : 'Needs .env Key'}
                </span>
              </button>

              <button
                type="button"
                className={`mode-btn ${formData.operationMode === 'offline_ollama' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('offline_ollama')}
              >
                <div className="mode-btn-header">
                  <Cpu size={16} />
                  <strong>Local Ollama (Offline AI)</strong>
                </div>
                <span className="mode-btn-desc">
                  Local open-weight model on your PC. Zero data sent to the cloud.
                </span>
                <span className={`mode-btn-badge ${isOllamaAvailable ? 'badge-forest' : 'badge-cream'}`}>
                  {isOllamaAvailable ? 'Ollama Online' : 'Ollama Offline'}
                </span>
              </button>

              <button
                type="button"
                className={`mode-btn ${formData.operationMode === 'offline_library' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('offline_library')}
              >
                <div className="mode-btn-header">
                  <BookOpen size={16} />
                  <strong>Safe Offline Library</strong>
                </div>
                <span className="mode-btn-desc">
                  Curated sample sensory activities. Zero AI, 100% offline & safe.
                </span>
                <span className="mode-btn-badge badge-forest">Always Ready</span>
              </button>
            </div>

            {/* Privacy & Security Callout */}
            <div className="security-notice-box">
              <ShieldCheck size={16} className="security-icon" />
              <span>
                <strong>Zero Leak Guarantee:</strong> API keys are read strictly from your local{' '}
                <code>.env</code> file by the Node.js backend. In Offline mode, no data is sent to cloud
                APIs.
              </span>
            </div>
          </div>

          <div className="form-grid mt-4">
            {/* Dog Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="dog-name-input">
                <Dog size={16} />
                <span>Dog's Name</span>
              </label>
              <input
                id="dog-name-input"
                type="text"
                className="form-input"
                value={formData.dogName}
                onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                placeholder="e.g. Barnaby"
                required
              />
            </div>

            {/* Dog Breed */}
            <div className="form-group">
              <label className="form-label" htmlFor="dog-breed-input">
                <span>Breed or Size</span>
              </label>
              <input
                id="dog-breed-input"
                type="text"
                className="form-input"
                value={formData.dogBreed}
                onChange={(e) => setFormData({ ...formData, dogBreed: e.target.value })}
                placeholder="e.g. Golden Retriever, Beagle mix"
                required
              />
            </div>
          </div>

          {/* Energy Level Selector */}
          <div className="form-group mt-4">
            <label className="form-label">
              <Battery size={16} />
              <span>Energy & Pace Level</span>
            </label>
            <div className="energy-options-grid">
              <button
                type="button"
                className={`energy-option-btn ${formData.energyLevel === 'mellow' ? 'selected' : ''}`}
                onClick={() => handleEnergySelect('mellow')}
              >
                <span className="energy-icon">🌿</span>
                <div>
                  <div className="energy-title">Mellow Stroll</div>
                  <div className="energy-desc">Gentle sniffing, frequent stops, leisurely pace</div>
                </div>
              </button>

              <button
                type="button"
                className={`energy-option-btn ${formData.energyLevel === 'moderate' ? 'selected' : ''}`}
                onClick={() => handleEnergySelect('moderate')}
              >
                <span className="energy-icon">🐕</span>
                <div>
                  <div className="energy-title">Curious Explorer</div>
                  <div className="energy-desc">Balanced stroll with steady tracking & curiosity</div>
                </div>
              </button>

              <button
                type="button"
                className={`energy-option-btn ${formData.energyLevel === 'high_energy' ? 'selected' : ''}`}
                onClick={() => handleEnergySelect('high_energy')}
              >
                <span className="energy-icon">⚡</span>
                <div>
                  <div className="energy-title">High Energy Zoomies</div>
                  <div className="energy-desc">Fast-paced, brisk trek with active challenges</div>
                </div>
              </button>
            </div>
          </div>

          {/* Adventure Theme */}
          <div className="form-group mt-4">
            <label className="form-label">
              <Compass size={16} />
              <span>Adventure Story Theme</span>
            </label>
            <div className="theme-chips-row">
              <button
                type="button"
                className={`theme-chip ${formData.adventureTheme === 'detective' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('detective')}
              >
                🕵️ The Squirrel Detective
              </button>
              <button
                type="button"
                className={`theme-chip ${formData.adventureTheme === 'nature' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('nature')}
              >
                🌲 Whispering Forest & Pine
              </button>
              <button
                type="button"
                className={`theme-chip ${formData.adventureTheme === 'urban' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('urban')}
              >
                🏙️ Bakery & Hydrant Safari
              </button>
              <button
                type="button"
                className={`theme-chip ${formData.adventureTheme === 'creek_trail' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('creek_trail')}
              >
                🌊 Whispering Brook Trail
              </button>
              <button
                type="button"
                className={`theme-chip ${formData.adventureTheme === 'meadow' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('meadow')}
              >
                🌼 Wildflower Meadow Odyssey
              </button>
            </div>
          </div>

          <div className="form-grid mt-4">
            {/* Duration */}
            <div className="form-group">
              <label className="form-label" htmlFor="duration-slider">
                <Clock size={16} />
                <span>Walk Duration: {formData.durationMinutes} minutes</span>
              </label>
              <input
                id="duration-slider"
                type="range"
                min="15"
                max="60"
                step="5"
                className="duration-range-slider"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              />
              <div className="slider-ticks">
                <span>15m Quick</span>
                <span>30m Standard</span>
                <span>45m Long</span>
                <span>60m Trek</span>
              </div>
            </div>

            {/* Weather / Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="weather-select">
                <CloudSun size={16} />
                <span>Weather & Ambient Atmosphere</span>
              </label>
              <select
                id="weather-select"
                className="form-input form-select"
                value={formData.weatherCondition}
                onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
              >
                <option value="Crisp Morning & Dew">Crisp Morning & Dew (High Scent Retention)</option>
                <option value="Sunny Afternoon Breeze">Sunny Afternoon Breeze (Warm Aromas)</option>
                <option value="Misty Drizzle & Damp Soil">Misty Drizzle & Damp Soil (Intense Aromas)</option>
                <option value="Twilight Cool Air">Twilight Cool Air (Nocturnal Wildlife Scents)</option>
              </select>
            </div>
          </div>

          {/* Error Message & Retry Option */}
          {errorMsg && (
            <div className="form-error-banner mt-4">
              <div className="error-banner-header">
                <AlertCircle size={18} className="error-icon" />
                <strong>
                  {errorCode === 'model_busy' || errorCode === 'quota_exceeded'
                    ? '⏳ Gemini is Temporarily Busy'
                    : errorCode === 'key_missing'
                      ? '🔑 API Key Not Configured'
                      : errorCode === 'auth_error'
                        ? '🔑 Invalid API Key'
                        : errorCode === 'model_not_found'
                          ? '⚙️ Model Unavailable'
                          : '⚠️ Generation Error'}
                </strong>
              </div>
              <p className="error-banner-desc">{errorMsg}</p>
              {errorTip && <p className="error-banner-tip">💡 {errorTip}</p>}
              <div className="error-banner-actions">
                {(errorCode === 'model_busy' || errorCode === 'quota_exceeded' || errorCode === 'unknown') && (
                  <button
                    type="button"
                    className="btn-retry"
                    onClick={() => executeGeneration()}
                    disabled={isGenerating}
                  >
                    <RotateCcw size={15} />
                    <span>Try Again</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-fallback-action"
                  onClick={() => executeGeneration('offline_library')}
                  disabled={isGenerating}
                >
                  <BookOpen size={15} />
                  <span>Use Safe Offline Library Instead</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="form-submit-row">
            <button
              type="submit"
              className="btn-primary form-submit-btn"
              disabled={isGenerating}
              id="generate-adventure-btn"
            >
              {isGenerating ? (
                <>
                  <span className="spinner-dot"></span>
                  <span>{getLoadingText()}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Adventure for {formData.dogName || 'Pup'}</span>
                </>
              )}
            </button>

            {successInfo && (
              <div className="generation-success-card">
                <div className="success-header">
                  <Check size={16} className="text-forest-green" />
                  <span>
                    Quest Ready via <strong>{successInfo.label}</strong>
                  </span>
                  <span
                    className={`badge-pill ${successInfo.isAIGenerated ? 'badge-forest' : 'badge-gold'
                      }`}
                  >
                    {successInfo.isAIGenerated ? 'AI Generated' : 'Offline Sample Activity'}
                  </span>
                </div>
                {successInfo.fallbackReason && (
                  <p className="fallback-note">ℹ️ {successInfo.fallbackReason}</p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};
