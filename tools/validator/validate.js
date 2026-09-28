#!/usr/bin/env node
// Validates dataset JSON: required fields, enums and review rules (read from schemas/), unique IDs, Unicode NFC, Khmer Coeng rules.

const path = require('path');
const {
  ROOT, DATA_DIR, EVALUATION_DIR, TERMINOLOGY_DIR, EXAMPLES_DIR, DISAMBIGUATION_DIR, BENCHMARK_FILE, REVIEWERS_FILE,
} = require('../lib/paths');
const { readJson, listJsonFiles, loadSchema, loadReviewers } = require('../lib/dataset');

const termSchema = loadSchema('term');
const exampleSchema = loadSchema('translation');
const contextSchema = loadSchema('disambiguation');
const benchmarkSchema = loadSchema('benchmark');
const reviewerSchema = loadSchema('reviewer');
const termProps = termSchema.properties;
const provenanceSchema = termProps.provenance;
const contextItemSchema = contextSchema.properties.disambiguations;
const benchmarkTermSchema = benchmarkSchema.properties.requiredTerminology.items;

const ID_PATTERN = new RegExp(termProps.id.pattern);
const BENCHMARK_ID_PATTERN = new RegExp(benchmarkSchema.properties.id.pattern);
const DATE_PATTERN = new RegExp(provenanceSchema.properties.lastUpdated.pattern);
const HANDLE_PATTERN = new RegExp(reviewerSchema.properties.handle.pattern);
const JOINED_PATTERN = new RegExp(reviewerSchema.properties.joined.pattern);
const COENG = '្';
const KHMER_CONSONANT = /[ក-អ]/;

// Status-dependent provenance requirements, from the term schema's allOf if/then blocks.
const REVIEW_RULES = (termSchema.allOf || []).map(({ if: condition, then: requirement }) => {
  const provenance = requirement.properties.provenance;
  return {
    statuses: condition.properties.status.enum,
    required: provenance.required || [],
    minReviewers: (provenance.properties.reviewedBy || {}).minItems || 0,
    reviewerLevel: provenance['x-requiresReviewerLevel'],
  };
});

const errors = [];
const warnings = [];
const stats = { files: 0, terms: 0, examples: 0, contexts: 0, benchmark: 0, reviewers: 0 };
const seenIds = new Map();
const seenBenchmarkIds = new Map();
const seenReviewers = new Map();
const seenTerms = new Map();
const knownKhmer = new Set();
const benchmarkTerms = [];

const asArray = (value) => (Array.isArray(value) ? value : []);

// Loaded up front so term checks don't depend on the order files are scanned.
let roster = [];
try {
  roster = asArray(loadReviewers());
} catch {
  // A broken reviewers.json is reported as a JSON error by the file scan below.
}
const rosterByHandle = new Map(
  roster.filter((r) => r && typeof r.handle === 'string').map((r) => [r.handle.toLowerCase(), r])
);

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

