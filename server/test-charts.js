import puppeteer from 'puppeteer';

const DELAY = (ms) => new Promise(r => setTimeout(r, ms));
const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000/api';
const OUT = 'C:/Users/Vaibhav Sharma/.gemini/antigravity/brain/bafc563b-0323-40af-978f-7dc8569ca531';

async function run() {
  await DELAY(4000);

  // Login with existing account
  console.log('--- Login ---');
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'chartstest@test.com', password: 'Test1234!' }),
  });
  const loginData = await login.json();
  const token = loginData.token;
  console.log('✅ Logged in');

  // Get sessions to find one with categoryScores
  const sessionsRes = await fetch(`${API}/interview/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sessions = await sessionsRes.json();
  const sessionWithScores = sessions.find(s => s.categoryScores && s.categoryScores.length > 0);
  
  if (!sessionWithScores) {
    console.error('❌ No session with category scores found');
    process.exit(1);
  }
  
  const sessionId = sessionWithScores.sessionId;
  console.log('Using session:', sessionId);
  console.log('Categories:', sessionWithScores.categoryScores);

  // Screenshots
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Auth
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((t) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify({ id: 'test', email: 'chartstest@test.com' }));
  }, token);

  // Results page — radar view
  await page.goto(`${BASE}/results/${sessionId}`, { waitUntil: 'networkidle0' });
  await DELAY(2000);
  await page.screenshot({ path: `${OUT}/results_radar_chart.png`, fullPage: true });
  console.log('📸 Results page (radar view) captured');

  // Click bar view button
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === 'Bar View') {
        btn.click();
        return;
      }
    }
  });
  await DELAY(800);
  await page.screenshot({ path: `${OUT}/results_bar_chart.png`, fullPage: true });
  console.log('📸 Results page (bar view) captured');

  // History page
  await page.goto(`${BASE}/history`, { waitUntil: 'networkidle0' });
  await DELAY(1000);
  await page.screenshot({ path: `${OUT}/history_with_dots.png`, fullPage: false });
  console.log('📸 History page with category dots captured');

  await browser.close();
  console.log('\n🎉 All screenshots captured!');
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
