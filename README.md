# Khmer AI Language Reference

[![License: CC BY 4.0](https://img.shields.io/badge/Data_License-CC_BY_4.0-lightgrey.svg)](LICENSE-DATA)
[![License: MIT](https://img.shields.io/badge/Code_License-MIT-blue.svg)](LICENSE-CODE)
[![CI Validation](https://github.com/Veasna-Pen/khmer-ai-language/actions/workflows/validate-data.yml/badge.svg)](https://github.com/Veasna-Pen/khmer-ai-language/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **An open-source, community-maintained Khmer terminology reference that helps AI and Large Language Models (LLMs) produce accurate, natural, context-aware Khmer translations.**

> **Core principle:** *Don't build another AI model. Build the foundational Khmer language knowledge that every AI model can use.*

---

## Why this project?

Modern LLMs can write Khmer, but they often:

1. **Translate word-by-word**, carrying English sentence structure into Khmer.
2. **Use inconsistent terminology**, e.g. translating "account" as គណនី, គណនេយ្យ, or an English loanword at random.
3. **Ignore context**, e.g. confusing a *bank account* (គណនីធនាគារ) with a *user account* (គណនីអ្នកប្រើប្រាស់).
4. **Transliterate instead of translate**, e.g. writing ប៉ាសវើត for "password" instead of ពាក្យសម្ងាត់.

This project provides **structured, human-reviewed, machine-readable reference data** that AI systems can use through system prompts, RAG (retrieval-augmented generation), or MCP (Model Context Protocol) tools.

```text
Source text (English)
        │
        ▼
   AI / LLM  ──looks up──▶  Khmer AI Language Reference
        │                     ├─ preferred terminology
        │                     ├─ context / disambiguation rules
        │                     └─ reviewed example sentences
        ▼
Natural, consistent Khmer output
```

---

## What's in the dataset

| Collection | Location | What it contains |
| :--- | :--- | :--- |
| **Terminology** | [`data/terminology/<domain>/`](data/terminology) | Source term → preferred Khmer, alternatives, context, examples, review status, provenance |
| **Disambiguation** | [`data/disambiguation/contexts.json`](data/disambiguation/contexts.json) | Words whose Khmer translation depends on context (*account*, *save*, *post*, *checkout*) |
| **Reviewed examples** | [`data/examples/reviewed.json`](data/examples/reviewed.json) | Full English ↔ Khmer sentence pairs for few-shot prompting |
| **Benchmark** | [`evaluation/benchmark.json`](evaluation/benchmark.json) | Test sentences with required terms and known AI mistakes |

Current domains: `software`, `finance`, `ecommerce`, `business`. The schema also reserves `technology`, `general`, `legal`, `healthcare` and `education` for future contributions.

### Example term entry

```json
{
  "id": "sw-auth-authentication",
  "term": "authentication",
  "sourceLanguage": "en",
  "preferredKhmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ",
  "alternativeKhmer": ["ការផ្ទៀងផ្ទាត់"],
  "domain": "software",
  "context": "Security and user login",
  "partOfSpeech": "noun",
  "examples": [
    {
      "source": "User authentication is required to access this resource.",
      "khmer": "តម្រូវឱ្យមានការផ្ទៀងផ្ទាត់អត្តសញ្ញាណអ្នកប្រើប្រាស់ដើម្បីចូលប្រើប្រាស់ធនធាននេះ។",
      "notes": "Access control dialog"
    }
  ],
  "usageNotes": "Always prefer 'ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ' over literal or phonetic transliteration.",
  "status": "verified",
  "provenance": {
    "sourceType": "official-glossary",
    "reference": "National Council of Khmer Language (NCKL) & Tech Lexicons",
    "reviewedBy": ["Khmer AI Working Group"],
    "lastUpdated": "2026-09-28"
  }
}
```

Every field, with its allowed values, is defined in [`schemas/term.schema.json`](schemas/term.schema.json). The other data formats have their own schemas in [`schemas/`](schemas).

---

## Quick start

### Option 1: Use the data in a prompt (no setup)

Copy the relevant terms into your LLM prompt:

```text
Translate the following sentence into Khmer.

Use these verified Khmer terms:
- "two-factor authentication" -> "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហាន"
- "reset password" -> "កំណត់ពាក្យសម្ងាត់ឡើងវិញ"

Sentence: "Two-factor authentication is required to reset your password."
```

Expected output:

> តម្រូវឱ្យមានការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហានដើម្បីកំណត់ពាក្យសម្ងាត់របស់អ្នកឡើងវិញ។

A complete prompt template is in [`examples/prompts/`](examples/prompts/terminology-lookup.prompt.md).

### Option 2: Build the dataset locally

Requires [Node.js](https://nodejs.org/) 18 or newer. There are no dependencies to install.

```bash
git clone https://github.com/Veasna-Pen/khmer-ai-language.git
cd khmer-ai-language
npm test          # validate the dataset
npm run build     # produce dist/khmer-ai-reference.json
```

### Available scripts

| Command | What it does |
| :--- | :--- |
| `npm test` | Validates every JSON file in `data/` and `evaluation/`: required fields, allowed values, unique IDs, Unicode NFC and Khmer spelling rules |
| `npm run build` | Merges `data/terminology/**` into `dist/khmer-ai-reference.json` and `.min.json` |
| `npm run export` | Converts the build into `dist/khmer-ai-reference.csv` and `dist/GLOSSARY.md` |
| `npm run evaluate` | Runs the benchmark scorer against sample model outputs |
| `npm run check` | Runs all of the above, like CI does |
| `npm run mcp` | Starts the MCP server on stdio (for Claude Desktop, Cursor, etc.) |
| `npm run demo:rag -- "<sentence>"` | Prints a RAG-style prompt built from the terms found in the sentence |

`dist/` is generated and not committed. Rebuild it after changing any terminology.

---

## Integrating with AI systems

| Approach | Best for | Start here |
| :--- | :--- | :--- |
| **Prompt injection** | Small UI strings, known domain | [`examples/prompts/`](examples/prompts/terminology-lookup.prompt.md) |
| **RAG** | Long documents, many domains | [`examples/rag/`](examples/rag/simple-khmer-rag.js) |
| **MCP tool** | AI agents and coding assistants | [`examples/mcp/`](examples/mcp/server.js) |

For production, consider using only `expert-reviewed` and `verified` terms, or label `draft` terms as suggestions in your prompt.

### MCP server setup

The server has no dependencies and speaks JSON-RPC over stdio. It exposes `search_khmer_terminology`, `get_khmer_context_rules` and `get_translation_examples`. To add it to Claude Desktop (`claude_desktop_config.json`) or Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "khmer-ai-reference": {
      "command": "node",
      "args": ["/absolute/path/to/khmer-ai-language/examples/mcp/server.js"]
    }
  }
}
```

For Claude Code: `claude mcp add khmer-ai-reference -- node /absolute/path/to/khmer-ai-language/examples/mcp/server.js`

The server loads the data once at startup. After editing terminology, run `npm run build` and restart it.

---

## Repository layout

```text
data/                  # The dataset (CC BY 4.0) — the source of truth
├── terminology/       #   one folder per domain, one JSON array per topic
├── disambiguation/    #   context-dependent translations
└── examples/          #   reviewed sentence pairs
schemas/               # JSON Schemas: the source of truth for fields and allowed values
tools/                 # Node scripts: validator, compiler (build), exporter
└── lib/               #   shared paths and dataset loaders
examples/              # Integration demos: prompt template, RAG script, MCP server
evaluation/            # Benchmark data and scoring script
.github/               # CI workflow, issue and PR templates
```

---

## Contributing

Contributions from native Khmer speakers, translators, linguists, and developers are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) covers where each change goes, the entry format, Khmer text rules, and review statuses. Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md), and security issues go through [SECURITY.md](SECURITY.md).

---

## License

- **Data and documentation** (`data/`, `evaluation/*.json`, `schemas/`, Markdown files): [CC BY 4.0](LICENSE-DATA)
- **Code** (`tools/`, `examples/`, and all `.js` files): [MIT](LICENSE-CODE)

See [LICENSE](LICENSE) for the summary.
