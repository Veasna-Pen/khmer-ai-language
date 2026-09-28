#!/usr/bin/env node
// Merges data/terminology/** into dist/khmer-ai-reference.json and its minified copy.

const fs = require('fs');
const path = require('path');
const { ROOT, DIST_DIR, BUNDLE_FILE, BUNDLE_MIN_FILE } = require('../lib/paths');
const { loadTerms } = require('../lib/dataset');
const { version } = require('../../package.json');

function build() {
  const terms = loadTerms().sort((a, b) => a.term.localeCompare(b.term));

  const domains = {};
  for (const term of terms) domains[term.domain] = (domains[term.domain] || 0) + 1;

  const bundle = {
    metadata: {
      name: 'Khmer AI Language Reference',
      version,
      generatedAt: new Date().toISOString(),
      license: 'CC-BY-4.0',
      totalTerms: terms.length,
      domains,
    },
    terms,
  };

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(BUNDLE_FILE, JSON.stringify(bundle, null, 2), 'utf8');
  fs.writeFileSync(BUNDLE_MIN_FILE, JSON.stringify(bundle), 'utf8');
  return bundle;
}

if (require.main === module) {
  const { terms } = build();
  console.log(`✔ Built ${terms.length} terms:`);
  for (const file of [BUNDLE_FILE, BUNDLE_MIN_FILE]) console.log(`  - ${path.relative(ROOT, file)}`);
}

module.exports = { build };
