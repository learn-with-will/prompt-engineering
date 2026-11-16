---
slug: outline-expansion-pattern
title: "The Outline Expansion Pattern"
topic: prompt-patterns
kind: pattern
summary: "Produce high-depth long-form documents by generating a structural outline before expanding individual sections."
tags: [outline-expansion, prompt-patterns, long-form, generation]
related: [recipe-pattern, prompt-patterns-overview, sequential-prompt-chaining]
---
> **In one line:** The Outline Expansion pattern generates a comprehensive structural outline first, then expands each section systematically.

## The idea

Generating long-form, comprehensive content (such as a 15-page whitepaper, a technical architecture document, or a complete course module) in a single prompt execution almost always fails. Language models have fixed output token limits (typically 4,096 to 8,192 tokens per response) and experience attention degradation when asked to produce massive documents in one pass. The result is rushed, superficial summaries.

The **Outline Expansion Pattern** breaks long-form authoring into a controlled, multi-stage expansion process:
1. **Stage 1 (Outline Generation)**: The model produces a detailed, multi-level hierarchical outline of the entire document (sections, sub-headings, key points to cover).
2. **Stage 2 (Human Alignment)**: The user inspects the outline, reordering sections, pruning unwanted topics, and adding missing requirements.
3. **Stage 3 (Sectional Expansion)**: The model expands one section or subsection at a time, referencing the global outline for narrative context while using its entire output token budget on deep, comprehensive prose.

| Generation Approach | Depth per Section | Coherence Across Document | Token Budget Utilization |
|---|---|---|---|
| **Single-Shot Monolith** | Extremely shallow (1-2 paragraphs) | Drifts significantly after page 3 | Exhausts max output tokens abruptly |
| **Outline Expansion** | Exhaustive depth (full sections) | Maintained via persistent outline context | Full output capacity per section |

## See it

```python
# Stage 1: Generate the master outline
prompt_stage_1 = """Create a detailed 6-part outline for a whitepaper on:
'Zero Trust Architecture in Kubernetes Clusters'.
For each section, provide 3 specific subsection bullet points.
Output the outline only."""

# Stage 2: Expand a single section in depth using the master outline
prompt_stage_2 = f"""You are authoring Section 3 of our Kubernetes Zero Trust Whitepaper.

Master Document Outline:
{master_outline}

Focus Section:
### Section 3: Implementing Mutual TLS with Istio Service Mesh
- Sub-bullet A: Sidecar injection and mTLS auto-encryption
- Sub-bullet B: PeerAuthentication policy enforcement
- Sub-bullet C: Certificate rotation and SPIFFE identity validation

Task:
Write the complete text for Section 3.
Provide working YAML manifests for each policy mentioned.
Target length: 500-700 words. Proceed directly to the prose.
"""
```

## Go deeper

By maintaining the master outline in the context of every sectional expansion prompt, the model maintains perfect conceptual continuity. It knows what was covered in Section 2 and what will be discussed in Section 4, eliminating repetitive introductory remarks and preventing narrative contradictions.

> **Tip:** Instruct the model to maintain consistent terminology and formatting styles across each expanded section by passing a style guide snippet alongside the master outline.

## Watch out

- Attempting to expand three major sections simultaneously in a single turn.
- Modifying the master outline mid-way through writing without updating previously written sections.

## Remember

- Single-pass generation produces shallow text due to fixed output token limits.
- The Outline Expansion pattern separates architectural outlining from deep sectional drafting.
- Pass the global outline into each expansion prompt to guarantee document-wide continuity.
