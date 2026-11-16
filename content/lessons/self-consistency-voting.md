---
slug: self-consistency-voting
title: "Self-Consistency Voting"
topic: reasoning-verification
kind: technique
summary: "Sample multiple diverse reasoning paths and take a majority vote across extracted final answers."
tags: [self-consistency, sampling, voting, ensembling]
related: [chain-of-thought-prompting, zero-shot-cot, verification-hierarchy]
---
> **In one line:** Self-consistency samples multiple reasoning paths at non-zero temperature and selects the most frequent final answer by majority vote.

## The idea

Standard Chain-of-Thought uses greedy decoding (temperature 0), producing a single linear reasoning trajectory. If the model makes a single arithmetic or logical slip in step 2, the entire subsequent chain derails.

Introduced by Xuezhi Wang and colleagues (2022, *Self-Consistency Improves Chain of Thought Reasoning in Language Models*, arXiv:2203.11171), **Self-Consistency** replaces greedy decoding with an ensembling strategy:
1. **Sample Diverse Paths**: Generate $N$ independent reasoning paths (typically 5 to 15) using a moderate temperature (e.g. 0.7).
2. **Extract Final Answers**: Parse the final numerical or categorical answer from each reasoning trajectory.
3. **Majority Vote**: Count the frequencies of the extracted answers and select the majority consensus.

The core insight is that while there are many incorrect ways to stumble through a complex problem, the correct reasoning path is statistically the most consistent attractor state across diverse samples.

| Benchmark | Standard Greedy CoT | Self-Consistency Voting | Absolute Gain |
|---|---|---|---|
| **GSM8K** (Math word problems) | ~56.5% | **74.4%** | **+17.9%** |
| **SVAMP** (Math reasoning) | ~68.9% | **79.9%** | **+11.0%** |
| **StrategyQA** (Multi-step reasoning) | ~68.3% | **74.7%** | **+6.4%** |
| **ARC-Challenge** (Science reasoning) | ~73.8% | **77.7%** | **+3.9%** |

## See it

```python
from collections import Counter

# Implementing Self-Consistency voting over sampled reasoning paths
def self_consistency_solve(question: str, num_samples: int = 5) -> str:
    prompt = f"Question: {question}
Answer: Let's think step by step."
    answers = []
    
    for _ in range(num_samples):
        # Sample at temperature > 0 to generate diverse paths
        trace = call_llm(prompt, temperature=0.7)
        # Extract the final answer token
        ans = extract_final_answer(trace)
        answers.append(ans)
    
    # Majority vote
    most_common, count = Counter(answers).most_common(1)[0]
    return most_common
```

## Go deeper

Self-consistency requires two essential conditions:
1. **Diverse Sampling**: The temperature must be above 0 (typically 0.5–0.7). At temperature 0, all sampled paths are identical, defeating the purpose of ensembling.
2. **Vote on Extracted Answers, Not Full Text**: You cannot take a majority vote on the full prose generation, because phrasing varies across runs. You must vote strictly on the extracted normalized answer (e.g. `"42"`, `"Option B"`, `"True"`).

> **Tip:** In latency-sensitive systems, run samples in parallel using async calls or multi-completion API parameters.

## Watch out

- Voting on the full prose text instead of the extracted, normalized final answer.
- Setting temperature to 0, which generates identical paths and wastes tokens without adding diversity.

## Remember

- Self-consistency samples multiple reasoning paths and selects the answer by majority vote.
- Wang et al. proved dramatic benchmark gains (+17.9% on GSM8K) using self-consistency.
- Requires non-zero temperature to produce path diversity and voting strictly on extracted answers.
