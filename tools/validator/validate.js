#!/usr/bin/env node
// Validates dataset JSON: required fields and enums (read from schemas/), unique IDs, Unicode NFC, Khmer Coeng rules.

const path = require('path');
const { ROOT, DATA_DIR, EVALUATION_DIR, TERMINOLOGY_DIR, EXAMPLES_DIR } = require('../lib/paths');
const { readJson, listJsonFiles, loadSchema } = require('../lib/dataset');

const termSchema = loadSchema('term');
const exampleSchema = loadSchema('translation');
const termProps = termSchema.properties;
const provenanceSchema = termProps.provenance;

const ID_PATTERN = new RegExp(termProps.id.pattern);
const DATE_PATTERN = new RegExp(provenanceSchema.properties.lastUpdated.pattern);
const COENG = '្';
const KHMER_CONSONANT = /[ក-អ]/;

const errors = [];
const warnings = [];
const stats = { files: 0, terms: 0, examples: 0 };
const seenIds = new Map();
const seenTerms = new Map();

const asArray = (value) => (Array.isArray(value) ? value : []);

function checkRequired(entry, fields, loc) {
  for (const field of fields) {
    if (!entry[field]) errors.push(`[Missing Field] in ${loc}: Required field "${field}" is missing or empty.`);
  }
}

function checkEnum(value, allowed, field, loc) {
  if (value && !allowed.includes(value)) {
    errors.push(`[Invalid ${field}] in ${loc}: "${value}" is invalid. Allowed: ${allowed.join(', ')}.`);
  }
}

function checkKhmerText(text, field, loc) {
  if (typeof text !== 'string') return;
  if (text !== text.normalize('NFC')) {
    errors.push(`[NFC Normalization Error] in ${loc} -> "${field}": Text is not in Unicode NFC normalization.`);
  }
  for (let i = 0; i < text.length; i++) {
    if (text[i] === COENG && !KHMER_CONSONANT.test(text[i + 1] || '')) {
      errors.push(`[Khmer Orthography Error] in ${loc} -> "${field}": Coeng (្) at index ${i} must be followed by a Khmer consonant.`);
    }
  }
  if (text.includes(COENG + COENG)) {
    errors.push(`[Khmer Orthography Error] in ${loc} -> "${field}": Contains duplicate consecutive Coeng marks (្្).`);
  }
}

function validateTerm(entry, loc) {
  stats.terms++;
  checkRequired(entry, termSchema.required, loc);

  if (entry.id) {
    if (!ID_PATTERN.test(entry.id)) errors.push(`[Invalid ID] in ${loc}: "${entry.id}" must be kebab-case.`);
    if (seenIds.has(entry.id)) errors.push(`[Duplicate ID] in ${loc}: "${entry.id}" already declared in ${seenIds.get(entry.id)}.`);
    else seenIds.set(entry.id, loc);
  }

  if (entry.term && entry.domain) {
    const key = `${entry.domain.toLowerCase()}::${entry.term.trim().toLowerCase()}`;
    if (seenTerms.has(key)) warnings.push(`[Duplicate Term in Domain] in ${loc}: "${entry.term}" already defined in ${seenTerms.get(key)}.`);
    else seenTerms.set(key, loc);
  }

  checkEnum(entry.domain, termProps.domain.enum, 'domain', loc);
  checkEnum(entry.status, termProps.status.enum, 'status', loc);
  checkEnum(entry.partOfSpeech, termProps.partOfSpeech.enum, 'partOfSpeech', loc);

  if (entry.provenance) {
    const { sourceType, lastUpdated } = entry.provenance;
    checkRequired(entry.provenance, provenanceSchema.required, `${loc} -> provenance`);
    checkEnum(sourceType, provenanceSchema.properties.sourceType.enum, 'provenance.sourceType', loc);
    if (lastUpdated && !DATE_PATTERN.test(lastUpdated)) {
      errors.push(`[Invalid Date] in ${loc}: "provenance.lastUpdated" must follow YYYY-MM-DD format.`);
    }
  }

  checkKhmerText(entry.preferredKhmer, 'preferredKhmer', loc);
  asArray(entry.alternativeKhmer).forEach((alt, i) => checkKhmerText(alt, `alternativeKhmer[${i}]`, loc));

  asArray(entry.examples).forEach((ex, i) => {
    if (!ex.source || !ex.khmer) errors.push(`[Invalid Example] in ${loc} -> examples[${i}]: Both "source" and "khmer" are required.`);
    if (!ex.khmer) return;
    checkKhmerText(ex.khmer, `examples[${i}].khmer`, loc);
    if (ex.khmer.endsWith('.') && !ex.khmer.endsWith('...')) {
      warnings.push(`[Punctuation Warning] in ${loc} -> examples[${i}]: Khmer sentence ends with Latin '.' instead of Khan (។).`);
    }
  });
}

function validateExample(entry, loc) {
  stats.examples++;
  checkRequired(entry, exampleSchema.required, loc);
  checkKhmerText(entry.translation, 'translation', loc);
}

// Files outside these folders only get a JSON syntax check.
const VALIDATORS = [
  [TERMINOLOGY_DIR, validateTerm],
  [EXAMPLES_DIR, validateExample],
];

function validateFile(file) {
  stats.files++;
  const relPath = path.relative(ROOT, file);
  let data;
  try {
    data = readJson(file);
  } catch (err) {
    errors.push(`[JSON Error] ${relPath}: ${err.message}`);
    return;
  }
  const match = VALIDATORS.find(([dir]) => file.startsWith(dir + path.sep));
  if (match) asArray(data).forEach((entry, i) => match[1](entry, `${relPath} (index ${i})`));
}

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const [red, green, yellow, bold] = ['31', '32', '33', '1'].map((code) => (text) => paint(code, text));

[...listJsonFiles(DATA_DIR), ...listJsonFiles(EVALUATION_DIR)].forEach(validateFile);

console.log(bold('=== Khmer AI Language Reference: Dataset Validator ===\n'));
console.log(`Scanned ${stats.files} files, ${stats.terms} terminology entries, ${stats.examples} translation examples.\n`);

if (warnings.length) {
  console.log(yellow(bold(`Warnings (${warnings.length}):`)));
  warnings.forEach((w) => console.log(`  ${yellow('⚠')} ${w}`));
  console.log();
}

if (errors.length) {
  console.log(red(bold(`Errors (${errors.length}):`)));
  errors.forEach((e) => console.log(`  ${red('✖')} ${e}`));
  console.log(red(bold('\nValidation FAILED.\n')));
  process.exit(1);
}

console.log(green(bold('✔ All validations PASSED.\n')));
