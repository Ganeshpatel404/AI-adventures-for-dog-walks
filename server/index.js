import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { OFFLINE_ACTIVITIES, getOfflineActivity } from './offlineLibrary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All possible locations where the user or system might put .env
const CANDIDATE_ENV_PATHS = [
  path.resolve(__dirname, '../.env'),          // Project root .env (c:\Users\Ganesh\Documents\AI adventures for dog walks\.env)
  path.resolve(__dirname, '../.env.local'),    // Project root .env.local
  path.resolve(__dirname, '.env'),             // server/.env
  path.resolve(process.cwd(), '.env'),         // Current working directory .env
  path.resolve(process.cwd(), '.env.local'),   // Current working directory .env.local
];

// Helper to reload environment variables dynamically from all candidate paths
function reloadEnvironment() {
  for (const envPath of CANDIDATE_ENV_PATHS) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

// Initial load
reloadEnvironment();

// Secure helper to get the sanitized GEMINI_API_KEY without exposing it
function getSanitizedGeminiKey() {
  reloadEnvironment();
  let key = process.env.GEMINI_API_KEY || '';
  key = key.trim();
  // Strip surrounding quotes if the user pasted key with quotes (e.g. "AIza..." or 'AIza...')
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to check if Ollama is running locally
async function checkOllamaAvailability() {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${ollamaBaseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const models = data.models ? data.models.map((m) => m.name) : [];
      return { available: true, models, url: ollamaBaseUrl };
    }
    return { available: false, models: [], url: ollamaBaseUrl };
  } catch {
    return { available: false, models: [], url: ollamaBaseUrl };
  }
}

// Gemini runtime verification tracking
let geminiVerified = false;
let geminiLastStatus = 'untested'; // 'verified' | 'untested' | 'unavailable' | 'key_missing'
let geminiLastError = null;

// System Status Endpoint (Polls current status and reloads .env on demand)
app.get('/api/status', async (req, res) => {
  const key = getSanitizedGeminiKey();
  const hasGeminiKey = Boolean(
    key.length > 0 &&
      key !== 'your_gemini_api_key_here'
  );

  const ollamaStatus = await checkOllamaAvailability();

  // Find which env file exists on disk
  const existingEnvPath = CANDIDATE_ENV_PATHS.find((p) => fs.existsSync(p)) || CANDIDATE_ENV_PATHS[0];

  const status = !hasGeminiKey
    ? 'key_missing'
    : geminiVerified
    ? 'ready'
    : geminiLastStatus === 'unavailable'
    ? 'unavailable'
    : 'untested';

  res.json({
    gemini: {
      configured: hasGeminiKey,
      verified: geminiVerified,
      keyLength: hasGeminiKey ? key.length : 0,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      status,
      lastError: geminiLastError,
      activeEnvPath: existingEnvPath,
    },
    ollama: {
      available: ollamaStatus.available,
      models: ollamaStatus.models,
      url: ollamaStatus.url,
      defaultModel: process.env.OLLAMA_MODEL || 'llama3.2',
    },
    offlineLibrary: {
      available: true,
      activityCount: OFFLINE_ACTIVITIES.length,
      status: 'always_available',
    },
  });
});

// JSON Schema description for Quest generation
const QUEST_JSON_STRUCTURE = `{
  "title": "string (Creative quest name)",
  "subtitle": "string (Short enticing subtitle)",
  "tagline": "string (One sentence summary)",
  "theme": "string (detective | nature | urban | creek_trail | meadow)",
  "difficulty": "Easy" | "Medium" | "Adventurous",
  "durationMinutes": number,
  "distanceKm": number,
  "storyNarrative": "string (2-3 sentences of canine adventure storytelling)",
  "scentTags": ["string", "string", "string"],
  "badgeReward": {
    "title": "string",
    "description": "string",
    "iconEmoji": "string"
  },
  "checkpoints": [
    {
      "id": "cp-1",
      "stepNumber": 1,
      "title": "string",
      "description": "string",
      "scentPrompt": "string (specific sniffing direction)",
      "targetSniffs": number (between 2 and 5)
    },
    {
      "id": "cp-2",
      "stepNumber": 2,
      "title": "string",
      "description": "string",
      "scentPrompt": "string",
      "targetSniffs": number
    },
    {
      "id": "cp-3",
      "stepNumber": 3,
      "title": "string",
      "description": "string",
      "scentPrompt": "string",
      "targetSniffs": number
    }
  ]
}`;

// Classify a Gemini API error into a structured type.
// Returns: { code, retryable, userMessage }
function classifyGeminiError(err) {
  const msg = (err?.message || '').toLowerCase();
  const raw = JSON.stringify(err);

  // Parse HTTP status code from error properties, raw JSON, or message
  let httpCode = null;
  if (typeof err?.status === 'number') httpCode = err.status;
  if (typeof err?.statusCode === 'number') httpCode = err.statusCode;
  if (typeof err?.code === 'number') httpCode = err.code;
  if (!httpCode) {
    try {
      const match = raw.match(/"(?:code|status)":(\d+)/);
      if (match) httpCode = Number(match[1]);
    } catch { /* ignore */ }
  }
  if (!httpCode) {
    const codeMatch = msg.match(/\b(503|502|500|504|429|401|403|404|400)\b/);
    if (codeMatch) httpCode = Number(codeMatch[1]);
  }

  // Key / auth problems — not retryable
  if (
    msg.includes('api_key') ||
    msg.includes('api key') ||
    msg.includes('authentication') ||
    msg.includes('permission') ||
    msg.includes('invalid key') ||
    httpCode === 400 ||
    httpCode === 401 ||
    httpCode === 403
  ) {
    return {
      code: 'auth_error',
      retryable: false,
      userMessage: 'The Gemini API key is invalid or does not have access. Check your .env file.',
    };
  }

  // Model not found — retryable with fallback models
  if (
    msg.includes('not found') ||
    msg.includes('no longer available') ||
    httpCode === 404
  ) {
    return {
      code: 'model_not_found',
      retryable: true,
      userMessage: 'The requested Gemini model was not found or is unavailable. Switching to standard model…',
    };
  }

  // Quota exceeded / rate limit — retryable after backoff
  if (
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('resource_exhausted') ||
    httpCode === 429
  ) {
    return {
      code: 'quota_exceeded',
      retryable: true,
      userMessage: 'Gemini rate limit reached. Waiting for capacity…',
    };
  }

  // Temporary overload / 503 UNAVAILABLE / high demand — retryable
  if (
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('try again') ||
    msg.includes('temporarily') ||
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    httpCode === 503 ||
    httpCode === 502 ||
    httpCode === 504 ||
    httpCode === 500
  ) {
    return {
      code: 'model_busy',
      retryable: true,
      userMessage: 'Gemini is temporarily unavailable due to high demand (HTTP 503). Retrying…',
    };
  }

  // Generic fallback
  return {
    code: 'unknown',
    retryable: true,
    userMessage: `Gemini request failed: ${err?.message || 'Unknown error'}`,
  };
}

// Helper: sleep for ms milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Generate via Google Gemini API (with retry + backoff + model fallback)
async function generateWithGemini(criteria) {
  const apiKey = getSanitizedGeminiKey();
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length === 0) {
    const e = new Error('GEMINI_API_KEY is not configured in your local .env file. Please check line 2 of .env and save the file (Ctrl+S).');
    e.errorCode = 'key_missing';
    e.retryable = false;
    throw e;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Candidate models: start with configured model, then fallback to widely supported stable flash models
  const candidateModels = [...new Set([configuredModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'])];

  const MAX_RETRIES = 3;
  const BACKOFF_BASE_MS = 1500; // 1.5s, 3s

  const prompt = `You are SniffQuest AI, a creative canine sensory enrichment designer.
Generate a safe, delightful, olfactory-focused walking adventure for a dog with these details:
- Dog Name: ${criteria.dogName}
- Breed/Size: ${criteria.dogBreed}
- Energy Level: ${criteria.energyLevel}
- Adventure Theme: ${criteria.adventureTheme}
- Desired Duration: ${criteria.durationMinutes} minutes
- Ambient Weather: ${criteria.weatherCondition}

Focus on dog biology and sniffing enrichment (scent marking, moss, soil, pine cones, breezes).
Ensure the output is strictly valid JSON matching this structure:
${QUEST_JSON_STRUCTURE}`;

  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const modelName = candidateModels[(attempt - 1) % candidateModels.length];
    try {
      const TIMEOUT_MS = 20000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          const e = new Error('Gemini request timed out after 20 seconds. The server may be overloaded.');
          e.errorCode = 'model_busy';
          e.retryable = true;
          reject(e);
        }, TIMEOUT_MS)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        }),
        timeoutPromise,
      ]);

      const responseText = response.text;
      const parsed = JSON.parse(responseText);

      // Validate and assign ID & completion defaults
      parsed.id = `gemini-quest-${Date.now()}`;
      parsed.durationMinutes = criteria.durationMinutes || parsed.durationMinutes || 25;
      parsed.distanceKm = Number(((parsed.durationMinutes / 15) * 0.9).toFixed(1));
      parsed.checkpoints = (parsed.checkpoints || []).map((cp, idx) => ({
        id: `cp-gemini-${idx + 1}`,
        stepNumber: idx + 1,
        title: cp.title || `Waypoint ${idx + 1}`,
        description: cp.description || 'Observe your dog investigating the area.',
        scentPrompt: cp.scentPrompt || 'Encourage deep sniffing.',
        completed: false,
        sniffsRecorded: 0,
        targetSniffs: cp.targetSniffs || 3,
      }));

      // Successfully verified Gemini!
      geminiVerified = true;
      geminiLastStatus = 'verified';
      geminiLastError = null;

      return {
        quest: parsed,
        metadata: {
          source: 'gemini',
          isAIGenerated: true,
          label: 'Google Gemini (Cloud AI)',
          description: `Generated in real-time by Google Gemini (${modelName}) tailored specifically for ${criteria.dogName}.`,
        },
      };
    } catch (err) {
      lastErr = err;
      const classified = classifyGeminiError(err);

      // Non-retryable errors (e.g. invalid key): record status and fail immediately
      if (!classified.retryable) {
        geminiVerified = false;
        geminiLastStatus = classified.code === 'auth_error' ? 'key_missing' : 'unavailable';
        geminiLastError = classified.userMessage;

        const e = new Error(classified.userMessage);
        e.errorCode = classified.code;
        e.retryable = false;
        throw e;
      }

      if (attempt < MAX_RETRIES) {
        const delay = BACKOFF_BASE_MS * attempt;
        console.warn(`Gemini attempt ${attempt}/${MAX_RETRIES} with model ${modelName} failed (${classified.code}). Retrying in ${delay}ms…`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  geminiVerified = false;
  geminiLastStatus = 'unavailable';
  geminiLastError = lastErr?.message || 'High demand on Gemini servers (HTTP 503)';

  const classified = classifyGeminiError(lastErr);
  const e = new Error(
    classified.code === 'model_busy'
      ? 'Gemini is temporarily unavailable due to high demand (HTTP 503). Please try again shortly or use the offline library.'
      : classified.userMessage
  );
  e.errorCode = classified.code;
  e.retryable = classified.retryable;
  throw e;
}

// Helper: Generate via Local Ollama
async function generateWithOllama(criteria) {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

  const prompt = `Generate a safe dog walking olfactory quest in valid JSON for:
Dog Name: ${criteria.dogName}, Breed: ${criteria.dogBreed}, Energy: ${criteria.energyLevel}, Theme: ${criteria.adventureTheme}, Duration: ${criteria.durationMinutes}m, Weather: ${criteria.weatherCondition}.
Return ONLY valid JSON matching this schema:
${QUEST_JSON_STRUCTURE}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout for local model

  const res = await fetch(`${ollamaBaseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      prompt: prompt,
      format: 'json',
      stream: false,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`Ollama responded with status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.response);

  parsed.id = `ollama-quest-${Date.now()}`;
  parsed.durationMinutes = criteria.durationMinutes || parsed.durationMinutes || 25;
  parsed.distanceKm = Number(((parsed.durationMinutes / 15) * 0.9).toFixed(1));
  parsed.checkpoints = (parsed.checkpoints || []).map((cp, idx) => ({
    id: `cp-ollama-${idx + 1}`,
    stepNumber: idx + 1,
    title: cp.title || `Waypoint ${idx + 1}`,
    description: cp.description || 'Observe your dog investigating the area.',
    scentPrompt: cp.scentPrompt || 'Encourage deep sniffing.',
    completed: false,
    sniffsRecorded: 0,
    targetSniffs: cp.targetSniffs || 3,
  }));

  return {
    quest: parsed,
    metadata: {
      source: 'offline_ollama',
      isAIGenerated: true,
      label: 'Local Ollama (Offline AI)',
      description: `Generated completely offline using local open-weight model (${ollamaModel}). No cloud data was sent.`,
    },
  };
}

// Quest Generation Route
app.post('/api/generate-quest', async (req, res) => {
  reloadEnvironment();

  const {
    dogName = 'Barnaby',
    dogBreed = 'Golden Retriever',
    energyLevel = 'moderate',
    adventureTheme = 'detective',
    durationMinutes = 25,
    weatherCondition = 'Crisp Morning & Dew',
    preferredMode = 'auto', // 'auto' | 'online' | 'offline_ollama' | 'offline_library'
  } = req.body;

  const criteria = {
    dogName,
    dogBreed,
    energyLevel,
    adventureTheme,
    durationMinutes: Number(durationMinutes) || 25,
    weatherCondition,
  };

  // 1. Explicit Offline Safe Activity Library
  if (preferredMode === 'offline_library') {
    // Strictly offline: do NOT contact Gemini or external cloud
    const result = getOfflineActivity(criteria);
    return res.json(result);
  }

  // 2. Explicit Local Ollama (Offline AI)
  if (preferredMode === 'offline_ollama') {
    // Strictly offline: do NOT contact Gemini
    try {
      const result = await generateWithOllama(criteria);
      return res.json(result);
    } catch (ollamaErr) {
      // Ollama was requested but failed/unavailable -> Fallback to built-in offline library
      const fallback = getOfflineActivity(criteria);
      fallback.metadata.fallbackReason = `Local Ollama is not responding (${ollamaErr.message}). Gracefully switched to the Offline Safe Activity Library.`;
      return res.json(fallback);
    }
  }

  // 3. Explicit Online Gemini (with resilient fallback if busy)
  if (preferredMode === 'online') {
    try {
      const result = await generateWithGemini(criteria);
      return res.json(result);
    } catch (geminiErr) {
      console.warn('Gemini failed in ONLINE mode:', geminiErr.message);

      // If Gemini fails, use Ollama only if a local model is actually available
      const ollamaCheck = await checkOllamaAvailability();
      if (ollamaCheck.available && ollamaCheck.models.length > 0) {
        try {
          const result = await generateWithOllama(criteria);
          result.metadata.fallbackReason = `Gemini was temporarily unavailable (${geminiErr.message}). Fell back to local Ollama.`;
          result.warning = `Gemini was unavailable (${geminiErr.message}). Generated using local Ollama.`;
          return res.json(result);
        } catch (ollamaErr) {
          console.warn('Ollama fallback also failed:', ollamaErr.message);
        }
      }

      // Otherwise, use the existing offline activity library and label its results honestly
      const fallback = getOfflineActivity(criteria);
      fallback.metadata.fallbackReason = `Gemini was temporarily unavailable due to high demand (HTTP 503). Loaded from the Built-in Offline Safe Activity Library so you can start walking immediately.`;
      fallback.warning = `Gemini was temporarily busy (HTTP 503). Loaded safe activity from the offline library.`;
      fallback.geminiUnavailable = true;
      fallback.geminiError = geminiErr.message;
      return res.json(fallback);
    }
  }

  // 4. AUTO MODE (Resilient Fallback Chain: Gemini -> Ollama (only if model loaded) -> Offline Library)
  const currentKey = getSanitizedGeminiKey();
  const hasGeminiKey = Boolean(
    currentKey.length > 0 &&
      currentKey !== 'your_gemini_api_key_here'
  );

  let geminiFailReason = null;

  if (hasGeminiKey) {
    try {
      const result = await generateWithGemini(criteria);
      return res.json(result);
    } catch (geminiErr) {
      geminiFailReason = geminiErr.message;
      console.warn('Gemini failed in AUTO mode, checking offline alternatives:', geminiErr.message);
      // Non-retryable key errors skip straight to offline — no point trying Ollama
      if (geminiErr.errorCode === 'auth_error' || geminiErr.errorCode === 'key_missing') {
        const fallback = getOfflineActivity(criteria);
        fallback.metadata.fallbackReason =
          'Gemini API key is invalid. Loaded from the Built-in Offline Safe Activity Library. Fix GEMINI_API_KEY in .env.';
        return res.json(fallback);
      }
    }
  }

  // Step B: Attempt Ollama ONLY if models are actually installed on this machine
  const ollamaCheck = await checkOllamaAvailability();
  if (ollamaCheck.available && ollamaCheck.models.length > 0) {
    try {
      const result = await generateWithOllama(criteria);
      result.metadata.fallbackReason = hasGeminiKey
        ? `Gemini was temporarily unavailable (${geminiFailReason}). Fell back to local Ollama.`
        : 'GEMINI_API_KEY not configured in .env. Used local Ollama for offline AI generation.';
      return res.json(result);
    } catch (ollamaErr) {
      console.warn('Ollama also failed in AUTO mode:', ollamaErr.message);
    }
  }

  // Step C: Fallback to Built-in Offline Library
  const fallback = getOfflineActivity(criteria);
  const ollamaNoModels = ollamaCheck.available && ollamaCheck.models.length === 0;
  fallback.metadata.fallbackReason = !hasGeminiKey
    ? 'GEMINI_API_KEY is not set in .env and no local Ollama model is installed. Loaded from the Built-in Offline Safe Activity Library.'
    : ollamaNoModels
    ? `Gemini was temporarily busy and Ollama has no models installed. Loaded from the Built-in Offline Safe Activity Library.`
    : `Gemini was temporarily busy (${geminiFailReason}) and local Ollama is offline. Loaded from the Built-in Offline Safe Activity Library.`;
  return res.json(fallback);
});

// Start listening
app.listen(PORT, () => {
  console.log(`🐾 SniffQuest Backend running on http://localhost:${PORT}`);
  console.log(`- Loaded candidate paths: ${CANDIDATE_ENV_PATHS.length} locations monitored.`);
  console.log(`- Offline Activity Library: Ready (${OFFLINE_ACTIVITIES.length} activities)`);
});
