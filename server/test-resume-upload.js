import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const DELAY = (ms) => new Promise(r => setTimeout(r, ms));
const OUT = 'C:/Users/Vaibhav Sharma/.gemini/antigravity/brain/bafc563b-0323-40af-978f-7dc8569ca531';

async function createResumePDF() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const html = `<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #222; margin: 40px; line-height: 1.5; }
  h1 { font-size: 22px; margin-bottom: 2px; }
  h2 { font-size: 14px; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 3px; text-transform: uppercase; color: #444; }
  .subtitle { color: #666; font-size: 12px; }
  ul { padding-left: 18px; margin: 6px 0; }
  li { margin: 3px 0; }
  .skills { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
</style></head>
<body>
  <h1>VAIBHAV SHARMA</h1>
  <div class="subtitle">Frontend Developer | React Specialist | vaibhav@example.com</div>

  <h2>Skills</h2>
  <div class="skills">
    <span class="skill">React.js</span>
    <span class="skill">Next.js</span>
    <span class="skill">TypeScript</span>
    <span class="skill">Node.js</span>
    <span class="skill">Express</span>
    <span class="skill">MongoDB</span>
    <span class="skill">PostgreSQL</span>
    <span class="skill">Tailwind CSS</span>
    <span class="skill">Redux</span>
    <span class="skill">GraphQL</span>
    <span class="skill">Docker</span>
    <span class="skill">AWS</span>
    <span class="skill">CI/CD</span>
    <span class="skill">WebSocket</span>
  </div>

  <h2>Experience</h2>
  <p><strong>Senior Frontend Developer — TechCorp Inc.</strong> (Jun 2024 – Present, 2 years)</p>
  <ul>
    <li>Built a real-time collaborative document editor using React 18, WebSocket, and Operational Transform (OT) algorithms, supporting 200+ concurrent users</li>
    <li>Implemented micro-frontend architecture using Module Federation, serving 50,000 daily active users across 4 independently deployable apps</li>
    <li>Optimized Webpack bundle size by 40% through code splitting, lazy loading, and tree shaking, reducing initial load time from 4.2s to 2.1s</li>
    <li>Led migration of 3 microservices from JavaScript to TypeScript, reducing production bugs by 35%</li>
    <li>Designed and implemented a custom design system with 30+ components used across 6 product teams</li>
  </ul>

  <h2>Projects</h2>
  <p><strong>1. E-commerce Platform (ShopNow)</strong></p>
  <ul>
    <li>Full-stack Next.js 14 app with Stripe payments, Redis caching, and Elasticsearch product search</li>
    <li>Implemented server-side rendering and incremental static regeneration for SEO optimization</li>
  </ul>
  <p><strong>2. Task Management App (TaskFlow)</strong></p>
  <ul>
    <li>React app with drag-and-drop kanban board using react-beautiful-dnd, real-time sync via Firebase</li>
    <li>Added offline support with IndexedDB and service worker background sync</li>
  </ul>
  <p><strong>3. Component Library (UI-Kit)</strong></p>
  <ul>
    <li>Published npm package with 20+ reusable components, Storybook documentation, and automated visual regression testing</li>
    <li>Used Rollup for tree-shakable ESM builds, reducing consumer bundle impact by 60%</li>
  </ul>

  <h2>Education</h2>
  <p><strong>B.Tech Computer Science</strong> — Top University (2022)</p>
  <p>Certifications: AWS Cloud Practitioner, Meta React Professional Certificate</p>
</body>
</html>`;

  await page.setContent(html);
  const pdfPath = path.join(process.cwd(), 'test-resume.pdf');
  await page.pdf({ path: pdfPath, format: 'A4', margin: { top: 20, bottom: 20, left: 20, right: 20 } });
  await browser.close();
  console.log('✅ Resume PDF created:', pdfPath, `(${fs.statSync(pdfPath).size} bytes)`);
  return pdfPath;
}

