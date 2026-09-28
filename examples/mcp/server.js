#!/usr/bin/env node
// Minimal MCP server (JSON-RPC 2.0 over stdio) exposing Khmer terminology lookup tools.
// stdout carries protocol messages only; anything else must go to stderr.

const readline = require('readline');
const { loadBundle, loadContexts, loadExamples } = require('../../tools/lib/dataset');
const { version } = require('../../package.json');

const PROTOCOL_VERSION = '2024-11-05';

const { terms } = loadBundle();
const contexts = loadContexts();
const examples = loadExamples();

const textResult = (text) => ({ content: [{ type: 'text', text }] });
const contains = (value, query) => (value || '').toLowerCase().includes(query);
const stringArg = (description) => ({ type: 'string', description });

const TOOLS = {
  search_khmer_terminology: {
    description: 'Search Khmer translations, preferred terms, review status, and usage notes for a source term.',
    inputSchema: {
      type: 'object',
      properties: {
        query: stringArg("English word or phrase to look up (e.g. 'authentication', 'reset password')"),
        domain: stringArg("Optional domain filter (e.g. 'software', 'finance', 'ecommerce', 'business')"),
      },
      required: ['query'],
    },
    handler({ query = '', domain }) {
      const q = query.toLowerCase();
      const matches = terms.filter((t) =>
        (contains(t.term, q) || (t.alternativeKhmer || []).some((k) => k.includes(q))) &&
        (!domain || t.domain.toLowerCase() === domain.toLowerCase())
      );
      if (!matches.length) return textResult(`No terminology found for "${query}".`);

      return textResult(matches.map((m) => [
        `Term: ${m.term}`,
        `Preferred Khmer: ${m.preferredKhmer}`,
        `Alternatives: ${(m.alternativeKhmer || []).join(', ') || 'None'}`,
        `Domain: ${m.domain} (${m.context || 'general'})`,
        `Status: ${m.status}`,
        `Notes: ${m.usageNotes || 'N/A'}`,
      ].join('\n')).join('\n\n---\n\n'));
    },
  },

  get_khmer_context_rules: {
    description: "Retrieve context disambiguation rules for polysemous words (e.g. 'account', 'save', 'post', 'checkout').",
    inputSchema: {
      type: 'object',
      properties: { term: stringArg('Word to disambiguate across domains') },
      required: ['term'],
    },
    handler({ term = '' }) {
      const entry = contexts.find((c) => c.term.toLowerCase() === term.toLowerCase().trim());
      if (!entry) return textResult(`No specific disambiguation rules found for "${term}".`);

      const rules = entry.disambiguations.map((d) =>
        `- Context: ${d.context}\n  Khmer: ${d.khmer}\n  Example: "${d.exampleSource}" -> "${d.exampleKhmer}"`
      );
      return textResult(`Disambiguation Rules for "${entry.term}":\n${entry.notes}\n\n${rules.join('\n\n')}`);
    },
  },

  get_translation_examples: {
    description: 'Get reviewed bilingual sentence pairs illustrating natural Khmer phrasing.',
    inputSchema: {
      type: 'object',
      properties: { phrase: stringArg('Keyword or domain topic to find relevant example sentences for') },
      required: ['phrase'],
    },
    handler({ phrase = '' }) {
      const q = phrase.toLowerCase().trim();
      const matches = examples.filter((ex) =>
        contains(ex.source, q) || contains(ex.domain, q) || (ex.keyTerms || []).some((k) => contains(k, q))
      );
      if (!matches.length) return textResult(`No reviewed examples found matching "${phrase}".`);

      return textResult(matches.map((ex) =>
        `Source: ${ex.source}\nKhmer: ${ex.translation}\nDomain: ${ex.domain} (${ex.context})\nNotes: ${ex.notes || 'N/A'}`
      ).join('\n\n---\n\n'));
    },
  },
};

const METHODS = {
  initialize: () => ({
    protocolVersion: PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: 'khmer-ai-reference-mcp', version },
  }),
  ping: () => ({}),
  'tools/list': () => ({
    tools: Object.entries(TOOLS).map(([name, { description, inputSchema }]) => ({ name, description, inputSchema })),
  }),
  'tools/call': ({ name, arguments: args = {} } = {}) => {
    const tool = TOOLS[name];
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.handler(args);
  },
};

const send = (message) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');

readline.createInterface({ input: process.stdin, terminal: false }).on('line', (line) => {
  if (!line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return send({ id: null, error: { code: -32700, message: 'Parse error' } });
  }

  const { id, method, params } = request;
  if (id === undefined) return; // notification: no response expected

  const handler = METHODS[method];
  if (!handler) return send({ id, error: { code: -32601, message: `Method not found: ${method}` } });

  try {
    send({ id, result: handler(params) });
  } catch (err) {
    send({ id, error: { code: -32603, message: err.message } });
  }
});
