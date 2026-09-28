# Project Roadmap

The roadmap outlines the planned evolutionary stages of the **Khmer AI Language Reference** project.

---

## 🚀 Phase 1: Foundation & Core Standards (Current)
- [x] Initial project repository setup and dual licensing (CC BY 4.0 + MIT).
- [x] Contributor governance, Code of Conduct, and Khmer Orthography standards.
- [x] JSON Schemas for Terminology, Translation Examples, and Evaluation Benchmark.
- [x] Automated CI quality linter (Unicode NFC verification, duplicate detection, schema validation).
- [ ] Curate the first 250+ Software and UI terminology items.

---

## 📦 Phase 2: Domain Expansion & Seed Dataset (v0.2.0)
- [ ] Expand terminology to 1,000+ entries across:
  - Software & Application UI
  - Cloud Infrastructure & Networking
  - Business & Financial Services
  - E-Commerce & Logistics
  - Digital Media & Marketing
- [ ] Curate 200+ reviewed parallel translation examples with before/after LLM comparisons.
- [ ] Build compiled distribution artifacts (`dist/khmer-ai-reference.json`, CSV, and SQLite database).

---

## 🤖 Phase 3: AI Integration & Developer Utilities (v0.3.0)
- [ ] Provide ready-to-use Prompt Engineering templates for Gemini, Claude, and GPT.
- [ ] Implement a minimal, zero-dependency Python/Node RAG reference script.
- [ ] Implement Model Context Protocol (MCP) server for Claude Desktop, Cursor, and agentic workflows.
- [ ] Publish documentation for fine-tuning dataset generation and RAG ingestion.

---

## 📊 Phase 4: Evaluation Benchmark & Community Scaling (v1.0.0)
- [ ] Release `evaluation/benchmark.json` with 200 curated translation evaluation prompts.
- [ ] Create automated model evaluation script (`evaluate_model.py`) measuring:
  - Preferred terminology adherence rate
  - Contextual naturalness score
  - Hallucination / transliteration avoidance
- [ ] Publish open translation quality benchmark leaderboard across major LLMs.
- [ ] Establish formal academic review partnerships for ongoing governance.
