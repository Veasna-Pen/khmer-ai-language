# Contributing to Khmer AI Language Reference

Thank you for helping AI systems write better Khmer! This guide covers everything you need to open a good pull request.

## Contents

1. [Core principles](#1-core-principles)
2. [Ways to contribute](#2-ways-to-contribute)
3. [Where does my change go?](#3-where-does-my-change-go)
4. [Adding a terminology entry](#4-adding-a-terminology-entry)
5. [Khmer text requirements](#5-khmer-text-requirements)
6. [Pull request workflow](#6-pull-request-workflow)
7. [Changing the tooling or schemas](#7-changing-the-tooling-or-schemas)
8. [Review statuses](#8-review-statuses)

---

## 1. Core principles

- **Human-reviewed only.** AI may help you brainstorm, but every Khmer translation must be checked by a proficient Khmer speaker. Unvetted machine translation is not accepted.
- **Context matters.** Each entry states its domain (`software`, `finance`, …) and the real situation where it is used.
- **Natural Khmer over literal Khmer.** Prefer how Cambodian professionals actually speak and write, not English grammar in Khmer words.
- **Clean Unicode.** All Khmer text must be NFC-normalized with valid subscript (Coeng) sequences.

---

## 2. Ways to contribute

- **Propose a term.** No coding needed: open a [Term Proposal issue](.github/ISSUE_TEMPLATE/term_proposal.md).
- **Add or improve entries.** Add terms, example sentences, alternatives, or better usage notes.
- **Review pull requests.** Native speakers are especially welcome to comment on open terminology PRs. See [review statuses](#8-review-statuses).
- **Improve tooling.** Validator, build and export scripts, RAG and MCP examples, benchmark.

---

## 3. Where does my change go?

| I want to add… | Edit this | Format |
| :--- | :--- | :--- |
| A term (e.g. *log in*, *invoice*) | `data/terminology/<domain>/<topic>.json` | [`term.schema.json`](schemas/term.schema.json) |
| A word that translates differently by context | `data/disambiguation/contexts.json` | [`disambiguation.schema.json`](schemas/disambiguation.schema.json) |
| A full reviewed sentence pair | `data/examples/reviewed.json` | [`translation.schema.json`](schemas/translation.schema.json) |
| A benchmark test sentence | `evaluation/benchmark.json` | [`benchmark.schema.json`](schemas/benchmark.schema.json) |

Existing topic files:

| Domain | File | ID prefix |
| :--- | :--- | :--- |
| software | `software/auth.json` | `sw-auth-` |
| software | `software/ui.json` | `sw-ui-` |
| software | `software/data-cloud.json` | `sw-cloud-` |
| finance | `finance/banking.json` | `fin-bank-` |
| ecommerce | `ecommerce/shopping.json` | `ecom-shop-` |
| business | `business/corporate.json` | `biz-corp-` |

Add to an existing file when the topic fits. To start a new topic, create a new JSON file containing an array, e.g. `software/networking.json` with prefix `sw-net-`.

---

## 4. Adding a terminology entry

Each file in `data/terminology/` is a JSON **array** of entries. Append yours:

```json
{
  "id": "sw-auth-two-factor-auth",
  "term": "two-factor authentication",
  "sourceLanguage": "en",
  "preferredKhmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហាន",
  "alternativeKhmer": [],
  "domain": "software",
  "context": "Account security settings",
  "partOfSpeech": "noun",
  "examples": [
    {
      "source": "Two-factor authentication is enabled.",
      "khmer": "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហានត្រូវបានបើកដំណើរការ។",
      "notes": "Security settings toggle"
    }
  ],
  "usageNotes": "Explain nuances and mistakes AI models should avoid.",
  "status": "draft",
  "provenance": {
    "sourceType": "community",
    "reference": "Where this translation comes from",
    "reviewedBy": [],
    "lastUpdated": "2026-09-28"
  }
}
```

Checklist:

- **`id`**: lowercase kebab-case, unique across the whole dataset, starting with the file's prefix (see the table above).
- **`status`**: new entries are always `draft`. Reviewers move them up; see [review statuses](#8-review-statuses).
- **`provenance.sourceType`**: one of `national-council`, `official-glossary`, `academic`, `community`, `translator`. Cite the source in `reference`.
- **`provenance.lastUpdated`**: today's date as `YYYY-MM-DD`.
- **Duplicates**: search first. If the term exists, improve that entry instead of adding a second one.

---

## 5. Khmer text requirements

The validator (`npm test`) enforces these rules:

1. **NFC normalization.** All Khmer text must be in Unicode Normalization Form C.
2. **Valid Coeng.** Every Coeng sign `្` (`U+17D2`) must be followed by a Khmer consonant (`U+1780`–`U+17A2`). Two Coeng signs in a row are not allowed.
3. **Khmer punctuation.** End Khmer sentences with Khan `។` (`U+17D4`), not a Latin `.`. This is a warning, not an error.

Also follow these conventions (not checked automatically):

- **No invisible characters** such as zero-width spaces (`U+200B`) inside `preferredKhmer`. They break search and retrieval.
- **Avoid phonetic transliteration** when a Khmer term exists, e.g. write លុប for "delete", not ឌីលេត.
- **Avoid unnecessary passive voice** (ត្រូវបាន) carried over from English in example sentences.
- **No English plurals.** Khmer nouns don't take plural endings.

---

## 6. Pull request workflow

1. Fork the repository and create a branch:
   ```bash
   git checkout -b feat/add-networking-terms
   ```
2. Make your changes (see [section 3](#3-where-does-my-change-go)).
3. Validate:
   ```bash
   npm test
   ```
   Fix every error. Review the warnings.
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) style:
   ```bash
   git commit -m "feat(terminology): add networking terms"
   ```
   Common scopes: `terminology`, `examples`, `disambiguation`, `benchmark`, `docs`, `tools`.
5. Open a pull request and fill in the template, including your sources.

CI runs `npm test`, `npm run build` and `npm run export` on every pull request.

---

## 7. Changing the tooling or schemas

- All scripts are dependency-free Node.js (version in `.nvmrc`). Please keep it that way unless there's a strong reason.
- Shared code lives in `tools/lib/`: `paths.js` holds every file location, and `dataset.js` has the JSON loaders. Use these instead of hard-coding paths or re-implementing file loading.
- The validator reads its required fields and allowed values (domain, status, part of speech, source type, ID and date patterns) from `schemas/term.schema.json` and `schemas/translation.schema.json`. **The schemas are the single source of truth.**
- To add a new domain, add it to the `domain` enum in both schemas, and update the domain list in README.md if it changes.
- `examples/mcp/server.js` uses stdout for protocol messages. Log to `console.error` only.
- Run `npm run check` (validate, build, export, evaluate) before opening the PR.

---

## 8. Review statuses

Every entry has a `status` that records how thoroughly it has been reviewed:

| Status | Meaning |
| :--- | :--- |
| `draft` | New submission, not yet reviewed. All new entries start here. |
| `community-reviewed` | Approved by at least 2 community contributors. |
| `expert-reviewed` | Checked by a native linguist, translator, or domain expert against authoritative sources, e.g. the National Council of Khmer Language (NCKL). |
| `verified` | Established standard, widely used in real software and documentation. |
| `deprecated` | Superseded by a better term. Explain the replacement in `usageNotes`. |

When reviewing, check:

- **Spelling:** correct according to the Chuon Nath dictionary or NCKL, and passes `npm test`.
- **Naturalness:** would a Cambodian professional in this field actually say it?
- **No needless transliteration:** a real Khmer term is used where one exists.
- **Disambiguation:** if the English word has several meanings, the context is explicit.

When two translations are both in real use, put the one backed by NCKL or the dominant industry standard in `preferredKhmer`. List the other in `alternativeKhmer` with an explanation in `usageNotes`.
