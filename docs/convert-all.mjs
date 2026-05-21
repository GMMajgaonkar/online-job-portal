import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import HTMLtoDOCX from 'html-to-docx';

const docsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const bases = [
  '01_PROJECT_REPORT',
  '02_GEMINI_DIAGRAM_PROMPTS',
  '03_SRS_SHORT',
];

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const chrome = chromePaths.find((p) => fs.existsSync(p));

for (const base of bases) {
  const htmlPath = path.join(docsDir, `${base}.html`);
  const docxPath = path.join(docsDir, `${base}.docx`);
  const pdfPath = path.join(docsDir, `${base}.pdf`);

  if (!fs.existsSync(htmlPath)) {
    console.warn('Skip (no HTML):', base);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  console.log('DOCX:', base);
  const docxBuffer = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });
  fs.writeFileSync(docxPath, docxBuffer);

  if (chrome) {
    console.log('PDF:', base);
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/').replace(/ /g, '%20');
    execSync(
      `"${chrome}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`,
      { stdio: 'inherit', timeout: 120000 }
    );
  } else {
    console.warn('Chrome/Edge not found — PDF skipped for', base);
  }
}

// Combined full documentation
console.log('Building combined document...');
const combinedMd = bases
  .map((b) => fs.readFileSync(path.join(docsDir, `${b}.md`), 'utf8'))
  .join('\n\n---\n\n');
fs.writeFileSync(path.join(docsDir, '00_FULL_DOCUMENTATION.md'), combinedMd);

console.log('Done. Files in:', docsDir);
