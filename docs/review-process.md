# Community Review & Verification Process

Maintaining high linguistic quality is the core responsibility of the **Khmer AI Language Reference** project. This guide outlines how terms progress from initial community submission to verified reference data.

---

## 1. Quality Lifecycle

```text
  [PR Opened]
       │
       ▼
   ┌────────┐
   │  draft │
   └───┬────┘
       │ Reviewed by 2+ community members
       ▼
┌────────────────────┐
│ community-reviewed │
└──────┬─────────────┘
       │ Reviewed by Native Linguist / Domain Expert
       ▼
┌─────────────────┐
│ expert-reviewed │
└──────┬──────────┘
       │ Verified against NCKL / Broad Industry Adoption
       ▼
 ┌───────────┐
 │  verified │
 └───────────┘
```

---

## 2. Review Criteria Checklist

When reviewing any proposed term or translation Pull Request, reviewers verify:

1. **Orthographic Accuracy**:
   - Correct spelling according to the Chuon Nath dictionary or National Council of Khmer Language (NCKL).
   - Valid Unicode Normalization (NFC).
   - No broken/orphaned Coeng (`\u17D2`).
2. **Contextual Naturalness**:
   - Does this sound natural to a Cambodian native speaker working in this field?
   - Is it overly literal or rigid?
3. **Clarity vs. Jargon**:
   - Does it provide an accessible Khmer translation while avoiding unnecessary phonetic transliteration?
4. **Disambiguation**:
   - If the English word has multiple meanings (e.g. *Post*, *Share*, *Feed*, *Bill*), are separate entries or explicit contexts provided?
5. **No AI Hallucinations**:
   - The submission must not be an unverified dump from a machine translation API.

---

## 3. Disputed Terms Resolution

When two different translations are widely used:
- If both are grammatically and culturally sound, document one under `preferredKhmer` (based on NCKL or dominant industry standard) and list the other under `alternativeKhmer` with explanatory `usageNotes`.
- If one translation belongs to software UI (e.g. shorter button label) and another to formal documentation, split them by specifying distinct `context` attributes.
