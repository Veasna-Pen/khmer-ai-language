#!/usr/bin/env node

/**
 * Khmer AI Language Reference - Model Context Protocol (MCP) Server
 * 
 * Exposes reference tools to AI agents (Claude Desktop, Cursor, Antigravity)
 * using the standard JSON-RPC 2.0 protocol over stdio.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DIST_PATH = path.resolve(__dirname, '../../dist/khmer-ai-reference.json');
const CONTEXTS_PATH = path.resolve(__dirname, '../../data/disambiguation/contexts.json');
const EXAMPLES_PATH = path.resolve(__dirname, '../../data/examples/reviewed.json');

// Ensure dist bundle exists
if (!fs.existsSync(DIST_PATH)) {
  require('../../tools/compiler/build-dist.js');
}

const termsBundle = JSON.parse(fs.readFileSync(DIST_PATH, 'utf8')).terms;
const contextsData = fs.existsSync(CONTEXTS_PATH) ? JSON.parse(fs.readFileSync(CONTEXTS_PATH, 'utf8')) : [];
const examplesData = fs.existsSync(EXAMPLES_PATH) ? JSON.parse(fs.readFileSync(EXAMPLES_PATH, 'utf8')) : [];

// Tool definitions exposed to AI models
const TOOLS = [
  {
    name: "search_khmer_terminology",
    description: "Search verified Khmer translations, preferred terms, and usage notes for a source term.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "English word or phrase to look up (e.g. 'authentication', 'reset password')"
        },
        domain: {
          type: "string",
          description: "Optional domain filter (e.g. 'software', 'finance', 'ecommerce', 'business')"
        }
      },
      required: ["query"]
    }
  },
  {
    "name": "get_khmer_context_rules",
    "description": "Retrieve context disambiguation rules for polysemous words (e.g. 'account', 'save', 'post', 'checkout').",
    "inputSchema": {
      "type": "object",
      "properties": {
        "term": {
          "type": "string",
          "description": "Word to disambiguate across domains"
        }
      },
      "required": ["term"]
    }
  },
  {
    "name": "get_translation_examples",
    "description": "Get reviewed bilingual sentence pairs illustrating natural Khmer phrasing.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "phrase": {
          "type": "string",
          "description": "Keyword or domain topic to find relevant example sentences for"
        }
      },
      "required": ["phrase"]
    }
  }
];

function handleToolCall(name, args) {
  if (name === "search_khmer_terminology") {
    const q = (args.query || "").toLowerCase();
    const domain = args.domain ? args.domain.toLowerCase() : null;

    const matches = termsBundle.filter(t => {
      const matchTerm = t.term.toLowerCase().includes(q) || (t.alternativeKhmer && t.alternativeKhmer.some(k => k.includes(q)));
      const matchDomain = domain ? t.domain.toLowerCase() === domain : true;
      return matchTerm && matchDomain;
    });

    if (matches.length === 0) {
      return {
        content: [{ type: "text", text: `No verified terminology found for "${args.query}".` }]
      };
    }

    const summary = matches.map(m => (
      `Term: ${m.term}\nPreferred Khmer: ${m.preferredKhmer}\nAlternatives: ${(m.alternativeKhmer || []).join(', ') || 'None'}\nDomain: ${m.domain} (${m.context || 'general'})\nStatus: ${m.status}\nNotes: ${m.usageNotes || 'N/A'}`
    )).join('\n\n---\n\n');

    return { content: [{ type: "text", text: summary }] };
  }

  if (name === "get_khmer_context_rules") {
    const target = (args.term || "").toLowerCase().trim();
    const entry = contextsData.find(c => c.term.toLowerCase() === target);
    if (!entry) {
      return { content: [{ type: "text", text: `No specific disambiguation rules found for "${args.term}".` }] };
    }

    let text = `Disambiguation Rules for "${entry.term}":\n${entry.notes}\n\n`;
    entry.disambiguations.forEach(d => {
      text += `- Context: ${d.context}\n  Khmer: ${d.khmer}\n  Example: "${d.exampleSource}" -> "${d.exampleKhmer}"\n\n`;
    });

    return { content: [{ type: "text", text: text.trim() }] };
  }

  if (name === "get_translation_examples") {
    const target = (args.phrase || "").toLowerCase().trim();
    const matches = examplesData.filter(ex => 
      ex.source.toLowerCase().includes(target) || 
      ex.domain.toLowerCase().includes(target) ||
      (ex.keyTerms && ex.keyTerms.some(k => k.toLowerCase().includes(target)))
    );

    if (matches.length === 0) {
      return { content: [{ type: "text", text: `No reviewed examples found matching "${args.phrase}".` }] };
    }

    const text = matches.map(ex => (
      `Source: ${ex.source}\nKhmer: ${ex.translation}\nDomain: ${ex.domain} (${ex.context})\nNotes: ${ex.notes || 'N/A'}`
    )).join('\n\n---\n\n');

    return { content: [{ type: "text", text }] };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// JSON-RPC stdio handler
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch (err) {
    return;
  }

  const { id, method, params } = request;

  if (method === "initialize") {
    const response = {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: {
          name: "khmer-ai-reference-mcp",
          version: "0.1.0"
        }
      }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
    return;
  }

  if (method === "tools/list") {
    const response = {
      jsonrpc: "2.0",
      id,
      result: { tools: TOOLS }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
    return;
  }

  if (method === "tools/call") {
    try {
      const result = handleToolCall(params.name, params.arguments || {});
      const response = {
        jsonrpc: "2.0",
        id,
        result
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (err) {
      const response = {
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: err.message }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    }
    return;
  }
});
