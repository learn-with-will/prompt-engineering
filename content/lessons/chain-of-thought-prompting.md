---
slug: chain-of-thought-prompting
title: "Chain-of-Thought Reasoning"
topic: reasoning-verification
kind: technique
summary: "Elicit multi-step deduction on math, logic, and planning tasks by prompting models to show their work."
tags: [chain-of-thought, reasoning, cot, multi-step]
related: [zero-shot-cot, reasoning-tags-and-models, self-consistency-voting]
---
> **In one line:** Chain-of-Thought (CoT) prompting encourages models to generate intermediate reasoning steps before arriving at a final answer.

## The idea

On complex multi-step reasoning problems (math word problems, logic puzzles, multi-hop question answering), prompting an LLM for an immediate answer often leads to calculation errors or flawed deductions. The model must jump across multiple reasoning leaps in a single token prediction.

In their seminal 2022 paper (*Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*, arXiv:2201.11903), Jason Wei and colleagues demonstrated that prompting the model to break down its reasoning into sequential intermediate steps dramatically boosts accuracy.

By emitting intermediate tokens:
1. **Working Memory Expansion**: Each generated step is appended to the context window, giving the model additional token runway to calculate sub-results before committing to the final answer.
2. **Error Isolation**: Complex problems are decomposed into simpler logical dependencies, allowing self-attention to focus on one discrete inference step at a time.
3. **Emergent Capability**: The paper demonstrated that CoT reasoning emerges primarily in large models (~100B+ parameters), yielding state-of-the-art results on benchmarks like GSM8K and MultiArith.

| Prompting Style | Reasoning Process | Benchmark Performance (GSM8K) |
|---|---|---|
| **Standard Direct Prompting** | Input directly predicts final answer | Low (~18% on earlier foundation models) |
| **Few-Shot CoT** | Input generates step-by-step reasoning trace, then answer | SOTA (~55-80%+ depending on model scale) |
| **Native Reasoning Models** | Model uses internal hidden thinking tokens | Peak accuracy on competition math |

## See it

```text
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls.
Each can has 3 tennis balls. How many tennis balls does he have now?

A: Roger started with 5 balls.
2 cans of 3 tennis balls each is 2 * 3 = 6 tennis balls.
5 + 6 = 11.
The answer is 11.

Q: A bakery had 23 loaves of bread at 7 AM. They baked 45 more loaves.
They sold 58 loaves by noon. In the afternoon, they baked 12 more and sold 15.
How many loaves are left?

A: Let's trace this step by step:
- Morning start: 23 loaves
- Baked morning: 23 + 45 = 68 loaves
- Sold by noon: 68 - 58 = 10 loaves
- Baked afternoon: 10 + 12 = 22 loaves
- Sold afternoon: 22 - 15 = 7 loaves
The answer is 7.
```

## Go deeper

In the original Wei et al. paper, few-shot CoT provided eight demonstrations with step-by-step explanations. When writing demonstrations, ensure your intermediate reasoning traces are clean and concise. If the demonstration contains calculation errors, the model will faithfully replicate the flawed reasoning patterns across subsequent problems.

> **Tip:** Clearly demarcate the final answer with a delimiter like "Therefore, the final answer is X" so automated scrapers can extract the result easily.

## Watch out

- Applying verbose CoT to simple factual retrieval tasks where no multi-step reasoning is required.
- Over-prescribing reasoning steps when using modern models that already possess adaptive thinking capabilities.

## Remember

- Chain-of-Thought prompts models to emit intermediate deduction steps before concluding.
- Generating tokens step-by-step provides active working memory for mathematical and logical sub-problems.
- Demarcate the final answer clearly to facilitate downstream parsing and grading.
