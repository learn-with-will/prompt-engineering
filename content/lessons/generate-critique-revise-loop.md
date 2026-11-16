---
slug: generate-critique-revise-loop
title: "The Generate-Critique-Revise Loop"
topic: reasoning-verification
kind: technique
summary: "Iteratively improve draft quality with the Self-Refine loop: generate initial draft, critique against rules, and revise."
tags: [self-refine, critique, revision, loops]
related: [reflection-and-fact-checking, verification-hierarchy, self-consistency-voting]
---
> **In one line:** The generate-critique-revise loop refines outputs through iterative cycles of drafting, self-critique against criteria, and targeted revision.

## The idea

First-pass generation rarely produces a model's best possible work. When an LLM generates a response in a single forward pass, it must attend to formatting, tone, factual accuracy, and domain depth simultaneously.

The **Self-Refine** paradigm (Madaan et al., 2023, arXiv:2303.17651) decouples creation from editing through a structured three-step loop:
1. **Generate**: The model produces an initial candidate draft based on the primary prompt.
2. **Critique**: A critic prompt evaluates the candidate draft against explicit quality rubrics (e.g. clarity, conciseness, security vulnerabilities, compliance boundaries).
3. **Revise**: The model receives the original prompt, the draft, and the critique feedback, producing an improved version that explicitly addresses the critique.

Research by Madaan et al. demonstrated an average **~20% absolute improvement** across seven diverse tasks (including code optimization, mathematical reasoning, and dialogue response generation) using self-refine loops.

| Pipeline Phase | Focus Dimension | Example Prompt Directive |
|---|---|---|
| **Phase 1: Draft** | Creative ideation and core content | "Draft a 300-word explanation of OAuth2 grant types." |
| **Phase 2: Critique** | Rigorous evaluation against rubric | "Review draft for technical accuracy and security caveats. List 3 flaws." |
| **Phase 3: Revise** | Targeted rewriting | "Rewrite the draft to fix the 3 flaws identified in the critique." |

## See it

```python
# Implementing an automated Generate-Critique-Revise loop
def self_refine_loop(task_instruction: str, rubric: str) -> str:
    # 1. Generate initial draft
    draft = call_llm(f"Instruction: {task_instruction}
Draft:")
    
    # 2. Generate structured critique
    critique_prompt = f"""Evaluate this draft against the Rubric.
Draft:
{draft}

Rubric:
{rubric}

List specific deficiencies and concrete improvements required:"""
    critique = call_llm(critique_prompt)
    
    # 3. Produce revised output
    revision_prompt = f"""Original Instruction: {task_instruction}
Previous Draft: {draft}
Critique Feedback: {critique}

Provide an improved, final version resolving all critique points:"""
    return call_llm(revision_prompt)
```

## Go deeper

To maximize critique quality, use a different model or prompt persona for the critique phase. A model prompting itself with `"Is this good?"` often suffers from self-confirmation bias. Asking a dedicated *adversarial reviewer persona* to identify three specific flaws yields far more actionable critique feedback.

> **Tip:** Bound the loop to 1–2 iterations; empirical research shows that gains plateau sharply after two revision cycles.

## Watch out

- Allowing unconstrained critique loops that loop indefinitely without improving output quality.
- Using vague rubrics like "make it better" that fail to give the critic actionable criteria.

## Remember

- The generate-critique-revise loop decouples initial creation from rigorous editing.
- Madaan et al. demonstrated a ~20% average performance improvement across diverse tasks.
- Cap revisions at 1–2 iterations and employ explicit quality rubrics during the critique phase.
