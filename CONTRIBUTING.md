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
9. [Becoming a reviewer](#9-becoming-a-reviewer)
10. [Writing natural Khmer](#10-writing-natural-khmer)

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
- **Review entries.** Native speakers, translators and linguists are especially welcome. Anyone can comment on open terminology PRs; to approve entries, [become a reviewer](#9-becoming-a-reviewer).
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
| general | `general/common.json` | `gen-common-` |
| technology | `technology/hardware.json` | `tech-hw-` |
| education | `education/school.json` | `edu-school-` |

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
- **`provenance.sourceType`**: one of `national-council`, `official-glossary`, `academic`, `community`, `translator`. Only use an official or academic type when `reference` names a specific, findable source (document title and page, or a URL).
- **`provenance.reviewedBy`**: leave empty. Only reviewers listed in [`data/reviewers.json`](data/reviewers.json) add their GitHub handle here, and only for a review they actually did.
- **`provenance.lastUpdated`**: the date of the last real change or review, as `YYYY-MM-DD`. Don't bump it for formatting-only edits.
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
- **Spacing.** Khmer doesn't put spaces between words. Use a visible space to separate clauses or phrases (roughly where English would use a comma) and between numbers and units.

Khmer punctuation to use instead of Latin marks:

| Mark | Unicode | Use it for | Common AI mistake |
| :--- | :--- | :--- | :--- |
| `។` Khan | `U+17D4` | End of a sentence | Latin `.` |
| `៕` Bariyoosan | `U+17D5` | End of a whole text, chapter or document | `.` or `។។` |
| `៖` | `U+17D6` | Colon before a list or definition | Latin `:` |
| `ៗ` Lekh too | `U+17D7` | Repeating the previous word | Writing the word out twice |
| `៛` | `U+17DB` | Riel amounts | `KHR` in running text |

See [section 10](#10-writing-natural-khmer) for style guidance.

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
- The validator reads its required fields, allowed values (domain, status, part of speech, source type, ID and date patterns) and review rules from the files in `schemas/`. **The schemas are the single source of truth.**
- It checks terminology, translation examples, disambiguation entries and the benchmark. Every Khmer term a benchmark case requires must exist as a `preferredKhmer` or `alternativeKhmer` in `data/terminology/`.
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

Who can set each status, and what `npm test` checks. Every handle in `reviewedBy` must be on the roster in [`data/reviewers.json`](data/reviewers.json):

| Status | Who can set it | Checked by `npm test` |
| :--- | :--- | :--- |
| `draft` | Any contributor | — |
| `community-reviewed` | 2 reviewers of any level | At least 2 roster handles in `reviewedBy` |
| `expert-reviewed` | An expert reviewer for the entry's domain | A `reference`, and a roster `expert` whose `domains` include the entry's domain |
| `verified` | An expert reviewer for the entry's domain, with a maintainer's sign-off | Same as `expert-reviewed` |
| `deprecated` | Maintainers | — |

### How a review is recorded

1. Draft entries are put up for review in a pull request, or with a [Review Request issue](.github/ISSUE_TEMPLATE/review_request.md) for entries already merged.
2. The reviewer checks each entry against the list below, then approves the pull request with their own GitHub account. Entries they can't approve get a review comment explaining what to change, and stay at their current status.
3. In the same pull request, the reviewer's handle is added to `provenance.reviewedBy`, `status` is raised, and `lastUpdated` is set to the review date.
4. Maintainers merge only when every handle in `reviewedBy` belongs to someone who approved that pull request. Nobody reviews an entry they wrote.

When reviewing, check:

- **Spelling:** correct according to the Chuon Nath dictionary or NCKL, and passes `npm test`.
- **Naturalness:** would a Cambodian professional in this field actually say it?
- **No needless transliteration:** a real Khmer term is used where one exists.
- **Disambiguation:** if the English word has several meanings, the context is explicit.
- **Style:** follows [section 10](#10-writing-natural-khmer).

### Disagreements

Discuss in the pull request or issue first.

- When two translations are both in real use, put the one backed by NCKL or the dominant industry standard in `preferredKhmer`. List the other in `alternativeKhmer` with an explanation in `usageNotes`.
- When they belong to different contexts (for example a short UI label versus formal documentation), keep both with separate `context` values or a disambiguation entry instead of forcing one winner.
- For spelling and formal terminology, NCKL publications and the Chuon Nath dictionary decide.
- If discussion stalls, maintainers make the final call and record the reason in `usageNotes`.

### Issue labels

| Label | Meaning |
| :--- | :--- |
| `triage` | New; a maintainer hasn't looked at it yet |
| `terminology` | Proposes a new term or a change to an existing one |
| `review-request` | Draft entries ready for a reviewer |
| `reviewer-application` | Someone asking to join the reviewer roster |
| `bug` | Problem with the validator, scripts, or MCP server |

---

## 9. Becoming a reviewer

Reviewers are listed in [`data/reviewers.json`](data/reviewers.json). Only handles on this roster may appear in `provenance.reviewedBy`.

1. Open a [Reviewer Application issue](.github/ISSUE_TEMPLATE/reviewer_application.md) with the domains you know and a short background.
2. A maintainer adds you in a pull request:

   ```json
   {
     "handle": "your-github-username",
     "name": "Optional display name",
     "level": "community",
     "domains": ["software", "finance"],
     "joined": "2026-09-28"
   }
   ```

Levels:

- **`community`**: proficient Khmer speakers who work with the domain. Two of them can move an entry to `community-reviewed`.
- **`expert`**: native linguists, professional translators, or domain specialists. Needed for `expert-reviewed` and `verified`, and only in the domains listed. Maintainers ask for evidence of experience (published translations, a professional role, or academic work) before adding someone at this level.

---

## 10. Writing natural Khmer

A starting point for style. Reviewers are welcome to improve it.

- **Match the register to the context.** App and website UI use plain, polite, everyday Khmer. Formal documents such as contracts, bank notices and government forms can use more formal vocabulary. Note the intended register in `context` or `usageNotes` when it matters.
- **Don't carry over English sentence structure.** Rebuild the sentence the way a Khmer writer would. The most common symptom is ត្រូវបាន for every English passive:
  - Awkward: ឯកសារត្រូវបានរក្សាទុកដោយប្រព័ន្ធ។
  - Natural: ប្រព័ន្ធបានរក្សាទុកឯកសារ។
- **Keep UI labels short.** Buttons and menu items are usually one verb or a short noun phrase, such as ចូល (log in), លុប (delete) or បញ្ជាក់ (confirm). Put longer wording in the example sentences, not the label.
- **Translate rather than transliterate.** Use the Khmer term when one is in real use. Keep an English loanword only when Cambodian professionals actually use it, and say so in `usageNotes`.
- **Stay consistent.** Once a text uses a `preferredKhmer` term, keep using it instead of switching between synonyms.
