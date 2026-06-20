// Generate a proper minimal PDF with correct xref offsets
import fs from 'fs';
import path from 'path';

function createValidPDF() {
  const objects = [];
  const positions = [];

  // Helper to track position
  let pos = 0;
  const lines = [];
  function write(s) { lines.push(s); pos += Buffer.byteLength(s + '\n', 'binary'); }

  // Header
  write('%PDF-1.4');

  // Object 1: Catalog
  positions[1] = pos;
  write('1 0 obj');
  write('<< /Type /Catalog /Pages 2 0 R >>');
  write('endobj');

  // Object 2: Pages
  positions[2] = pos;
  write('2 0 obj');
  write('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  write('endobj');

  // Object 5: Font (define before page since page references it)
  positions[5] = pos;
  write('5 0 obj');
  write('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  write('endobj');

  // Build the content stream
  const streamLines = [
    'BT',
    '/F1 11 Tf',
    '50 740 Td',
    '(VAIBHAV SHARMA) Tj',
    '0 -16 Td',
    '(Frontend Developer | React Specialist) Tj',
    '0 -24 Td',
    '(SKILLS) Tj',
    '0 -16 Td',
    '(React.js, Next.js, TypeScript, Node.js, Express, MongoDB, PostgreSQL) Tj',
    '0 -16 Td',
    '(Tailwind CSS, Redux, GraphQL, Docker, AWS S3, Git, CI/CD Pipelines) Tj',
    '0 -24 Td',
    '(EXPERIENCE) Tj',
    '0 -16 Td',
    '(Senior Frontend Developer at TechCorp - 2 years) Tj',
    '0 -16 Td',
    '(Built a real-time collaborative document editor using React and WebSocket) Tj',
    '0 -16 Td',
    '(Implemented micro-frontend architecture serving 50K daily active users) Tj',
    '0 -16 Td',
    '(Optimized webpack bundle size by 40 percent using code splitting) Tj',
    '0 -16 Td',
    '(Led migration from JavaScript to TypeScript across 3 services) Tj',
    '0 -24 Td',
    '(PROJECTS) Tj',
    '0 -16 Td',
    '(1. E-commerce Platform - Built with Next.js, Stripe payments, Redis caching) Tj',
    '0 -16 Td',
    '(2. Task Management App - React drag-and-drop, real-time sync with Firebase) Tj',
    '0 -16 Td',
    '(3. Component Library - Published npm package with 20+ reusable components) Tj',
    '0 -16 Td',
    '(4. Dashboard Analytics - D3.js data visualization, WebSocket live updates) Tj',
    '0 -24 Td',
    '(EDUCATION) Tj',
    '0 -16 Td',
    '(B.Tech Computer Science - Top University 2022) Tj',
    '0 -16 Td',
    '(Certifications: AWS Cloud Practitioner, Meta React Professional) Tj',
    'ET',
  ];
  const streamContent = streamLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'binary');

  // Object 4: Content stream
  positions[4] = pos;
  write('4 0 obj');
  write(`<< /Length ${streamLength} >>`);
  write('stream');
  write(streamContent);
  write('endstream');
  write('endobj');

  // Object 3: Page
  positions[3] = pos;
  write('3 0 obj');
  write('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  write('endobj');

  // XRef table
  const xrefPos = pos;
  write('xref');
  write('0 6');
  write('0000000000 65535 f ');
  for (let i = 1; i <= 5; i++) {
    write(String(positions[i]).padStart(10, '0') + ' 00000 n ');
  }

  // Trailer
  write('trailer');
  write('<< /Size 6 /Root 1 0 R >>');
  write('startxref');
  write(String(xrefPos));
  write('%%EOF');

  const pdfPath = path.join(process.cwd(), 'test-resume.pdf');
  fs.writeFileSync(pdfPath, lines.join('\n'), 'binary');
  return pdfPath;
}

// Test it
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const pdfPath = createValidPDF();
console.log('PDF created:', pdfPath);
console.log('Size:', fs.statSync(pdfPath).size, 'bytes');

const buf = fs.readFileSync(pdfPath);
try {
  const data = await pdfParse(buf);
  console.log('\n✅ PDF parsed successfully!');
  console.log('Pages:', data.numpages);
  console.log('Text length:', data.text.length);
  console.log('\nExtracted text:');
  console.log(data.text);
} catch (e) {
  console.error('❌ Parse failed:', e.message);
}
