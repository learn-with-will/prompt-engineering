---
slug: prompt-regression-testing
title: "Prompt Regression Testing"
topic: evals-security-production
kind: tool
summary: "Run automated regression suites on every prompt modification in CI/CD to prevent quality degradation."
tags: [regression-testing, cicd, devops, automation]
related: [defining-evaluation-criteria, building-eval-test-sets, llm-as-a-judge]
---
> **In one line:** Prompt regression testing executes automated evaluation suites in CI/CD to verify that prompt edits do not break existing behavior.

## The idea

In standard software engineering, nobody deploys a backend modification without running the unit test suite to catch regressions. Yet in many generative AI projects, engineers tweak prompt wording in production without running any regression checks. A tweak intended to make the tone warmer often breaks downstream JSON parsing or increases hallucination rates on technical queries.

**Prompt Regression Testing** integrates evaluation suites directly into the software development lifecycle:
1. **Version-Controlled Benchmarks**: Golden test datasets reside in the repository alongside prompt templates.
2. **Automated CI Trigger**: Whenever a pull request touches a file in `prompts/`, GitHub Actions or GitLab CI executes the prompt across the benchmark test suite.
3. **Threshold Gate**: The pipeline compares accuracy, schema compliance, and token consumption against the `main` branch baseline. If accuracy drops by more than 1% or latency spikes by >20%, the pull request is blocked.

| Pipeline Check | What It Validates | Pass Condition |
|---|---|---|
| **Syntax & Schema** | Valid JSON / Pydantic parsing | 100% valid (zero regressions) |
| **Accuracy Score** | Performance against ground-truth | $\ge$ baseline accuracy score |
| **Safety Probes** | Zero-tolerance on prompt injection / leaks | 100% block rate |
| **Cost & Latency** | Token budget and execution speed | Within +10% of baseline budget |

## See it

```python
# Automated regression test runner integrated into pytest / CI
def test_prompt_regression():
    baseline_accuracy = 0.94  # Production benchmark threshold
    test_cases = load_golden_eval_dataset("tests/fixtures/eval_set.jsonl")
    
    passed_count = 0
    for case in test_cases:
        prompt = render_prompt("prompts/customer_triage.yaml", query=case["input"])
        output = call_llm(prompt)
        if evaluate_case(output, case["expected"]):
            passed_count += 1
            
    current_accuracy = passed_count / len(test_cases)
    assert current_accuracy >= baseline_accuracy, (
        f"REGRESSION DETECTED: Accuracy dropped to {current_accuracy:.1%} (Threshold: {baseline_accuracy:.1%})"
    )
```

## Go deeper

Because LLM generation is probabilistic, regression tests can experience slight run-to-run variance (jitter). To prevent false-positive CI failures, set temperature to 0 for regression suites, or evaluate across a sufficiently large sample size (100+ cases) where individual token fluctuations average out statistically.

> **Tip:** Tag regression tests by severity: run fast smoke tests (10 cases) on every commit, and run comprehensive regression suites (200 cases) on release candidate merges.

## Watch out

- Updating the baseline threshold downwards to force a failing pull request to pass.
- Allowing non-deterministic temperature settings to cause flaky, intermittent CI build failures.

## Remember

- Run automated prompt regression suites in CI/CD whenever prompt templates are modified.
- Block deployments if accuracy, schema conformity, or latency violates baseline thresholds.
- Maintain version-controlled golden datasets that expand with every bug discovered in production.
