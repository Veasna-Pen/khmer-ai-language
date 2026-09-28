const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT, 'data');
const DIST_DIR = path.join(ROOT, 'dist');
const EVALUATION_DIR = path.join(ROOT, 'evaluation');

module.exports = {
  ROOT,
  DATA_DIR,
  TERMINOLOGY_DIR: path.join(DATA_DIR, 'terminology'),
  EXAMPLES_DIR: path.join(DATA_DIR, 'examples'),
  EXAMPLES_FILE: path.join(DATA_DIR, 'examples', 'reviewed.json'),
  CONTEXTS_FILE: path.join(DATA_DIR, 'disambiguation', 'contexts.json'),
  SCHEMAS_DIR: path.join(ROOT, 'schemas'),
  EVALUATION_DIR,
  BENCHMARK_FILE: path.join(EVALUATION_DIR, 'benchmark.json'),
  DIST_DIR,
  BUNDLE_FILE: path.join(DIST_DIR, 'khmer-ai-reference.json'),
  BUNDLE_MIN_FILE: path.join(DIST_DIR, 'khmer-ai-reference.min.json'),
  CSV_FILE: path.join(DIST_DIR, 'khmer-ai-reference.csv'),
  GLOSSARY_FILE: path.join(DIST_DIR, 'GLOSSARY.md'),
};
