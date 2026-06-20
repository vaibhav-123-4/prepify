import puppeteer from 'puppeteer';
const DELAY = (ms) => new Promise(r => setTimeout(r, ms));
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/Vaibhav Sharma/.gemini/antigravity/brain/bafc563b-0323-40af-978f-7dc8569ca531';

async function run() {
  await DELAY(4000);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await DELAY(2000);

  // Hero section
  await page.screenshot({ path: `${OUT}/landing_hero_v2.png`, fullPage: false });
  console.log('📸 Hero captured');

  // Full page
  await page.screenshot({ path: `${OUT}/landing_full_v2.png`, fullPage: true });
  console.log('📸 Full page captured');

  // Scroll to features
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await DELAY(1000);
  await page.screenshot({ path: `${OUT}/landing_features_v2.png`, fullPage: false });
  console.log('📸 Features captured');

  // Scroll to how it works
  await page.evaluate(() => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'instant' });
  });
  await DELAY(1000);
  await page.screenshot({ path: `${OUT}/landing_howitworks_v2.png`, fullPage: false });
  console.log('📸 How it works captured');

  await browser.close();
  console.log('\n🎉 Landing page screenshots captured!');
}

run().catch(err => { console.error(err); process.exit(1); });
