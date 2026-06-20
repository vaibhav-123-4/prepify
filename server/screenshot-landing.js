import puppeteer from 'puppeteer';

const DELAY = (ms) => new Promise(r => setTimeout(r, ms));
const BASE = 'http://localhost:5174';
const OUT = 'C:/Users/Vaibhav Sharma/.gemini/antigravity/brain/bafc563b-0323-40af-978f-7dc8569ca531';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Go to landing page
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 });
  await DELAY(1500); // let animations settle

  // Screenshot 1: Hero section (top of page)
  await page.screenshot({ path: `${OUT}/landing_hero.png`, fullPage: false });
  console.log('✅ Screenshot 1: Hero section');

  // Scroll to features section
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await DELAY(1200);
  await page.screenshot({ path: `${OUT}/landing_features.png`, fullPage: false });
  console.log('✅ Screenshot 2: Features section');

  // Scroll to how-it-works
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await DELAY(1200);
  await page.screenshot({ path: `${OUT}/landing_howitworks.png`, fullPage: false });
  console.log('✅ Screenshot 3: How it works section');

  // Scroll to CTA + footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await DELAY(1200);
  await page.screenshot({ path: `${OUT}/landing_cta_footer.png`, fullPage: false });
  console.log('✅ Screenshot 4: CTA + Footer');

  // Full page screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await DELAY(500);
  await page.screenshot({ path: `${OUT}/landing_fullpage.png`, fullPage: true });
  console.log('✅ Screenshot 5: Full page');

  await browser.close();
  console.log('\n🎉 All landing page screenshots captured!');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
