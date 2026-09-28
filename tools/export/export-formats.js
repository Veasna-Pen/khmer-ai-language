#!/usr/bin/env node
// Exports the dist bundle to CSV (Excel-compatible) and a Markdown glossary.

const fs = require('fs');
const path = require('path');
const { ROOT, CSV_FILE, GLOSSARY_FILE } = require('../lib/paths');
const { loadBundle } = require('../lib/dataset');

const CSV_COLUMNS = [
  ['ID', (t) => t.id],
  ['Term', (t) => t.term],
  ['Source Language', (t) => t.sourceLanguage || 'en'],
  ['Preferred Khmer', (t) => t.preferredKhmer],
  ['Alternative Khmer', (t) => (t.alternativeKhmer || []).join('; ')],
  ['Domain', (t) => t.domain],
  ['Context', (t) => t.context],
  ['Status', (t) => t.status],
];

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const mdCell = (value) => String(value).replace(/\|/g, '\\|');

function toCsv(terms) {
  const header = CSV_COLUMNS.map(([name]) => name).join(',');
  const rows = terms.map((t) => CSV_COLUMNS.map(([, get]) => csvCell(get(t))).join(','));
  // BOM so Excel detects UTF-8 and renders Khmer correctly.
  return '﻿' + [header, ...rows].join('\r\n');
}

function toGlossary({ metadata, terms }) {
  const rows = terms.map((t) =>
    `| **${mdCell(t.term)}** | ${mdCell(t.preferredKhmer)} | \`${t.domain}\` | ${mdCell(t.context || '-')} | \`${t.status}\` |`
  );
  return [
    '# Khmer AI Language Reference - Glossary',
    '',
    `*Total terms: ${terms.length} | Generated: ${metadata.generatedAt}*`,
    '',
    '| Term (English) | Preferred Khmer | Domain | Context | Status |',
    '| :--- | :--- | :--- | :--- | :--- |',
    ...rows,
    '',
  ].join('\n');
}

if (require.main === module) {
  const bundle = loadBundle();
  fs.writeFileSync(CSV_FILE, toCsv(bundle.terms), 'utf8');
  fs.writeFileSync(GLOSSARY_FILE, toGlossary(bundle), 'utf8');
  console.log(`✔ Exported ${bundle.terms.length} terms:`);
  for (const file of [CSV_FILE, GLOSSARY_FILE]) console.log(`  - ${path.relative(ROOT, file)}`);
}

module.exports = { toCsv, toGlossary };
