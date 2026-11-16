---
slug: positive-instructions
title: "Positive Instructions"
topic: prompt-craft
kind: technique
summary: "Tell models what to do instead of what not to do to avoid the negative instruction trap."
tags: [positive-prompting, guardrails, clarity, technique]
related: [clarity-and-directness, delimiters-and-structure, enforcing-constraints]
---
> **In one line:** Frame prompt instructions positively by specifying what the model should do rather than listing things it must avoid.

## The idea

Human communication frequently relies on negative instructions: *"Don't mention the price,"* *"Don't write more than two paragraphs,"* or *"Avoid technical jargon."* When applied to language models, negative phrasing often leads to degraded performance or outright failure.

This occurs because of next-token prediction and attention dynamics:
1. **Semantic Priming**: To process the instruction `"Do not think about an elephant,"` the model must attend to the token `"elephant"`. Mentioning the prohibited concept elevates its attention weight, inadvertently making related tokens more likely to be generated.
2. **Missing Action Pathway**: Telling a model what *not* to do does not inform it what it *should* do instead. A prompt stating `"Don't write like a salesperson"` leaves hundreds of possible writing styles open, whereas `"Write in the objective, neutral tone of a scientific researcher"` provides a clear target distribution.

| Negative Instruction (Fragile) | Why It Struggles | Positive Instruction (Robust) |
|---|---|---|
| `"Do not include apologies."` | Primes words like 'sorry' and 'apologize' | `"Maintain a confident, solutions-focused tone. State the resolution directly."` |
| `"Don't make it too long."` | 'Too long' is undefined and negative | `"Limit your explanation to exactly three sentences."` |
| `"Do not use markdown."` | Mentions markdown syntax tokens | `"Output plain, unformatted ASCII text only."` |

## See it

```python
# Before and After: Converting negative constraints to positive directives
# Before (Negative framing):
bad_prompt = """Review this software proposal.
Do not use technical jargon.
Do not be overly critical.
Do not write a long essay."""

# After (Positive framing):
good_prompt = """Review this software proposal.
Write for a non-technical executive audience using plain business language.
Highlight two operational strengths and one practical risk.
Deliver your review in two concise paragraphs under 150 words total."""
```

## Go deeper

When negative constraints are unavoidable (such as legal compliance disclaimers or strict refusal boundaries), pair the prohibition with an explicit fallback action: *"If the user asks for financial investment advice, do not offer stock picks. Instead, state: 'I cannot provide investment recommendations; please consult a certified financial advisor.'"*

> **Tip:** Scan your prompts for words like "don't", "avoid", "never", and "stop". Replace each with a direct statement of the desired behavior, tone, or format.

## Watch out

- Writing laundry lists of 10+ negative prohibitions without providing a single positive model of acceptable output.
- Assuming the model understands implicit alternatives when given a negative constraint.

## Remember

- Negative constraints prime the prohibited tokens, often causing the model to emit the forbidden content.
- State what the model should do rather than cataloging what it should avoid.
- When a prohibition is necessary, provide an explicit fallback response or replacement behavior.
