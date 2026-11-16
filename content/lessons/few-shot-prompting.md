---
slug: few-shot-prompting
title: "Zero-Shot vs Few-Shot Prompting"
topic: personas-examples
kind: technique
summary: "Harness in-context learning with zero-, one-, and few-shot exemplars to establish complex formatting and patterns."
tags: [few-shot, zero-shot, in-context-learning, examples]
related: [crafting-effective-examples, demonstration-pitfalls, anatomy-of-a-prompt]
---
> **In one line:** Few-shot prompting demonstrates task execution through input-output exemplar pairs directly within the prompt context.

## The idea

Large language models are meta-learners capable of **in-context learning** (Brown et al., 2020). By observing a handful of demonstration pairs inside the active prompt, the model deduces the underlying task mapping, syntax rules, and style conventions without weight updates.

Prompting strategies are categorized by the number of demonstration pairs provided:
- **Zero-Shot**: You provide instructions only, with no completed examples. Highly effective on modern instruction-tuned models for standard tasks (summarization, translation, general Q&A).
- **One-Shot**: You provide exactly one completed demonstration before presenting the active input. Useful for establishing basic schema structure.
- **Few-Shot**: You provide a small bank (typically 3–5) of curated exemplar pairs. Ideal for idiosyncratic business classifications, esoteric output syntax, edge-case handling, and nuanced reasoning patterns.

| Strategy | Exemplars Provided | Best Suited For |
|---|---|---|
| **Zero-Shot** | 0 examples | Common tasks, creative writing, broad Q&A |
| **One-Shot** | 1 example | Establishing visual layout or output key names |
| **Few-Shot** | 3–5 examples | Custom classification categories, domain-specific formatting, subtle distinctions |

## See it

```text
Classify the customer inquiry into one of: [BILLING, TECHNICAL, ACCOUNT, SPAM].

Example 1:
Inquiry: "I was charged twice for my subscription this month."
Category: BILLING

Example 2:
Inquiry: "The dashboard crashes with error code 500 on Chrome."
Category: TECHNICAL

Example 3:
Inquiry: "Hot crypto deals! Click here for 100x gains!"
Category: SPAM

Inquiry: "Can you help me update the email address on my profile?"
Category:
```

## Go deeper

Few-shot examples function as high-priority constraints. When instructions and examples conflict, models frequently emulate the pattern demonstrated in the examples rather than following the abstract instruction. This makes few-shot demonstrations exceptionally reliable for locking down non-standard output formats or subtle classification boundaries.

> **Tip:** When zero-shot prompting fails to follow a nuanced formatting rule, adding 2–3 high-quality examples is almost always more effective than writing three more paragraphs of explanation.

In enterprise few-shot registries, exemplar diversity matters significantly more than volume. Three carefully selected examples illustrating canonical success, an ambiguous boundary case, and an explicit negative edge case provide stronger induction signals than twenty near-identical examples. Always benchmark few-shot exemplars across temperature zero to verify deterministic stability.

## Watch out

- Using few-shot examples that all share identical length or surface patterns, causing the model to copy superficial quirks.
- Providing too many examples (15+), which consumes excessive context window space with diminishing returns.

## Remember

- Zero-shot relies entirely on pre-trained instruction following; few-shot teaches by demonstration.
- Supplying 3–5 curated examples reliably locks down custom formats, edge cases, and categories.
- Models often weigh concrete examples more heavily than abstract instructional prose.
