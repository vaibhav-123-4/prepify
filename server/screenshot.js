import puppeteer from 'puppeteer';

const BASE = 'http://localhost:5173';
const SCREENSHOT_DIR = 'C:/Users/Vaibhav Sharma/.gemini/antigravity/brain/bafc563b-0323-40af-978f-7dc8569ca531';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Set auth token directly in localStorage
  console.log('Logging in via API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@test.com', password: 'demo123' })
  });
  const loginData = await loginRes.json();

  // Get the latest completed session
  const sessionsRes = await fetch('http://localhost:5000/api/interview/sessions', {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  const sessions = await sessionsRes.json();
  const completedSession = sessions.find(s => s.completedAt);

  if (!completedSession) {
    console.error('No completed session found');
    await browser.close();
    return;
  }

  console.log('Found completed session:', completedSession.sessionId, 'Score:', completedSession.overallScore);

  // Navigate to app first to set localStorage
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, loginData.token, loginData.user);

  // Fetch full session data for the results page
  const fullSessionRes = await fetch(`http://localhost:5000/api/interview/sessions`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });

  // We need the full session data — let's get it from the complete endpoint
  // But since it's already completed, let's just fetch it and store in sessionStorage
  // Actually, let's navigate to the results page and use the sessionStorage approach
  // We need to store the results data. Let me fetch it via a workaround:
  
  // Get full session data by querying MongoDB via the API
  // Since we don't have a get-single-session endpoint, let's navigate directly and see what shows
  await page.goto(`${BASE}/results/${completedSession.sessionId}`, { waitUntil: 'networkidle0' });
  
  // Wait a moment
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/06_results.png`, fullPage: true });
  console.log('Results page screenshot taken (may show "Session data not found" since sessionStorage was cleared)');

  // Let's also take a history page screenshot
  await page.goto(`${BASE}/history`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/07_history.png`, fullPage: true });
  console.log('History page screenshot taken');

  console.log('✅ Done!');
  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