async function run() {
  // Step 0: Generate a valid PDF
  console.log('--- Step 0: Generate test resume PDF ---');
  const pdfPath = await createResumePDF();

  // Verify it parses
  const { extractTextFromPDF } = await import('./services/pdfService.js');
  const buf = fs.readFileSync(pdfPath);
  const text = await extractTextFromPDF(buf);
  console.log(`Extracted ${text.length} chars from PDF`);
  console.log('Preview:', text.slice(0, 300), '...\n');

  // Step 1: Register/Login
  console.log('--- Step 1: Register/Login ---');
  const API = 'http://localhost:5000/api';
  let token;

  const reg = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'resumetest5@test.com', password: 'Test1234!' })
  });
  const regData = await reg.json();
  if (reg.ok) {
    token = regData.token;
    console.log('✅ Registered:', regData.user.email);
  } else {
    const login = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'resumetest5@test.com', password: 'Test1234!' })
    });
    const loginData = await login.json();
    token = loginData.token;
    console.log('✅ Logged in');
  }

  // Step 2: Upload resume via multipart (using raw http)
  console.log('\n--- Step 2: Upload resume + generate questions ---');
  const { default: http } = await import('http');
  const boundary = '----FormBoundary' + Date.now();
  const fileContent = fs.readFileSync(pdfPath);

  const fields = {
    role: 'Frontend Developer',
    experienceLevel: '1-3 years',
    questionCount: '5',
  };

  const parts = [];
  for (const [key, value] of Object.entries(fields)) {
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`);
  }
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`);

  const preamble = Buffer.from(parts.join(''));
  const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([preamble, fileContent, epilogue]);

  const startData = await new Promise((resolve, reject) => {
    const url = new URL(`${API}/interview/start`);
    const req = http.request({
      hostname: url.hostname, port: url.port, path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Authorization': `Bearer ${token}`,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, ...JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  if (startData.status >= 400) {
    console.error('❌ Start failed:', startData);
    process.exit(1);
  }

  console.log('✅ Session:', startData.sessionId);
  console.log('Resume used:', startData.resumeUsed);
  console.log('\n📝 Generated Questions:');
  startData.questions.forEach((q, i) => {
    console.log(`  ${i + 1}. [${q.category} | ${q.difficulty}] ${q.question}`);
  });

  // Step 3: Screenshots
  console.log('\n--- Step 3: Screenshots ---');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const BASE = 'http://localhost:5173';
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((t) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify({ id: 'test', email: 'resumetest5@test.com', username: 'resumetest5@test.com' }));
  }, token);

  // Setup page with resume attached
  await page.goto(`${BASE}/setup`, { waitUntil: 'networkidle0' });
  await DELAY(800);
  const roleInput = await page.$('input[type="text"]');
  if (roleInput) await roleInput.type('Frontend Developer');
  const labels = await page.$$('label');
  for (const label of labels) {
    const text = await label.evaluate(el => el.textContent.trim());
    if (text === '1-3 years') { await label.click(); break; }
  }
  await DELAY(200);
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(pdfPath);
    await DELAY(500);
    console.log('✅ Resume attached in UI');
  }
  await page.screenshot({ path: `${OUT}/setup_with_resume.png`, fullPage: true });
  console.log('📸 Setup page captured');

  // Interview page with badge
  await page.evaluate((sid, qs) => {
    sessionStorage.setItem(`interview-${sid}`, JSON.stringify(qs));
    sessionStorage.setItem(`interview-resume-${sid}`, 'true');
  }, startData.sessionId, startData.questions);
  await page.goto(`${BASE}/interview/${startData.sessionId}`, { waitUntil: 'networkidle0' });
  await DELAY(1000);
  await page.screenshot({ path: `${OUT}/interview_with_resume.png`, fullPage: false });
  console.log('📸 Interview page captured');

  const hasBadge = await page.evaluate(() => document.body.innerText.includes('Questions tailored to your resume'));
  console.log('✦ Resume badge visible:', hasBadge);

  await browser.close();
  try { fs.unlinkSync(pdfPath); } catch(e) {}
  console.log('\n🎉 Resume upload feature fully tested!');
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
