---
slug: reasoning-tags-and-models
title: "Reasoning Tags and Native Models"
topic: reasoning-verification
kind: concept
summary: "Navigate native reasoning models, thinking budgets, and explicit `<thinking>` and `<answer>` tags."
tags: [reasoning-models, thinking-tokens, tags, architecture]
related: [chain-of-thought-prompting, zero-shot-cot, faithfulness-of-explanations]
---
> **In one line:** Modern reasoning systems use dedicated thinking tags or native reasoning tokens to isolate thought process from user-facing answers.

## The idea

As prompt engineering matured, the industry transitioned from simple `"think step by step"` phrases to dedicated structural reasoning architectures. Today, developers encounter two primary implementations:

1. **Prompted Reasoning Tags**: Using explicit XML tags like `<thinking>...</thinking>` and `<answer>...</answer>`. The prompt instructs the model to draft its rough thoughts, mathematical scratches, and edge-case evaluations inside `<thinking>`, and place only polished, customer-facing conclusions inside `<answer>`.
2. **Native Reasoning Models**: Frontier models (such as OpenAI's o-series or models with adaptive extended thinking) generate hidden internal reasoning tokens before emitting their visible response. These models manage thinking budgets programmatically and explore multiple internal branches automatically.

| Approach | Where Reasoning Lives | Developer Visibility | Controllability |
|---|---|---|---|
| **Explicit Tags** (`<thinking>`) | Inside the standard completion | Full visibility in prompt tokens | High (custom rules in prompt) |
| **Native Reasoning Models** | Internal thinking budget tokens | Abstracted summary or hidden | Parameterized (e.g. `reasoning_effort`) |

## See it

```python
# Prompting for structured separation of reasoning from final answer
def build_structured_reasoning_prompt(complex_query: str) -> str:
    return f"""Analyze the financial health of the company from the data provided.

Instructions:
1. First, inside <thinking> tags:
   - Calculate gross margins, operating expenses, and burn rate.
   - Test potential counter-scenarios or risks.
   - Critique your own intermediate calculations.
2. Then, inside <answer> tags:
   - Provide the executive recommendation in 2 concise paragraphs.
   - Do not include raw scratchwork in the answer tags.

Data:
{complex_query}
"""
```

## Go deeper

On native reasoning models, prompt engineering rules shift significantly. Vendor documentation (e.g. Anthropic and OpenAI) explicitly recommends:
- **Soften Prescriptive Language**: Avoid aggressive directives like `"CRITICAL: You MUST think step by step"`.
- **Prefer General Guidance**: Give high-level goals and edge cases to consider; let the model's native reasoning engine determine the optimal calculation path.
- **Do Not Micro-Manage**: Overly prescriptive procedural rules often degrade the reasoning performance of frontier native reasoning models.

> **Tip:** Use XML reasoning tags when you need to programmatically parse and strip the thought process before displaying responses in customer UI.

When integrating reasoning models into enterprise microservices, implement strict budget constraints using `max_thinking_tokens` or `reasoning_effort` parameters. For latency-sensitive consumer features, cap reasoning tokens tightly; for high-stakes offline batch audits, allow full thinking token budgets to maximize accuracy.

## Watch out

- Attempting to force manual Chain-of-Thought on reasoning models that already execute extensive internal thinking.
- Displaying raw unparsed `<thinking>` tokens directly to end users in customer-facing chat interfaces.

## Remember

- Reasoning tags (`<thinking>`, `<answer>`) separate internal scratchwork from final deliverables.
- Native reasoning models generate internal thinking tokens controlled via effort parameters.
- Provide general objectives rather than micromanaged steps when prompting native reasoning models.
