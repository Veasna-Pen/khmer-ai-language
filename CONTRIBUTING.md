# Contributing to Khmer AI Language Reference

Thank you for your interest in contributing to the **Khmer AI Language Reference**! 🇰🇭

This project is an open-source, community-maintained knowledge base designed to empower AI models and LLMs to produce accurate, natural, and context-aware Khmer translations.

---

## Table of Contents
1. [Core Principles](#core-principles)
2. [Ways to Contribute](#ways-to-contribute)
3. [Terminology Guidelines](#terminology-guidelines)
4. [Khmer Orthography & Unicode Requirements](#khmer-orthography--unicode-requirements)
5. [Contribution Workflow (PRs)](#contribution-workflow-prs)
6. [Review Process & Statuses](#review-process--statuses)
7. [Running Local Validation](#running-local-validation)

---

## 1. Core Principles

- **Human Reviewed**: We do **not** accept unverified machine translations into the reference dataset. AI may assist in brainstorming, but entries must be validated by proficient Khmer speakers.
- **Context-Aware**: Translations should specify domain (`software`, `technology`, `business`, etc.) and real-world usage context.
- **Natural Khmer**: Prioritize natural phrasing over awkward literal transliteration or rigid English grammatical patterns.
- **Clean Unicode**: All Khmer text must strictly adhere to Unicode NFC normalization and standard Khmer consonant-vowel sequencing.

---

## 2. Ways to Contribute

- **Propose New Terms**: Add missing terms in Software, UI, Cloud, Business, E-Commerce, etc.
- **Improve Existing Entries**: Add real-world example sentences, disambiguate contexts, or suggest better preferred translations.
- **Review Pending Entries**: Participate in Pull Request discussions to review entries in `draft` status.
- **Add Translation Pairs**: Provide reviewed parallel sentences for the examples dataset.
- **Build Developer Tools**: Enhance validation scripts, export utilities, RAG examples, or MCP server implementations.

---

## 3. Terminology Guidelines

Each term must conform to the JSON schema defined in [`schemas/term.schema.json`](schemas/term.schema.json).

### Entry Structure Example
```json
{
  "id": "tech-software-authentication",
  "term": "authentication",
  "sourceLanguage": "en",
  "preferredKhmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ",
  "alternativeKhmer": [
    "ការផ្ទៀងផ្ទាត់"
  ],
  "domain": "software",
  "context": "security and user login",
  "partOfSpeech": "noun",
  "examples": [
    {
      "source": "Two-factor authentication is enabled.",
      "khmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហានត្រូវបានបើកដំណើរការ។",
      "notes": "Standard security settings context"
    }
  ],
  "usageNotes": "Use 'ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ' for identity authentication. Avoid using transliteration.",
  "status": "draft",
  "provenance": {
    "sourceType": "community",
    "reference": "Common software security UI convention",
    "reviewedBy": [],
    "lastUpdated": "2026-09-28"
  }
}
```

---

## 4. Khmer Orthography & Unicode Requirements

To ensure AI systems, search engines, and RAG pipelines can reliably index and retrieve terms:

1. **Normalization**: All Khmer text must be in **Unicode Normalization Form C (NFC)**.
2. **Subscript Consonants**: Always use the standard Khmer Coeng sign `\u17D2` (្) followed by the subscript consonant.
3. **No Orphaned Coeng**: Every `\u17D2` must be followed by a valid Khmer consonant or independent vowel.
4. **Punctuation**:
   - Use Khmer Khan (`។` / `\u17D4`) for sentence endings.
   - Use Bariyoosan (`៕` / `\u17D5`) for end of complete paragraphs/sections when appropriate.
   - Do not mix Latin periods (`.`) directly into Khmer prose unless formatting technical code/URLs.
5. Refer to [`docs/khmer-orthography-guide.md`](docs/khmer-orthography-guide.md) for complete details.

---

## 5. Contribution Workflow (PRs)

1. **Fork the repository** on GitHub.
2. **Create a descriptive branch**:
   ```bash
   git checkout -b feat/add-ui-terms
   ```
3. **Add or modify files** in `data/terminology/<domain>/...` or `data/examples/...`.
4. **Run the local validation tool**:
   ```bash
   npm test
   ```
   Ensure all schema tests and Unicode integrity checks pass.
5. **Commit your changes**:
   ```bash
   git commit -m "feat(terminology): add authentication and authorization UI terms"
   ```
6. **Submit a Pull Request**. Fill out the PR template with reference sources and context.

---

## 6. Review Process & Statuses

Submissions progress through the following statuses:

1. `draft`: Initial community submission submitted via PR.
2. `community-reviewed`: Reviewed and vetted by at least 2 community contributors.
3. `expert-reviewed`: Verified by a native linguist, translator, or domain expert against authoritative sources (e.g. National Council of Khmer Language - NCKL).
4. `verified`: Established standard widely adopted in real-world software and documentation.
5. `deprecated`: Legacy translation replaced by a more natural or official term.

---

## 7. Running Local Validation

We provide automated validation scripts built with Node.js:

```bash
# Validate all data files against JSON schemas and Khmer Unicode rules
npm test

# Format and check build outputs
npm run build
```
