import type { PlannerFormData, Quest, QuestMetadata, SystemStatus } from '../types';
import { getClientOfflineActivity } from '../data/offlineActivities';

export interface GenerateResult {
  quest: Quest;
  metadata: QuestMetadata;
  warning?: string;
}

export async function fetchSystemStatus(): Promise<SystemStatus | null> {
  try {
    const res = await fetch('/api/status', {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Backend server is not running or unreachable
    return null;
  }
}

export async function requestQuestGeneration(
  formData: PlannerFormData
): Promise<GenerateResult> {
  // If the user selected the built-in offline safe library, we can fulfill it locally
  // or via backend, ensuring NO cloud service is contacted.
  if (formData.operationMode === 'offline_library') {
    try {
      const res = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferredMode: 'offline_library',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Backend not running, use client-side offline library
    }
    const quest = getClientOfflineActivity(formData);
    return {
      quest,
      metadata: quest.metadata || {
        source: 'offline_library',
        isAIGenerated: false,
        label: 'Offline Safe Activity Library',
      },
    };
  }

  // For 'auto', 'online', or 'offline_ollama'
  try {
    const res = await fetch('/api/generate-quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        preferredMode: formData.operationMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }

    const errData = await res.json().catch(() => null);
    const errorCode: string = errData?.errorCode || 'unknown';
    const retryable: boolean = errData?.retryable !== false;

    // Build a clear, human-readable message based on error type
    let userMessage: string;
    if (errorCode === 'model_busy' || errorCode === 'quota_exceeded') {
      userMessage = 'Gemini is temporarily busy. Please try again shortly.';
    } else if (errorCode === 'key_missing') {
      userMessage = 'GEMINI_API_KEY is missing from your .env file. Add the key and press Ctrl+S to save.';
    } else if (errorCode === 'auth_error') {
      userMessage = 'The Gemini API key is invalid. Ensure it starts with "AIza" and was copied from Google AI Studio.';
    } else if (errorCode === 'model_not_found') {
      userMessage = 'The selected Gemini model is not available. Update GEMINI_MODEL in your .env file.';
    } else {
      userMessage = errData?.error || `Backend error (HTTP ${res.status}).`;
    }

    const tip = errData?.tip || '';

    // If explicit online was chosen, throw a typed error so UI shows correct message & retry option
    if (formData.operationMode === 'online') {
      const e: any = new Error(userMessage);
      e.errorCode = errorCode;
      e.retryable = retryable;
      e.tip = tip;
      throw e;
    }

    // If auto or ollama failed, fallback to client offline library
    const fallbackQuest = getClientOfflineActivity(formData);
    return {
      quest: fallbackQuest,
      metadata: fallbackQuest.metadata || {
        source: 'offline_library',
        isAIGenerated: false,
        label: 'Offline Safe Activity Library',
      },
      warning: `${userMessage} Fallen back to Offline Safe Activity Library.`,
    };
  } catch (err: any) {
    // If user explicitly chose online, let the error bubble up to the UI
    if (formData.operationMode === 'online') {
      throw err;
    }

    // Resilient fallback for auto or offline
    const fallbackQuest = getClientOfflineActivity(formData);
    return {
      quest: fallbackQuest,
      metadata: fallbackQuest.metadata || {
        source: 'offline_library',
        isAIGenerated: false,
        label: 'Offline Safe Activity Library',
        fallbackReason: 'Backend is offline. Automatically loaded safe activities from built-in library.',
      },
      warning: 'Could not connect to local server. Loaded safe activity from built-in offline library.',
    };
  }
}
