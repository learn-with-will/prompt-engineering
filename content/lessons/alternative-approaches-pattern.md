---
slug: alternative-approaches-pattern
title: "The Alternative Approaches Pattern"
topic: formats-refinement
kind: pattern
summary: "Prompt models to present multiple distinct architectural approaches with trade-off matrices before choosing."
tags: [alternative-approaches, prompt-patterns, decision-making, tradeoffs]
related: [question-refinement-pattern, diagnosing-prompt-failures, prompt-patterns-overview]
---
> **In one line:** The Alternative Approaches pattern prompts the model to generate multiple contrasting solutions and compare their trade-offs.

## The idea

When presented with an engineering problem, language models exhibit a bias toward proposing the most common or standard solution found in their training data. For example, asking `"How do I store user session data?"` will almost always return a Redis tutorial, regardless of whether a simple encrypted cookie or a database table would be more appropriate for the user's scale.

The **Alternative Approaches Pattern** (White et al., 2023) breaks this single-path bias. It instructs the model to:
1. Propose 2–4 fundamentally distinct solutions to the problem.
2. Outline the pros, cons, and implementation complexity of each approach.
3. Compare them in a comparative trade-off matrix.
4. Recommend the best approach based on specific operating constraints (e.g. startup speed vs enterprise scale).

| Approach Option | Core Mechanism | Primary Trade-Off |
|---|---|---|
| **Option A (Minimalist)** | In-memory / Cookie sessions | Zero infrastructure; limited server-side invalidation |
| **Option B (Standard)** | Redis cache cluster | Sub-millisecond latency; extra server infrastructure to manage |
| **Option C (Enterprise)** | Distributed JWT with JWKS rotation | Stateless scalability; token revocation complexity |

## See it

```python
# Implementing Alternative Approaches pattern for architectural decisions
def build_alternatives_prompt(problem_statement: str, constraints: str) -> str:
    return f"""Whenever I propose an engineering task, provide at least three
fundamentally different technical approaches to solve it.

For each approach, detail:
1. High-level architecture and key libraries
2. Key advantage (Pros)
3. Primary drawback or failure mode (Cons)

Conclude with a Markdown comparison table comparing them across:
| Approach | Development Speed | Maintenance Cost | Scalability Ceiling |

Problem Statement: {problem_statement}
Operating Constraints: {constraints}
"""
```

## Go deeper

This pattern prevents costly architectural tunnel vision. Engineering teams frequently adopt over-engineered distributed systems because conversational AI assistants recommended them as the 'standard' answer. Forcing the model to present minimalist, intermediate, and advanced alternatives ensures that teams select solutions tailored to their actual constraints.

> **Tip:** Require the model to contrast at least one non-standard or unconventional approach alongside the mainstream industry standard.

When deploying alternative-approach prompts in automated pipelines, require the model to explicitly rank solutions across fixed dimensions—such as implementation complexity, memory footprint, maintenance burden, and cloud execution costs. Providing a standardized evaluation matrix forces the model to move beyond superficial surface differences and evaluate genuine engineering trade-offs.

## Watch out

- Presenting cosmetic variations of the same approach rather than fundamentally distinct paradigms.
- Forgetting to provide your specific budget, team size, and scale constraints.

## Remember

- LLMs default to the most frequent mainstream solution unless instructed to explore alternatives.
- The Alternative Approaches pattern forces the generation of 2–4 contrasting engineering strategies.
- Compare options in an objective trade-off matrix evaluated against team scale and cost constraints.
