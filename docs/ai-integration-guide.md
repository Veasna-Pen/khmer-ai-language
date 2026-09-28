# AI & LLM Integration Guide

This guide describes how AI developers, machine translation engineers, and LLM applications can consume the **Khmer AI Language Reference** to improve translation accuracy and naturalness.

---

## 1. Integration Patterns

There are three primary ways to integrate the reference into AI systems:

```text
                  Incoming Translation Request
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
         1. Direct Prompt   2. RAG Pipeline   3. MCP Agent Tool
           Injection        (Vector Search)     (Function Call)
               │               │               │
               └───────────────┼───────────────┘
                               ▼
                       LLM Translation
                               │
                               ▼
                    Natural Khmer Output 🇰🇭
```

---

## 2. Pattern 1: Direct Prompt Injection

Best for small-to-medium prompts or UI localization pipelines with known domains.

### System Prompt Template
```markdown
You are an expert translator specializing in translating text into natural, accurate Khmer.

CRITICAL INSTRUCTIONS:
1. Adhere strictly to the verified Khmer AI Reference rules below.
2. Do not use literal word-for-word translation.
3. Use natural Khmer sentence structure, avoiding excessive passive voice (ត្រូវបាន).
4. Output Khmer text in Unicode NFC normalization.

[VERIFIED TERMINOLOGY REFERENCE]
- authentication: ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ (Domain: Software)
- authorization: ការផ្ដល់សិទ្ធិ
- deploy: ដាក់ឱ្យដំណើរការ
- repository: ឃ្លាំងផ្ទុកទិន្នន័យ (software repo)
- reset password: កំណត់ពាក្យសម្ងាត់ឡើងវិញ
- checkout: ដំណើរការទូទាត់ប្រាក់ (Domain: E-commerce)
```

---

## 3. Pattern 2: Retrieval-Augmented Generation (RAG)

Best for translating large documents, books, or broad technical documentation.

1. **Index the Data**:
   Embed all entries from `dist/khmer-ai-reference.json` into a vector database (e.g., Chroma, Qdrant, FAISS) or full-text search engine (e.g. SQLite FTS5, Meilisearch).
2. **Retrieve Context**:
   When a user submits a sentence for translation:
   - Extract keywords from the source sentence.
   - Query the reference database for matching terms in the target domain.
   - Inject the top 5–10 matched terminology entries into the LLM context.
3. **Generate**:
   The LLM generates the Khmer translation with grounded domain context.

---

## 4. Pattern 3: Model Context Protocol (MCP)

For autonomous coding agents (Claude Desktop, Cursor, Copilot, Antigravity):

The reference MCP server exposes:
* `search_khmer_terminology(query, domain)`: Returns matching terms and preferred Khmer translations.
* `get_khmer_context_rules(term)`: Returns disambiguation rules (e.g. difference between bank account vs user account).
* `get_translation_examples(phrase)`: Returns human-reviewed sentence pairs.
