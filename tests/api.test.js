import assert from 'node:assert/strict';
import http from 'node:http';

console.log('🧪 Starting Backend API Endpoints Test on port 3001...');

const TEST_PORT = 3001;

function fetchJson(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function run() {
  try {
    // Test 1: GET /api/status
    const statusRes = await fetchJson('/api/status');
    assert.equal(statusRes.status, 200, 'Status endpoint must return 200');
    assert(statusRes.data.gemini, 'Status must include gemini status');
    assert(statusRes.data.ollama, 'Status must include ollama status');
    assert(statusRes.data.offlineLibrary, 'Status must include offlineLibrary status');
    assert.equal(statusRes.data.offlineLibrary.available, true, 'offlineLibrary must be available');
    console.log('✓ API Test 1 Passed: /api/status responded with 200 and valid schema.');

    // Test 2: POST /api/generate-quest (offline_library mode)
    const genRes = await fetchJson('/api/generate-quest', {
      method: 'POST',
      body: {
        dogName: 'Daisy',
        dogBreed: 'Beagle',
        energyLevel: 'moderate',
        adventureTheme: 'nature',
        durationMinutes: 20,
        preferredMode: 'offline_library',
      },
    });

    assert.equal(genRes.status, 200, 'Offline generation must return 200');
    assert(genRes.data.quest, 'Must contain quest');
    assert(genRes.data.quest.title.includes('Daisy'), 'Must be personalized with Daisy');
    assert.equal(genRes.data.metadata.source, 'offline_library', 'Source must be offline_library');
    assert.equal(genRes.data.metadata.isAIGenerated, false, 'isAIGenerated must be false');
    console.log('✓ API Test 2 Passed: /api/generate-quest in offline_library mode returned valid personalized quest.');

    console.log('🎉 All Backend API tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ API Test Failed:', err);
    process.exit(1);
  }
}

run();
