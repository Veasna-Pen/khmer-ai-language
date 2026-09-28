const fs = require('fs');
const path = require('path');
const paths = require('./paths');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readJsonIfExists(file, fallback) {
  return fs.existsSync(file) ? readJson(file) : fallback;
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJsonFiles(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

function loadSchema(name) {
  return readJson(path.join(paths.SCHEMAS_DIR, `${name}.schema.json`));
}

function loadTerms() {
  return listJsonFiles(paths.TERMINOLOGY_DIR).flatMap((file) => {
    const data = readJson(file);
    return Array.isArray(data) ? data : [];
  });
}

// Builds dist/ on first use. Logs to stderr so stdout stays clean for the MCP server.
function loadBundle() {
  if (!fs.existsSync(paths.BUNDLE_FILE)) {
    console.error('dist bundle not found, building it first...');
    require('../compiler/build-dist').build();
  }
  return readJson(paths.BUNDLE_FILE);
}

module.exports = {
  readJson,
  listJsonFiles,
  loadSchema,
  loadTerms,
  loadBundle,
  loadContexts: () => readJsonIfExists(paths.CONTEXTS_FILE, []),
  loadExamples: () => readJsonIfExists(paths.EXAMPLES_FILE, []),
  loadBenchmark: () => readJson(paths.BENCHMARK_FILE),
};
