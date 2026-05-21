import fs from 'fs';
import { marked } from 'marked';

const files = [
  '01_PROJECT_REPORT.md',
  '02_GEMINI_DIAGRAM_PROMPTS.md',
  '03_SRS_SHORT.md',
];

const style = `
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 2cm; color: #111; }
  h1 { font-size: 18pt; text-align: center; page-break-before: always; }
  h1:first-of-type { page-break-before: avoid; }
  h2 { font-size: 14pt; border-bottom: 1px solid #333; padding-bottom: 4px; margin-top: 24px; }
  h3 { font-size: 12pt; margin-top: 16px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 11pt; }
  th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
  th { background: #f0f0f0; }
  code { background: #f5f5f5; padding: 2px 4px; font-size: 10pt; }
  pre { background: #f5f5f5; padding: 12px; overflow-x: auto; font-size: 10pt; }
  hr { margin: 24px 0; }
  blockquote { border-left: 4px solid #666; margin-left: 0; padding-left: 12px; color: #444; }
`;

for (const file of files) {
  const base = file.replace(/\.md$/, '');
  const md = fs.readFileSync(file, 'utf8');
  const body = marked.parse(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${base}</title>
  <style>${style}</style>
</head>
<body>
${body}
</body>
</html>`;
  fs.writeFileSync(`${base}.html`, html);
  console.log('Created', `${base}.html`);
}
