#!/usr/bin/env node

/**
 * Khmer AI Language Reference - Dataset Validator
 * 
 * Validates all dataset files against:
 * 1. JSON structure & syntax
 * 2. Schema field types and constraints
 * 3. Unicode Normalization Form C (NFC)
 * 4. Khmer orthographic integrity (no orphaned Coeng \u17D2, duplicate diacritics)
 * 5. Unique IDs and duplicate term definitions
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const EVAL_DIR = path.join(ROOT_DIR, 'evaluation');

// ANSI Colors
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

let totalFilesChecked = 0;
let totalTermsChecked = 0;
let totalExamplesChecked = 0;
let errors = [];
let warnings = [];

// Registry for uniqueness checks
const seenTermIds = new Map();
const seenTermsInDomain = new Map(); // key: "domain::term.toLowerCase()"

// Allowed Enums
const VALID_DOMAINS = [
  'software',
  'technology',
  'business',
  'finance',
  'ecommerce',
  'general',
  'legal',
  'healthcare',
  'education'
];

const VALID_STATUSES = [
  'draft',
  'community-reviewed',
  'expert-reviewed',
  'verified',
  'deprecated'
];

const VALID_POS = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'phrase',
  'abbreviation'
];

const VALID_SOURCE_TYPES = [
  'national-council',
  'official-glossary',
  'academic',
  'community',
  'translator'
];

// Khmer Regex Patterns
const KHMER_COENG = '\u17D2';
// Khmer consonants and independent vowels that can follow a Coeng
const VALID_POST_COENG = /^[\u1780-\u17A2]/;

function checkUnicodeNfc(text, fieldName, location) {
  if (typeof text !== 'string') return;
  const normalized = text.normalize('NFC');
  if (text !== normalized) {
    errors.push(`[NFC Normalization Error] in ${location} -> "${fieldName}": Text is not in Unicode NFC normalization.`);
  }

  // Check for orphaned Coeng
  for (let i = 0; i < text.length; i++) {
    if (text[i] === KHMER_COENG) {
      const nextChar = text[i + 1];
      if (!nextChar || !VALID_POST_COENG.test(nextChar)) {
        errors.push(`[Khmer Orthography Error] in ${location} -> "${fieldName}": Orphaned or invalid Coeng (្) at index ${i}. Must be followed by a Khmer consonant.`);
      }
    }
  }

  // Check for consecutive Coeng
  if (text.includes('\u17D2\u17D2')) {
    errors.push(`[Khmer Orthography Error] in ${location} -> "${fieldName}": Contains duplicate consecutive Coeng marks (្្).`);
  }
}

function validateTermEntry(entry, fileRelPath, index) {
  totalTermsChecked++;
  const loc = `${fileRelPath} (index ${index})`;

  // Required Fields
  const required = ['id', 'term', 'sourceLanguage', 'preferredKhmer', 'domain', 'status', 'provenance'];
  for (const field of required) {
    if (!entry[field]) {
      errors.push(`[Missing Field] in ${loc}: Required field "${field}" is missing or empty.`);
    }
  }

  // ID Validation
  if (entry.id) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id)) {
      errors.push(`[Invalid ID] in ${loc}: ID "${entry.id}" must be kebab-case (lowercase alphanumeric and hyphens).`);
    }
    if (seenTermIds.has(entry.id)) {
      errors.push(`[Duplicate ID] in ${loc}: ID "${entry.id}" already declared in ${seenTermIds.get(entry.id)}.`);
    } else {
      seenTermIds.set(entry.id, loc);
    }
  }

  // Term & Domain Duplication
  if (entry.term && entry.domain) {
    const termKey = `${entry.domain.toLowerCase()}::${entry.term.trim().toLowerCase()}`;
    if (seenTermsInDomain.has(termKey)) {
      warnings.push(`[Duplicate Term in Domain] in ${loc}: Term "${entry.term}" is defined multiple times in domain "${entry.domain}". Check existing entry in ${seenTermsInDomain.get(termKey)}.`);
    } else {
      seenTermsInDomain.set(termKey, loc);
    }
  }

  // Domain Enum
  if (entry.domain && !VALID_DOMAINS.includes(entry.domain)) {
    errors.push(`[Invalid Domain] in ${loc}: Domain "${entry.domain}" is invalid. Allowed: ${VALID_DOMAINS.join(', ')}.`);
  }

  // Status Enum
  if (entry.status && !VALID_STATUSES.includes(entry.status)) {
    errors.push(`[Invalid Status] in ${loc}: Status "${entry.status}" is invalid. Allowed: ${VALID_STATUSES.join(', ')}.`);
  }

  // Part of Speech Enum
  if (entry.partOfSpeech && !VALID_POS.includes(entry.partOfSpeech)) {
    errors.push(`[Invalid Part of Speech] in ${loc}: "${entry.partOfSpeech}" is invalid. Allowed: ${VALID_POS.join(', ')}.`);
  }

  // Provenance Object
  if (entry.provenance) {
    if (!entry.provenance.sourceType || !VALID_SOURCE_TYPES.includes(entry.provenance.sourceType)) {
      errors.push(`[Invalid Provenance] in ${loc}: "sourceType" must be one of ${VALID_SOURCE_TYPES.join(', ')}.`);
    }
    if (entry.provenance.lastUpdated && !/^\d{4}-\d{2}-\d{2}$/.test(entry.provenance.lastUpdated)) {
      errors.push(`[Invalid Date] in ${loc}: "provenance.lastUpdated" must follow YYYY-MM-DD format.`);
    }
  }

  // Unicode NFC Checks
  if (entry.preferredKhmer) {
    checkUnicodeNfc(entry.preferredKhmer, 'preferredKhmer', loc);
  }

  if (Array.isArray(entry.alternativeKhmer)) {
    entry.alternativeKhmer.forEach((alt, idx) => {
      checkUnicodeNfc(alt, `alternativeKhmer[${idx}]`, loc);
    });
  }

  // Examples array
  if (Array.isArray(entry.examples)) {
    entry.examples.forEach((ex, idx) => {
      if (!ex.source || !ex.khmer) {
        errors.push(`[Invalid Example] in ${loc} -> examples[${idx}]: Both "source" and "khmer" are required.`);
      }
      if (ex.khmer) {
        checkUnicodeNfc(ex.khmer, `examples[${idx}].khmer`, loc);
        // Warn if sentence ends with Latin dot instead of Khan, unless it's an ellipsis
        if (ex.khmer.endsWith('.') && !ex.khmer.endsWith('...')) {
          warnings.push(`[Punctuation Warning] in ${loc} -> examples[${idx}]: Khmer sentence ends with Latin '.' instead of Khmer Khan (។).`);
        }
      }
    });
  }
}

function validateTranslationExample(entry, fileRelPath, index) {
  totalExamplesChecked++;
  const loc = `${fileRelPath} (index ${index})`;

  const required = ['id', 'source', 'translation', 'domain', 'status'];
  for (const field of required) {
    if (!entry[field]) {
      errors.push(`[Missing Field] in ${loc}: Required field "${field}" is missing.`);
    }
  }

  if (entry.translation) {
    checkUnicodeNfc(entry.translation, 'translation', loc);
  }
}

function processJsonFile(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath);
  totalFilesChecked++;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    errors.push(`[Read Error] ${relPath}: ${err.message}`);
    return;
  }

  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    errors.push(`[JSON Syntax Error] ${relPath}: ${err.message}`);
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (relPath.includes('terminology')) {
        validateTermEntry(item, relPath, index);
      } else if (relPath.includes('examples')) {
        validateTranslationExample(item, relPath, index);
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    // Single object files (e.g. metadata or benchmark)
    if (data.terms && Array.isArray(data.terms)) {
      data.terms.forEach((item, index) => validateTermEntry(item, relPath, index));
    }
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item.isFile() && item.name.endsWith('.json')) {
      processJsonFile(fullPath);
    }
  }
}

console.log(`${BOLD}${BLUE}=== Khmer AI Language Reference: Dataset Validator ===${RESET}\n`);

// Scan data and evaluation directories
scanDirectory(DATA_DIR);
scanDirectory(EVAL_DIR);

console.log(`Scanned ${BOLD}${totalFilesChecked}${RESET} files.`);
console.log(`Validated ${BOLD}${totalTermsChecked}${RESET} terminology entries.`);
console.log(`Validated ${BOLD}${totalExamplesChecked}${RESET} translation examples.\n`);

if (warnings.length > 0) {
  console.log(`${BOLD}${YELLOW}Warnings (${warnings.length}):${RESET}`);
  warnings.forEach(w => console.log(`  ${YELLOW}⚠${RESET} ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.log(`${BOLD}${RED}Errors Found (${errors.length}):${RESET}`);
  errors.forEach(e => console.log(`  ${RED}✖${RESET} ${e}`));
  console.log(`\n${RED}${BOLD}Validation FAILED.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✔ All validations PASSED successfully!${RESET}\n`);
  process.exit(0);
}
