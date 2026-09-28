# Data Model Specification

This document details the schema, fields, and constraints for all data models stored within the **Khmer AI Language Reference** repository.

---

## 1. Overview of Data Collections

The repository organizes linguistic assets into three primary directories under `data/`:

| Collection Path | Purpose | Schema File |
| :--- | :--- | :--- |
| `data/terminology/<domain>/` | Curated technical, business, and domain terms | [`schemas/term.schema.json`](../schemas/term.schema.json) |
| `data/examples/` | Reviewed parallel bilingual sentence pairs | [`schemas/translation.schema.json`](../schemas/translation.schema.json) |
| `data/disambiguation/` | Context mappings for polysemous words (e.g., *Account*) | Sub-schema in `disambiguation.json` |

---

## 2. Terminology Model (`term.schema.json`)

Each term entry is an individual JSON object representing a specific source term and its verified Khmer translation within a domain context.

### Fields Specification

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique slug across the entire dataset (e.g. `software-ui-save-button`). |
| `term` | `string` | **Yes** | The source language term, keyword, or phrase (e.g. `save`). |
| `sourceLanguage` | `string` | **Yes** | ISO 639-1 code of source language (defaults to `en`). |
| `preferredKhmer` | `string` | **Yes** | The canonical, highly-recommended Khmer translation in Unicode NFC. |
| `alternativeKhmer` | `array<string>` | No | Valid alternative translations acceptable under specific circumstances. |
| `domain` | `string` | **Yes** | Category: `software`, `technology`, `business`, `finance`, `ecommerce`, `general`. |
| `context` | `string` | No | Practical application context (e.g. `action button`, `network status`). |
| `partOfSpeech` | `string` | No | `noun`, `verb`, `adjective`, `adverb`, `phrase`, `abbreviation`. |
| `examples` | `array<object>` | No | Contextual sentence pairs illustrating correct natural usage. |
| `usageNotes` | `string` | No | Clear guidance for AI models regarding nuances and common traps. |
| `status` | `string` | **Yes** | One of: `draft`, `community-reviewed`, `expert-reviewed`, `verified`, `deprecated`. |
| `provenance` | `object` | **Yes** | Audit trail of where the term originated and who reviewed it. |

### Provenance Object Specification
* `sourceType`: Enum (`national-council`, `official-glossary`, `academic`, `community`, `translator`).
* `reference`: Citation text, publication title, or URL.
* `reviewedBy`: Array of GitHub usernames or reviewer credentials.
* `lastUpdated`: ISO date (`YYYY-MM-DD`).

---

## 3. Translation Example Model (`translation.schema.json`)

Used to provide few-shot examples or benchmark test pairs.

### Fields Specification
* `id` (`string`, required): Unique identifier.
* `source` (`string`, required): Original sentence in source language.
* `sourceLanguage` (`string`, required): ISO 639-1 code (`en`).
* `targetLanguage` (`string`, required): ISO 639-1 code (`km`).
* `translation` (`string`, required): High-quality, human-reviewed Khmer translation in NFC.
* `domain` (`string`, required): Domain category.
* `context` (`string`, optional): Scenario or setting.
* `keyTerms` (`array<string>`, optional): Array of specific terminology IDs demonstrated in the sentence.
* `status` (`string`, required): Quality tier.

---

## 4. Disambiguation Model

Maps high-frequency words that have multiple completely distinct translations depending on the domain:

```json
{
  "term": "Account",
  "disambiguations": [
    {
      "context": "Banking / Finance",
      "khmer": "គណនី",
      "example": "Bank account -> គណនីធនាគារ"
    },
    {
      "context": "Accounting / Ledger",
      "khmer": "គណនេយ្យ",
      "example": "Accountant -> គណនេយ្យករ"
    },
    {
      "context": "Software / User profile",
      "khmer": "គណនីអ្នកប្រើប្រាស់",
      "example": "Create account -> បង្កើតគណនី"
    }
  ]
}
```
