---
slug: defining-evaluation-criteria
title: "Defining Evaluation Criteria"
topic: evals-security-production
kind: technique
summary: "Establish quantifiable, objective evaluation criteria (S.M.A.R.T.) to replace qualitative 'looks good' impressions."
tags: [evals, evaluation, criteria, metrics]
related: [building-eval-test-sets, llm-as-a-judge, prompt-regression-testing]
---
> **In one line:** Move beyond 'looks good to me' by defining quantifiable, testable criteria across correctness, completeness, and formatting.

## The idea

The most common failure in prompt engineering is evaluating prompts through informal manual inspection: an engineer pastes three queries into ChatGPT, scans the output, thinks *"Looks great!"*, and deploys to production. Inevitably, customer edge cases cause catastrophic failures that the engineer never tested.

Systematic prompt evaluation requires defining explicit, measurable **evaluation criteria** (grounded in Anthropic's testing guidelines):
- **Specific**: Define exactly what constitutes success (e.g. *"Must extract all 4 required fields: name, date, amount, currency"*).
- **Measurable**: Replace subjective impressions with quantitative metrics (e.g. Exact Match, F1 Score, JSON schema conformity, latency under 1,500ms).
- **Achievable & Relevant**: Ground criteria in real business constraints rather than impossible perfectionism.
- **Time-bound & Comparable**: Benchmark scores must be tracked over time to detect performance drift across model releases.

| Evaluation Dimension | What It Measures | Concrete Metric |
|---|---|---|
| **Syntactic Conformity** | Is the structure valid? | JSON valid rate (target: 100%) |
| **Factual Accuracy** | Are claims true and unhallucinated? | Precision / Recall against ground-truth |
| **Instruction Adherence** | Were constraints followed? | Negative constraint violation rate (<1%) |
| **Efficiency & Cost** | How practical is it in production? | P95 latency (ms) and token consumption |

## See it

```python
# Programmatic evaluation metric checking specific, measurable criteria
def score_extraction_accuracy(actual_output: dict, ground_truth: dict) -> dict:
    metrics = {
        "schema_valid": True,
        "exact_key_match": set(actual_output.keys()) == set(ground_truth.keys()),
        "value_precision": 0.0
    }
    
    matches = sum(1 for k in ground_truth if actual_output.get(k) == ground_truth[k])
    metrics["value_precision"] = matches / len(ground_truth) if ground_truth else 1.0
    metrics["passed"] = metrics["exact_key_match"] and metrics["value_precision"] >= 0.95
    return metrics
```

## Go deeper

Anthropic's testing framework emphasizes defining success criteria *before* drafting the prompt. When you define criteria upfront, you know exactly what few-shot examples and constraints are necessary. Furthermore, objective criteria enable automated testing harnesses to grade thousands of outputs without human intervention.

> **Tip:** Break evaluation into binary pass/fail assertions (e.g. `contains_forbidden_word == False`) rather than subjective 1–10 numerical ratings.


In enterprise production environments, continuously benchmark and measure the operational trade-offs between response latency and architectural strictness. Complex nested structures require additional attention tokens, whereas concise, clearly bounded schemas minimize token overhead, reduce API billing expenses, and prevent downstream parsing exceptions across distributed microservices. Always document expected types and nullability rules explicitly.

## Watch out

- Using qualitative rubrics like "must sound professional and smart" that automated tests cannot evaluate.
- Evaluating only the happy path while ignoring error conditions and missing input fields.

## Remember

- Replace informal manual inspection with specific, measurable evaluation criteria.
- Evaluate across syntax, factual accuracy, instruction adherence, and operational latency.
- Define pass/fail criteria upfront to guide prompt drafting and enable automated benchmarking.
