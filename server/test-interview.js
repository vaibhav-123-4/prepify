// End-to-end test: Register → Start Interview → Verify questions
const BASE = 'http://localhost:5000';

async function test() {
  console.log('=== Step 1: Register a test user ===');
  const registerRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
    }),
  });
  const registerData = await registerRes.json();
  console.log('Status:', registerRes.status);
  console.log('Response:', JSON.stringify(registerData, null, 2));

  if (!registerData.token) {
    console.error('❌ Registration failed — no token returned');
    process.exit(1);
  }
  console.log('✅ Registration successful\n');

  console.log('=== Step 2: Start interview session ===');
  const startRes = await fetch(`${BASE}/api/interview/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${registerData.token}`,
    },
    body: JSON.stringify({
      role: 'Frontend Developer',
      experienceLevel: 'Fresher',
      jobDescription: 'React.js position at a startup',
    }),
  });
  const startData = await startRes.json();
  console.log('Status:', startRes.status);
  console.log('Response:', JSON.stringify(startData, null, 2));

  if (!startData.sessionId) {
    console.error('❌ No sessionId returned');
    process.exit(1);
  }
  if (!Array.isArray(startData.questions) || startData.questions.length === 0) {
    console.error('❌ No questions returned');
    process.exit(1);
  }

  console.log(`\n✅ Interview started! Got ${startData.questions.length} questions:`);
  startData.questions.forEach((q, i) => {
    console.log(`  ${i + 1}. [${q.category}] [${q.difficulty}] ${q.question}`);
  });

  console.log('\n🎉 All tests passed!');
}

test().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
