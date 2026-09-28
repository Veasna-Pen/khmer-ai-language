# Khmer AI Language Reference 🇰🇭

[![License: CC BY 4.0](https://img.shields.io/badge/Data_License-CC_BY_4.0-lightgrey.svg)](LICENSE-DATA)
[![License: MIT](https://img.shields.io/badge/Code_License-MIT-blue.svg)](LICENSE-CODE)
[![CI Validation](https://github.com/khmer-ai/khmer-ai-language/actions/workflows/validate-data.yml/badge.svg)](https://github.com/khmer-ai/khmer-ai-language/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **An open-source, community-maintained Khmer language reference designed to help AI and Large Language Models (LLMs) produce accurate, natural, and context-aware Khmer translations.**

---

## 🎯 The Core Mission

When an AI receives:
> *"Translate this software message into Khmer."*

Instead of guessing or literally transliterating English terms, the AI consults this reference first:

```text
Source Language (English / Any)
         ↓
      AI / LLM
         ↓
Check Khmer AI Language Reference
   ├── Preferred terminology (ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ instead of literal translation)
   ├── Natural Khmer phrasing & syntax
   ├── Domain & context rules (software UI vs business contract)
   └── Human-reviewed translation examples
         ↓
High-Quality, Natural Khmer Translation 🇰🇭
```

> **Core Principle**: *Don't build another AI model. Build the foundational Khmer language knowledge that all AI models can use.*

---

## 🔍 Why This Project?

Modern LLMs (Gemini, GPT, Claude, LLaMA) can generate Khmer text, but frequently suffer from:
1. **Literal Word-by-Word Replacement**: Carrying English sentence structures directly into Khmer.
2. **Inconsistent Technical Terminology**: Translating "Account" as គណនី, គណនេយ្យ, or using untranslated English loanwords haphazardly.
3. **Context Blindness**: Failing to distinguish between a "Bank Account" (គណនីធនាគារ) and a "User Account" (គណនីអ្នកប្រើប្រាស់).
4. **Unnatural Phrasing**: Using archaic, overly formal words or machine-like repetitions.

This project delivers **structured, human-reviewed, machine-readable reference data** that AI systems can ingest via **System Prompts**, **RAG (Retrieval-Augmented Generation)**, or **MCP (Model Context Protocol)**.

---

## 📂 Repository Structure

```text
khmer-ai-language/
├── data/
│   ├── terminology/               # Curated terms partitioned by domain
│   │   ├── software/              # UI, auth, security, cloud terms
│   │   ├── technology/            # Hardware, IT, networking
│   │   ├── business/              # Corporate, management, contracts
│   │   ├── finance/               # Banking, payments, accounting
│   │   └── ecommerce/             # Cart, checkout, shipping, orders
│   ├── examples/                  # Reviewed parallel sentences with notes
│   │   └── reviewed.json
│   └── disambiguation/            # Multi-meaning terms categorized by context
│       └── contexts.json
│
├── schemas/                       # Formal JSON schemas for strict CI validation
│   ├── term.schema.json
│   ├── translation.schema.json
│   └── benchmark.schema.json
│
├── docs/                          # Comprehensive guidelines & specifications
│   ├── khmer-orthography-guide.md # Unicode normalization (NFC) & punctuation
│   ├── data-model.md              # Detailed schema documentation
│   ├── review-process.md          # Review tiers (draft -> verified)
│   └── ai-integration-guide.md    # Integration recipes for LLM developers
│
├── tools/                         # Automated validation & export utilities
│   ├── validator/                 # Schema & Unicode NFC test runner
│   │   └── validate.js
│   ├── compiler/                  # Compiles partitioned files into dist bundle
│   │   └── build-dist.js
│   └── export/                    # Exports to SQLite, CSV, and Markdown
│       └── export-formats.js
│
├── examples/                      # LLM integration examples
│   ├── prompts/                   # Ready-to-use prompt templates
│   └── rag/                       # Minimal Python/Node retrieval example
│
├── evaluation/                    # Quality benchmarks and evaluation prompts
│   ├── benchmark.json
│   └── README.md
│
├── CONTRIBUTING.md                # Contribution guidelines
├── CODE_OF_CONDUCT.md             # Contributor Covenant v2.1
├── GOVERNANCE.md                  # Project governance model
├── ROADMAP.md                     # Planned milestones
├── LICENSE-DATA                   # CC BY 4.0 (for data)
└── LICENSE-CODE                   # MIT (for code)
```

---

## ⚡ Quick Start for AI Developers

### Method 1: Direct Prompt Injection
Add preferred terminology directly into your LLM prompt:

```text
Translate the following sentence into Khmer.

Before translating, adhere strictly to these verified Khmer terminology rules:
- "authentication" -> "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ" (Context: software security)
- "two-factor authentication" -> "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហាន"
- "reset password" -> "កំណត់ពាក្យសម្ងាត់ឡើងវិញ"

Sentence to translate:
"Two-factor authentication is required to reset your password."

Translated Khmer:
```

**Output**:
> តម្រូវឱ្យមានការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហានដើម្បីកំណត់ពាក្យសម្ងាត់របស់អ្នកឡើងវិញ។

---

### Method 2: Local Dataset Validation & Build

Make sure you have [Node.js](https://nodejs.org/) installed (v18+).

```bash
# Clone the repository
git clone https://github.com/khmer-ai/khmer-ai-language.git
cd khmer-ai-language

# Run validation tests (checks schemas, Unicode NFC, and duplicate terms)
npm test

# Compile distribution bundles (generates single dist/khmer-ai-reference.json)
npm run build
```

---

## 📝 Example Term Entry

```json
{
  "id": "tech-software-authentication",
  "term": "authentication",
  "sourceLanguage": "en",
  "preferredKhmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ",
  "alternativeKhmer": ["ការផ្ទៀងផ្ទាត់"],
  "domain": "software",
  "context": "identity verification and security",
  "partOfSpeech": "noun",
  "examples": [
    {
      "source": "User authentication failed.",
      "khmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណអ្នកប្រើប្រាស់បានបរាជ័យ។",
      "notes": "Error notification context"
    }
  ],
  "usageNotes": "Use 'ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ' in formal software UI. Do not transliterate phonetically.",
  "status": "expert-reviewed",
  "provenance": {
    "sourceType": "official-glossary",
    "reference": "National Council of Khmer Language (NCKL) / Tech Lexicon",
    "reviewedBy": ["Khmer NLP Working Group"],
    "lastUpdated": "2026-09-28"
  }
}
```

---

## 🤝 Contributing

We welcome contributions from native Khmer speakers, translators, linguists, and developers!
* Read our [Contribution Guide](CONTRIBUTING.md) to learn how to propose new terms and review pull requests.
* Review the [Khmer Orthography Guide](docs/khmer-orthography-guide.md) for Unicode standards and writing conventions.

---

## 📜 Licenses

* **Linguistic Data & Docs**: Licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-DATA).
* **Code & Tooling**: Licensed under the [MIT License](LICENSE-CODE).
