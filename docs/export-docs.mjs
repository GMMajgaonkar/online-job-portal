import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { marked } from 'marked';
import HTMLtoDOCX from 'html-to-docx';

const docsDir = path.dirname(fileURLToPath(import.meta.url));
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

const pageStyle = `body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.5;margin:2cm}h1{font-size:18pt;text-align:center}h2{font-size:14pt;border-bottom:1px solid #333;margin-top:24px}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #333;padding:6px}th{background:#f0f0f0}pre{background:#f5f5f5;padding:12px;font-size:10pt}`;

async function toDocx(html, outPath) {
  const buf = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    pageNumber: true,
  });
  fs.writeFileSync(outPath, buf);
}

function toPdf(htmlPath, pdfPath) {
  if (!chrome) return;
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/').replace(/ /g, '%20');
  execSync(
    `"${chrome}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`,
    { stdio: 'pipe', timeout: 180000 }
  );
}

for (const base of bases) {
  const htmlPath = path.join(docsDir, `${base}.html`);
  const docxPath = path.join(docsDir, `${base}.docx`);
  const pdfPath = path.join(docsDir, `${base}.pdf`);

  if (!fs.existsSync(htmlPath)) {
    console.warn('Missing HTML:', base);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  console.log('DOCX:', base);
  await toDocx(html, docxPath);
  console.log('PDF:', base);
  toPdf(htmlPath, pdfPath);
}

const combinedMd = bases
  .map((b) => fs.readFileSync(path.join(docsDir, `${b}.md`), 'utf8'))
  .join('\n\n---\n\n');
fs.writeFileSync(path.join(docsDir, '00_FULL_DOCUMENTATION.md'), combinedMd);

const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Online Job Portal - Full Documentation</title><style>${pageStyle}</style></head><body>${marked.parse(combinedMd)}</body></html>`;
const fullHtmlPath = path.join(docsDir, '00_FULL_DOCUMENTATION.html');
const fullDocxPath = path.join(docsDir, '00_FULL_DOCUMENTATION.docx');
const fullPdfPath = path.join(docsDir, '00_FULL_DOCUMENTATION.pdf');
fs.writeFileSync(fullHtmlPath, fullHtml);
console.log('Combined DOCX + PDF...');
await toDocx(fullHtml, fullDocxPath);
toPdf(fullHtmlPath, fullPdfPath);

console.log('\nAll files saved to:', docsDir);
