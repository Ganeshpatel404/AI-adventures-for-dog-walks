export type NavigationTab = 'home' | 'planner' | 'quests' | 'walk-mode' | 'history';
export type EnergyLevel = 'mellow' | 'moderate' | 'high_energy';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Adventurous';
export type AdventureTheme = 'nature' | 'detective' | 'urban' | 'creek_trail' | 'meadow';

export type OperationMode = 'auto' | 'online' | 'offline_ollama' | 'offline_library';
export type GenerationSource = 'gemini' | 'offline_ollama' | 'offline_library' | 'sample';

export interface QuestMetadata {
  source: GenerationSource;
  isAIGenerated: boolean;
  label: string;
  description?: string;
  fallbackReason?: string;
}

export interface DogProfile {
  name: string;
  breed: string;
  energyLevel: EnergyLevel;
  favoriteScent?: string;
}

export interface PlannerFormData {
  dogName: string;
  dogBreed: string;
  energyLevel: EnergyLevel;
  adventureTheme: AdventureTheme;
  durationMinutes: number;
  weatherCondition: string;
  operationMode: OperationMode;
}

export interface QuestCheckpoint {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  scentPrompt: string;
  completed: boolean;
  sniffsRecorded: number;
  targetSniffs: number;
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  theme: AdventureTheme;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  distanceKm: number;
  storyNarrative: string;
  scentTags: string[];
  badgeReward: {
    title: string;
    description: string;
    iconEmoji: string;
  };
  checkpoints: QuestCheckpoint[];
  metadata?: QuestMetadata;
}

export interface SystemStatus {
  gemini: {
    configured: boolean;
    verified?: boolean;
    model: string;
    status: 'ready' | 'untested' | 'unavailable' | 'key_missing';
    lastError?: string | null;
  };
  ollama: {
    available: boolean;
    models: string[];
    url: string;
    defaultModel: string;
  };
  offlineLibrary: {
    available: boolean;
    activityCount: number;
    status: string;
  };
}

export interface WalkHistoryItem {
  id: string;
  questTitle: string;
  questTheme: AdventureTheme;
  dogName: string;
  completedAt: string;
  durationSeconds: number;
  sniffCount: number;
  checkpointsCompleted: number;
  totalCheckpoints: number;
  badgeReward: {
    title: string;
    description: string;
    iconEmoji: string;
  };
  rating?: number; // 1 to 5 stars
  feedbackNotes?: string;
}

export interface ActiveWalkSession {
  quest: Quest;
  dogName: string;
  secondsElapsed: number;
  isActive: boolean;
  isPaused: boolean;
  totalSniffs: number;
  completedCheckpointIds: string[];
  isCompleted: boolean;
  journalNotes?: string[];
}
