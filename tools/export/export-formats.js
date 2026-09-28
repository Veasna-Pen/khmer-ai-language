#!/usr/bin/env node

/**
 * Khmer AI Language Reference - Format Exporter
 * 
 * Exports the compiled reference dataset into:
 * 1. CSV format (`dist/khmer-ai-reference.csv`)
 * 2. Markdown Glossary (`dist/GLOSSARY.md`)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const COMPILED_JSON = path.join(DIST_DIR, 'khmer-ai-reference.json');

function exportFormats() {
  if (!fs.existsSync(COMPILED_JSON)) {
    console.log('Dist bundle not found. Running compiler first...');
    require('../compiler/build-dist.js');
  }

  const raw = fs.readFileSync(COMPILED_JSON, 'utf8');
  const bundle = JSON.parse(raw);
  const terms = bundle.terms || [];

  console.log(`Exporting ${terms.length} terms to CSV and Markdown...`);

  // 1. Export CSV
  const csvHeaders = ['ID', 'Term', 'Source Language', 'Preferred Khmer', 'Alternative Khmer', 'Domain', 'Context', 'Status'];
  const csvRows = [csvHeaders.join(',')];

  terms.forEach(t => {
    const row = [
      `"${t.id || ''}"`,
      `"${(t.term || '').replace(/"/g, '""')}"`,
      `"${t.sourceLanguage || 'en'}"`,
      `"${(t.preferredKhmer || '').replace(/"/g, '""')}"`,
      `"${(t.alternativeKhmer || []).join('; ').replace(/"/g, '""')}"`,
      `"${t.domain || ''}"`,
      `"${(t.context || '').replace(/"/g, '""')}"`,
      `"${t.status || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  const csvPath = path.join(DIST_DIR, 'khmer-ai-reference.csv');
  // Include UTF-8 BOM for Microsoft Excel compatibility with Khmer script
  fs.writeFileSync(csvPath, '\uFEFF' + csvRows.join('\r\n'), 'utf8');

  // 2. Export Markdown Glossary
  let mdContent = `# Khmer AI Language Reference - Glossary\n\n`;
  mdContent += `*Total terms: ${terms.length} | Generated: ${bundle.metadata.generatedAt}*\n\n`;
  mdContent += `| Term (English) | Preferred Khmer | Domain | Context | Status |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;

  terms.forEach(t => {
    mdContent += `| **${t.term}** | ${t.preferredKhmer} | \`${t.domain}\` | ${t.context || '-'} | \`${t.status}\` |\n`;
  });

  const mdPath = path.join(DIST_DIR, 'GLOSSARY.md');
  fs.writeFileSync(mdPath, mdContent, 'utf8');

  console.log(`✔ Successfully exported:`);
  console.log(`  - ${csvPath}`);
  console.log(`  - ${mdPath}`);
}

exportFormats();
