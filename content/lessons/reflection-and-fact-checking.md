---
slug: reflection-and-fact-checking
title: "Reflection and Fact-Checking"
topic: reasoning-verification
kind: pattern
summary: "Extract factual claims into verified lists and test them against grounding source texts."
tags: [reflection, fact-checking, verification, claims]
related: [generate-critique-revise-loop, verification-hierarchy, citation-extraction-and-grounding]
---
> **In one line:** The Fact Check List pattern extracts all atomic claims from a response and validates each against source text.

## The idea

When an LLM produces a multi-paragraph report, factual inaccuracies are often camouflaged within polished, authoritative prose. Human evaluators and automated systems struggle to verify dense narrative blocks.

The **Fact Check List Pattern** (White et al., 2023) breaks narrative prose into discrete, falsifiable claims:
1. **Claim Extraction**: The model (or an extraction prompt) parses the generated text and extracts every factual assertion into an atomic, numbered bullet list.
2. **Evidence Verification**: For each extracted claim, the model must cite the exact verbatim sentence from the source document that supports it.
3. **Status Tagging**: Each claim is tagged as `[VERIFIED]`, `[CONTRADICTED]`, or `[UNGROUNDED_IN_SOURCE]`.
4. **Correction**: Any claim tagged as ungrounded or contradicted is stripped or corrected in the final deliverable.

This pattern shifts verification from evaluating nebulous impressions to inspecting an auditable claim-by-claim checklist.

| Verification Step | Input | Output Representation |
|---|---|---|
| **Raw Narrative** | "Acme Corp grew revenue 25% in Q3 following the Apollo launch in June." | Complex compound sentence |
| **Atomic Claims** | Decomposed assertions | 1. Acme revenue grew 25% in Q3<br>2. Apollo launched in June |
| **Audit Status** | Cross-referenced against 10-Q filing | Claim 1: [VERIFIED (Page 4)]<br>Claim 2: [CONTRADICTED: Launch was May] |

## See it

```python
# Implementing the Fact Check List pattern as an automated audit step
def build_fact_check_prompt(generated_summary: str, source_document: str) -> str:
    return f"""Source Document:
<source>
{source_document}
</source>

Candidate Summary:
<summary>
{generated_summary}
</summary>

Task:
1. Extract all factual assertions made in <summary> into an atomic numbered list.
2. For each assertion, verify whether it is explicitly supported by <source>.
3. Tag each claim with:
   - [SUPPORTED]: Quote the exact supporting sentence from <source>.
   - [UNSUPPORTED]: Explain the discrepancy.

Format:
Claim 1: <assertion>
Status: [SUPPORTED | UNSUPPORTED]
Evidence: <quote or explanation>
"""
```

## Go deeper

Research demonstrates that models are significantly better at auditing claims when presented with atomic statements than when asked to judge full paragraphs. Decomposing text into isolated claims eliminates rhetorical distractions, allowing the attention mechanism to focus entirely on premise-evidence matching.

> **Tip:** In automated ingestion pipelines, reject or flag any summary where the percentage of `[SUPPORTED]` claims falls below 100%.

## Watch out

- Allowing the model to cite its own general knowledge instead of quoting the provided source text.
- Grouping multiple distinct claims into a single compound bullet during extraction.

## Remember

- The Fact Check List pattern extracts atomic factual claims from narrative responses.
- Each claim is verified individually by quoting evidence from the source document.
- Auditable claim checklists transform qualitative inspection into deterministic verification.