function checkId(id, pattern, seen, loc) {
  if (!id) return;
  if (!pattern.test(id)) errors.push(`[Invalid ID] in ${loc}: "${id}" must be kebab-case.`);
  if (seen.has(id)) errors.push(`[Duplicate ID] in ${loc}: "${id}" already declared in ${seen.get(id)}.`);
  else seen.set(id, loc);
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

function checkKhmerSentence(text, field, loc) {
  checkKhmerText(text, field, loc);
  if (typeof text === 'string' && text.endsWith('.') && !text.endsWith('...')) {
    warnings.push(`[Punctuation Warning] in ${loc} -> "${field}": Khmer sentence ends with Latin '.' instead of Khan (។).`);
  }
}

function checkReviewRules(entry, loc) {
  const provenance = entry.provenance || {};
  const reviewers = asArray(provenance.reviewedBy).filter((name) => typeof name === 'string' && name.trim());
  for (const name of reviewers) {
    if (!rosterByHandle.has(name.toLowerCase())) {
      errors.push(`[Unknown Reviewer] in ${loc}: "${name}" in "provenance.reviewedBy" is not listed in data/reviewers.json.`);
    }
  }

  for (const rule of REVIEW_RULES) {
    if (!rule.statuses.includes(entry.status)) continue;
    for (const field of rule.required) {
      if (field === 'reviewedBy') continue; // counted below
      if (!provenance[field]) errors.push(`[Review Rule] in ${loc}: status "${entry.status}" requires "provenance.${field}".`);
    }
    if (reviewers.length < rule.minReviewers) {
      errors.push(`[Review Rule] in ${loc}: status "${entry.status}" requires at least ${rule.minReviewers} named reviewer(s) in "provenance.reviewedBy", found ${reviewers.length}.`);
    }
    const qualified = !rule.reviewerLevel || reviewers.some((name) => {
      const reviewer = rosterByHandle.get(name.toLowerCase());
      return reviewer && reviewer.level === rule.reviewerLevel && asArray(reviewer.domains).includes(entry.domain);
    });
    if (!qualified) {
      errors.push(`[Review Rule] in ${loc}: status "${entry.status}" requires a reviewer with level "${rule.reviewerLevel}" for domain "${entry.domain}" in data/reviewers.json.`);
    }
  }
}

function validateTerm(entry, loc) {
  stats.terms++;
  checkRequired(entry, termSchema.required, loc);
  checkId(entry.id, ID_PATTERN, seenIds, loc);

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
  checkReviewRules(entry, loc);

  checkKhmerText(entry.preferredKhmer, 'preferredKhmer', loc);
  asArray(entry.alternativeKhmer).forEach((alt, i) => checkKhmerText(alt, `alternativeKhmer[${i}]`, loc));
  [entry.preferredKhmer, ...asArray(entry.alternativeKhmer)].forEach((khmer) => khmer && knownKhmer.add(khmer));

  asArray(entry.examples).forEach((ex, i) => {
    if (!ex.source || !ex.khmer) errors.push(`[Invalid Example] in ${loc} -> examples[${i}]: Both "source" and "khmer" are required.`);
    checkKhmerSentence(ex.khmer, `examples[${i}].khmer`, loc);
  });
}

function validateExample(entry, loc) {
  stats.examples++;
  checkRequired(entry, exampleSchema.required, loc);
  checkKhmerText(entry.translation, 'translation', loc);
}

function validateDisambiguation(entry, loc) {
  stats.contexts++;
  checkRequired(entry, contextSchema.required, loc);

  const items = asArray(entry.disambiguations);
  if (entry.disambiguations && items.length < contextItemSchema.minItems) {
    errors.push(`[Invalid Disambiguation] in ${loc}: needs at least ${contextItemSchema.minItems} contexts, found ${items.length}.`);
  }
  items.forEach((item, i) => {
    const itemLoc = `${loc} -> disambiguations[${i}]`;
    checkRequired(item, contextItemSchema.items.required, itemLoc);
    checkKhmerText(item.khmer, 'khmer', itemLoc);
    checkKhmerSentence(item.exampleKhmer, 'exampleKhmer', itemLoc);
  });
}

function validateBenchmark(entry, loc) {
  stats.benchmark++;
  checkRequired(entry, benchmarkSchema.required, loc);
  checkId(entry.id, BENCHMARK_ID_PATTERN, seenBenchmarkIds, loc);
  checkKhmerSentence(entry.expectedKhmer, 'expectedKhmer', loc);

  asArray(entry.requiredTerminology).forEach((req, i) => {
    const reqLoc = `${loc} -> requiredTerminology[${i}]`;
    checkRequired(req, benchmarkTermSchema.required, reqLoc);
    checkKhmerText(req.khmer, 'khmer', reqLoc);
    if (req.pattern) {
      try {
        new RegExp(req.pattern);
      } catch (err) {
        errors.push(`[Invalid Pattern] in ${reqLoc}: ${err.message}`);
      }
    }
    if (req.khmer) benchmarkTerms.push({ req, loc: reqLoc });
  });
}

function validateReviewer(entry, loc) {
  stats.reviewers++;
  checkRequired(entry, reviewerSchema.required, loc);
  if (entry.handle) {
    const key = String(entry.handle).toLowerCase();
    if (!HANDLE_PATTERN.test(entry.handle)) errors.push(`[Invalid Handle] in ${loc}: "${entry.handle}" is not a valid GitHub username.`);
    if (seenReviewers.has(key)) errors.push(`[Duplicate Reviewer] in ${loc}: "${entry.handle}" already listed in ${seenReviewers.get(key)}.`);
    else seenReviewers.set(key, loc);
  }
  checkEnum(entry.level, reviewerSchema.properties.level.enum, 'level', loc);
  asArray(entry.domains).forEach((domain) => checkEnum(domain, termProps.domain.enum, 'domain', loc));
  if (entry.joined && !JOINED_PATTERN.test(entry.joined)) {
    errors.push(`[Invalid Date] in ${loc}: "joined" must follow YYYY-MM-DD format.`);
  }
}

// Runs after every file is scanned, so it doesn't depend on the order files are read.
function checkBenchmarkTermsExist() {
  for (const { req, loc } of benchmarkTerms) {
    if (!knownKhmer.has(req.khmer)) {
      errors.push(`[Unknown Benchmark Term] in ${loc}: "${req.khmer}" (${req.term}) is not a preferredKhmer or alternativeKhmer in data/terminology.`);
    }
  }
}

const inDir = (dir) => (file) => file.startsWith(dir + path.sep);

// Files matching none of these only get a JSON syntax check.
const VALIDATORS = [
  [inDir(TERMINOLOGY_DIR), validateTerm],
  [inDir(EXAMPLES_DIR), validateExample],
  [inDir(DISAMBIGUATION_DIR), validateDisambiguation],
  [(file) => file === BENCHMARK_FILE, validateBenchmark],
  [(file) => file === REVIEWERS_FILE, validateReviewer],
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
  const match = VALIDATORS.find(([matches]) => matches(file));
  if (match) asArray(data).forEach((entry, i) => match[1](entry, `${relPath} (index ${i})`));
}

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const [red, green, yellow, bold] = ['31', '32', '33', '1'].map((code) => (text) => paint(code, text));

[...listJsonFiles(DATA_DIR), ...listJsonFiles(EVALUATION_DIR)].forEach(validateFile);
checkBenchmarkTermsExist();

console.log(bold('=== Khmer AI Language Reference: Dataset Validator ===\n'));
console.log(
  `Scanned ${stats.files} files: ${stats.terms} terminology entries, ${stats.examples} translation examples, ` +
  `${stats.contexts} disambiguation entries, ${stats.benchmark} benchmark cases, ${stats.reviewers} reviewers.\n`
);

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
