import assert from 'node:assert/strict';
import { OFFLINE_ACTIVITIES, getOfflineActivity } from '../server/offlineLibrary.js';

console.log('🧪 Starting Independent Offline Activity Tests...');

// Test 1: Verify offline library exists and has curated activities
assert(Array.isArray(OFFLINE_ACTIVITIES), 'OFFLINE_ACTIVITIES must be an array');
assert(OFFLINE_ACTIVITIES.length >= 3, `Expected at least 3 curated activities, found ${OFFLINE_ACTIVITIES.length}`);
console.log(`✓ Test 1 Passed: Found ${OFFLINE_ACTIVITIES.length} curated offline activities.`);

// Test 2: Test personalization with custom dog name and criteria
const testCriteria = {
  dogName: 'Sherlock',
  theme: 'detective',
  durationMinutes: 30,
  energyLevel: 'high_energy',
};

const result = getOfflineActivity(testCriteria);
assert(result.quest, 'Result must contain quest object');
assert(result.quest.title.includes('Sherlock'), 'Quest title should be personalized with dog name');
assert.equal(result.quest.durationMinutes, 30, 'Duration should match request');
assert.equal(result.quest.theme, 'detective', 'Theme should match request');
assert(Array.isArray(result.quest.checkpoints), 'Checkpoints must be an array');
assert(result.quest.checkpoints.length >= 3, 'Must have at least 3 checkpoints');
console.log(`✓ Test 2 Passed: Personalized quest "${result.quest.title}" generated successfully.`);

// Test 3: Verify checkpoints structure
result.quest.checkpoints.forEach((cp, index) => {
  assert(cp.id, `Checkpoint ${index + 1} must have an id`);
  assert(typeof cp.stepNumber === 'number', `Checkpoint ${index + 1} must have stepNumber`);
  assert(cp.title, `Checkpoint ${index + 1} must have title`);
  assert(cp.description, `Checkpoint ${index + 1} must have description`);
  assert(cp.scentPrompt, `Checkpoint ${index + 1} must have scentPrompt`);
  assert(typeof cp.targetSniffs === 'number', `Checkpoint ${index + 1} must have targetSniffs`);
});
console.log('✓ Test 3 Passed: Checkpoint schema is strictly valid.');

// Test 4: Verify honest labeling metadata
assert.equal(result.metadata.source, 'offline_library', 'Source must be honestly labeled as offline_library');
assert.equal(result.metadata.isAIGenerated, false, 'isAIGenerated must be false for offline library');
assert.equal(result.metadata.label, 'Offline Safe Activity Library', 'Label must be honest');
console.log('✓ Test 4 Passed: Metadata is honestly labeled as Offline Safe Activity Library (not AI).');

// Test 5: Test fallback theme when unknown theme requested
const fallbackResult = getOfflineActivity({ dogName: 'Bella', theme: 'nonexistent_theme', durationMinutes: 15 });
assert(fallbackResult.quest, 'Fallback quest must be returned for unknown theme');
assert(fallbackResult.quest.title.includes('Bella'), 'Fallback quest should still be personalized');
console.log('✓ Test 5 Passed: Graceful fallback for non-matching themes works.');

console.log('🎉 All offline activity tests passed completely independently of Gemini and Ollama!');
