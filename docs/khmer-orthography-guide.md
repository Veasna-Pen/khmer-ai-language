# Khmer Orthography & Unicode Standards for AI Systems

This document establishes the linguistic and technical standards required for all Khmer language data within the **Khmer AI Language Reference** project.

---

## 1. Unicode Architecture for Khmer

Khmer is encoded in Unicode within:
* **Khmer Block**: `U+1780` – `U+17FF`
* **Khmer Symbols**: `U+19E0` – `U+19FF`

### 1.1 Canonical Normalization (NFC)
All Khmer strings in this repository **must** be normalized to **Unicode Normalization Form C (NFC)**.
* **Why**: Decomposed sequences (NFD) can place vowels and diacritics in non-standard orders, causing text search, tokenizers, and LLM embedding models to fail exact matches.
* In Node.js: `str.normalize('NFC')`
* In Python: `unicodedata.normalize('NFC', text)`

---

## 2. Consonant and Subscript (`Coeng`) Structure

In Khmer script, subscript consonants (*Chhoeng* or *Coeng*) represent consonant clusters.

### 2.1 The Coeng Character
* The Coeng marker is `U+17D2` (្).
* A subscript consonant is formed by: `[Base Consonant] + [U+17D2] + [Subscript Consonant]`.
* Example: `ក` (`U+1780`) + `្` (`U+17D2`) + `ខ` (`U+1781`) = `ក្ខ`.

### 2.2 Prohibited Anomalies
- **Orphaned Coeng**: `U+17D2` must never appear at the end of a word or preceding whitespace, punctuation, or non-consonant characters.
- **Double Coeng on Same Consonant**: Avoid improper double subscript stacks unless strictly required by canonical Pali/Sanskrit loanwords.

---

## 3. Spacing Conventions in Khmer

Unlike English or Spanish, traditional Khmer text **does not use spaces between individual words**. Spaces in Khmer serve syntactic and grammatical functions:

### 3.1 Visible Spaces
Visible spaces (`U+0020`) in Khmer are used to:
1. Separate clauses or phrases (equivalent to commas in European languages).
2. Separate numbers from units.
3. Precede and follow punctuation marks (e.g., ` ... ជាមួយគ្នា ។`).

### 3.2 Zero-Width Space (ZWSP - `U+200B`)
- ZWSP is widely used by software word-breakers to denote word boundaries invisibly.
- **Rule for Terminology**: In dictionary terms (`preferredKhmer`), **do not** embed arbitrary ZWSP inside single compound words unless necessary for software wrapping. Clean canonical characters without invisible noise ensure high retrieval precision.

---

## 4. Khmer Punctuation Marks

AI models often generate English punctuation directly within Khmer text. In this project, standardize as follows:

| Punctuation | Unicode | Khmer Name | Standard Usage | Incorrect AI Habit |
| :--- | :--- | :--- | :--- | :--- |
| **។** | `U+17D4` | Khan (ខណ្ឌ) | Full stop / Period at end of normal sentences | Using Latin full stop (`.`) |
| **៕** | `U+17D5` | Bariyoosan (បរិយោសាន) | Terminal mark ending a story, chapter, or document | Using `.` or double `។។` |
| **៖** | `U+17D6` | Camnuc-pi-kuuh (ចំណុចពីរគូស) | Colon used for lists, definitions, or ratios | Using Latin colon (`:`) without space |
| **ៗ** | `U+17D7` | Lekh Too (លេខទោ) | Repetition mark (e.g. ញឹកញាប់ -> ញឹកៗ) | Repeating full word redundantly |
| **៛** | `U+17DB` | Riel Sign (សញ្ញារៀល) | Cambodian Riel currency symbol | Putting `KHR` inside casual prose |

---

## 5. Common AI Translation Pitfalls to Avoid

### 5.1 False Transliteration (សរសេរតាមសូរសព្ទ)
AI models frequently transliterate technical words phonetically instead of using approved Khmer vocabulary:
* ❌ *ឡកអ៊ីន* (Phonetic "log-in") ➔ ✅ **ចូល** (Natural UI verb)
* ❌ *ឌីលេត* (Phonetic "delete") ➔ ✅ **លុប** (Natural verb)
* ❌ *ខន់ហ្វឺម* (Phonetic "confirm") ➔ ✅ **បញ្ជាក់** (Standard tech term)

### 5.2 Pluralization Suffixes
Khmer does not inflect nouns for plurality. AI models often awkwardly append "s":
* ❌ *Users ➔ អ្នកប្រើប្រាស់ទាំងឡាយ/អ្នកប្រើប្រាស់ s*
* ✅ *Users ➔ អ្នកប្រើប្រាស់* (Quantity is inferred from context or numeral quantifiers)

### 5.3 Passive Voice Overuse
English technical texts use passive voice ("The file was saved by the system"). English-to-Khmer LLM translations often force unnatural passive markers (`ត្រូវបាន`):
* ⚠️ *Awkward AI*: ឯកសារត្រូវបានរក្សាទុកដោយប្រព័ន្ធ។
* ✅ *Natural Khmer*: ប្រព័ន្ធបានរក្សាទុកឯកសារ។ / ឯកសារបានរក្សាទុកដោយជោគជ័យ។
