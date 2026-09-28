#!/usr/bin/env node

/**
 * Khmer AI Language Reference - Distribution Compiler
 * 
 * Aggregates all modular terminology files from `data/terminology/**`
 * into a single unified JSON distribution bundle: `dist/khmer-ai-reference.json`
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function collectTerms(dir) {
  let terms = [];
  if (!fs.existsSync(dir)) return terms;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      terms = terms.concat(collectTerms(fullPath));
    } else if (item.isFile() && item.name.endsWith('.json')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          terms = terms.concat(data);
        }
      } catch (err) {
        console.error(`Failed to parse ${fullPath}:`, err.message);
      }
    }
  }
  return terms;
}

function build() {
  console.log('Compiling Khmer AI Language Reference distribution...');
  ensureDirectoryExists(DIST_DIR);

  const termDir = path.join(DATA_DIR, 'terminology');
  const allTerms = collectTerms(termDir);

  // Sort terms alphabetically by source term
  allTerms.sort((a, b) => a.term.localeCompare(b.term));

  const domainBreakdown = {};
  allTerms.forEach(t => {
    domainBreakdown[t.domain] = (domainBreakdown[t.domain] || 0) + 1;
  });

  const bundle = {
    metadata: {
      name: "Khmer AI Language Reference",
      version: require('../../package.json').version,
      generatedAt: new Date().toISOString(),
      license: "CC-BY-4.0",
      totalTerms: allTerms.length,
      domains: domainBreakdown
    },
    terms: allTerms
  };

  const distPath = path.join(DIST_DIR, 'khmer-ai-reference.json');
  fs.writeFileSync(distPath, JSON.stringify(bundle, null, 2), 'utf8');

  // Also write minified version for low-bandwidth / production RAG use
  const minPath = path.join(DIST_DIR, 'khmer-ai-reference.min.json');
  fs.writeFileSync(minPath, JSON.stringify(bundle), 'utf8');

  console.log(`✔ Successfully built distribution:`);
  console.log(`  - ${distPath} (${allTerms.length} terms)`);
  console.log(`  - ${minPath}`);
}

build();
