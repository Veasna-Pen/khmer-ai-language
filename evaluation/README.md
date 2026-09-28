# Khmer AI Translation Quality Benchmark

This directory contains the evaluation suite to measure whether AI and LLM translation models use natural, verified Khmer terminology and avoid common transliteration errors.

---

## Benchmark Criteria

Each benchmark test case in `benchmark.json` tests three key dimensions:

1. **Required Terminology Adherence**:
   Did the model use the preferred Khmer term (e.g. `ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហាន` for *two-factor authentication*) instead of literal or awkward phrasing?
2. **Pitfall Avoidance**:
   Did the model avoid common AI transliteration errors (e.g. `ប៉ាសវើត`, `ដេតាបាស`) or false contexts (e.g. translating e-commerce *checkout* as hotel checkout `ចាកចេញពីសណ្ឋាគារ`)?
3. **Orthography & Normalization**:
   Is the generated output properly normalized in Unicode Form C (NFC) with valid Khmer punctuation?

---

## Running Benchmark Evaluation

```bash
# Run local benchmark verification
node evaluation/evaluate.js
```
