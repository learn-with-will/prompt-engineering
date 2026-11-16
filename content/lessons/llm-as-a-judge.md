---
slug: llm-as-a-judge
title: "LLM-as-a-Judge and Evaluator Biases"
topic: evals-security-production
kind: technique
summary: "Use automated model judges to grade qualitative outputs while counteracting position, verbosity, and self-enhancement biases."
tags: [llm-as-a-judge, mt-bench, biases, evaluation]
related: [defining-evaluation-criteria, building-eval-test-sets, prompt-regression-testing]
---
> **In one line:** LLM-as-a-judge automates qualitative grading, but requires strict mitigation against position, verbosity, and self-enhancement biases.

## The idea

For complex qualitative tasks (creative writing, summarization quality, empathetic dialogue), deterministic code assertions (regex, word counts) cannot measure nuanced performance. However, hiring human evaluators to grade thousands of prompt outputs is cost-prohibitive.

Introduced by Lianmin Zheng and colleagues (2023, *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*, arXiv:2306.05685), **LLM-as-a-Judge** employs a strong frontier model (e.g. GPT-4o, Claude 3.7 Sonnet) to evaluate candidate model responses against a detailed scoring rubric. The authors demonstrated that strong model judges achieve **over 80% agreement with human expert panels**, matching human-to-human agreement levels.

However, researchers discovered three severe systemic biases in model judges:
1. **Position Bias**: In pairwise comparisons (Model A vs Model B), judges heavily favor whichever model is presented first in the prompt.
2. **Verbosity Bias**: Judges consistently award higher scores to longer, wordier responses, mistaking length for depth.
3. **Self-Enhancement Bias**: A model judge systematically awards higher scores to its own outputs over competitor model outputs.

| Judge Bias | Manifestation | Mitigation Strategy |
|---|---|---|
| **Position Bias** | Favors Option A over Option B (~60% bias) | **Swap Positions**: Grade twice (A vs B, then B vs A); average scores |
| **Verbosity Bias** | Rates long rambling answers higher than concise ones | Impose strict word limits; penalize fluff explicitly in the rubric |
| **Self-Enhancement** | Model favors its own family outputs | Use an independent judge model family (e.g. Claude grading GPT) |

## See it

```python
# Implementing pairwise evaluation with position-bias swap mitigation
def evaluate_pairwise_unbiased(query: str, response_a: str, response_b: str, rubric: str) -> float:
    judge_prompt_template = """You are an impartial expert evaluator.
Query: {q}
Response 1: {r1}
Response 2: {r2}
Rubric: {rubric}
Compare both responses. Output ONLY: '1' if Response 1 is better, '2' if Response 2 is better, or 'TIE'."""

    # Pass 1: A first, B second
    pass1 = call_llm(judge_prompt_template.format(q=query, r1=response_a, r2=response_b, rubric=rubric))
    # Pass 2: B first, A second (Position Swap)
    pass2 = call_llm(judge_prompt_template.format(q=query, r1=response_b, r2=response_a, rubric=rubric))
    
    # Calculate unbiased consensus
    score_a = (1 if "1" in pass1 else 0) + (1 if "2" in pass2 else 0)
    score_b = (1 if "2" in pass1 else 0) + (1 if "1" in pass2 else 0)
    return 1.0 if score_a > score_b else (0.0 if score_b > score_a else 0.5)
```

## Go deeper

When authoring judge rubrics, use **Reference-Guided Grading**: provide the judge with a human-authored golden answer. Scoring becomes significantly more objective when the judge compares candidate responses against a verified reference rather than evaluating in a vacuum.

> **Tip:** Never let a model judge its own outputs without cross-checking against an independent model family.

## Watch out

- Using a weak, small model tier as a judge; evaluator models must be more capable than the candidate models being judged.
- Omitting position-swapping in pairwise benchmarks, producing skewed evaluation results.

## Remember

- LLM-as-a-judge reaches >80% agreement with human panels on qualitative evaluations.
- Mitigate position bias by evaluating candidate pairs twice with swapped positions.
- Guard against verbosity and self-enhancement biases using reference answers and independent judge models.
