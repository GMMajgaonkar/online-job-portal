/**
 * Backend build: syntax-check all source files and verify ESM imports resolve.
 * Does not start the HTTP server or connect to MongoDB.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SOURCE_DIRS = ['controllers', 'middleware', 'models', 'routes', 'utils'];
const ENTRY_FILE = path.join(root, 'index.js');

function collectJsFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) continue;
    if (name.endsWith('.js')) files.push(full);
  }
  return files;
}

function syntaxCheck(filePath) {
  execSync(`node --check "${filePath}"`, { stdio: 'pipe', cwd: root });
}

async function importCheck(filePath) {
  await import(pathToFileURL(filePath).href);
}

async function main() {
  const files = [ENTRY_FILE];
  for (const dir of SOURCE_DIRS) {
    files.push(...collectJsFiles(path.join(root, dir)));
  }

  console.log(`\nBackend build: checking ${files.length} files...\n`);

  const errors = [];

  // 1) Syntax check (node --check)
  console.log('Step 1/2: Syntax check');
  for (const file of files) {
    const rel = path.relative(root, file);
    try {
      syntaxCheck(file);
      console.log(`  OK  ${rel}`);
    } catch (err) {
      console.error(`  FAIL ${rel}`);
      errors.push({ file: rel, step: 'syntax', message: err.stderr?.toString() || err.message });
    }
  }

  // 2) Import resolution (skip index.js — it starts the server)
  console.log('\nStep 2/2: Module import check');
  const importFiles = files.filter((f) => f !== ENTRY_FILE);
  for (const file of importFiles) {
    const rel = path.relative(root, file);
    try {
      await importCheck(file);
      console.log(`  OK  ${rel}`);
    } catch (err) {
      console.error(`  FAIL ${rel}`);
      errors.push({ file: rel, step: 'import', message: err.message });
    }
  }

  try {
    syntaxCheck(ENTRY_FILE);
    console.log(`  OK  index.js (syntax only — server not started)`);
  } catch (err) {
    console.error(`  FAIL index.js`);
    errors.push({ file: 'index.js', step: 'syntax', message: err.stderr?.toString() || err.message });
  }

  console.log('');
  if (errors.length > 0) {
    console.error(`Build failed with ${errors.length} error(s):\n`);
    for (const e of errors) {
      console.error(`[${e.step}] ${e.file}`);
      console.error(e.message);
      console.error('');
    }
    process.exit(1);
  }

  console.log('Build succeeded.\n');
}

main().catch((err) => {
  console.error('Build script error:', err);
  process.exit(1);
});
