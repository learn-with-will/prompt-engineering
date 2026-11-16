---
slug: temperature-and-top-p
title: "Temperature and Top-P Sampling"
topic: apis-structured-outputs
kind: api
summary: "Understand temperature, top-p, and top-k mechanics, and navigate the shifting API parameter landscape."
tags: [sampling, temperature, top-p, hyperparameters]
related: [stop-sequences-and-limits, building-a-model-client, native-structured-outputs]
---
> **In one line:** Temperature and top-p shape randomness in next-token selection, but frontier reasoning models increasingly deprecate custom sampling parameters.

## The idea

When an LLM evaluates tokens during generation, its final layer outputs raw numerical scores called logits. Hyperparameters dictate how these logits are transformed into probabilities before sampling:
- **Temperature**: Divides logits before applying softmax. At $T=0$ (greedy decoding), the model deterministically picks the highest probability token every time. As $T 	o 1.0+$, the probability distribution flattens, increasing output variety and creativity at the cost of coherence.
- **Top-P (Nucleus Sampling)**: Dynamically restricts token choices to the smallest cumulative probability set exceeding threshold $p$ (e.g. $p=0.9$). Unlike fixed vocabulary cutoffs, top-p expands the candidate pool when many tokens are plausible and narrows it when one token is overwhelmingly likely.
- **Top-K**: Truncates candidates to strictly the $k$ most probable tokens.

Both OpenAI and Anthropic recommend adjusting *either* temperature *or* top-p, never both simultaneously.

| Parameter | Mechanics | Recommended Setting |
|---|---|---|
| **Temperature = 0.0** | Greedy decoding; deterministic top-1 choice | Extraction, code analysis, factual QA |
| **Temperature = 0.7** | Balanced probabilistic sampling | Creative drafting, brainstorming, synthetic data |
| **Top-P = 0.95** | Nucleus threshold truncating the long tail | Replaces temperature for open-ended writing |

## See it

```python
# Model call illustrating temperature selection by task type
def call_with_temperature(prompt: str, task_type: str) -> str:
    # Deterministic tasks demand 0.0; exploratory tasks benefit from 0.7
    temp_map = {
        "extraction": 0.0,
        "classification": 0.0,
        "summarization": 0.2,
        "creative_ideation": 0.7
    }
    selected_temp = temp_map.get(task_type, 0.0)
    
    return client.chat.completions.create(
        model="gpt-4o",
        temperature=selected_temp,
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content
```

## Go deeper

Crucially, the API landscape around sampling parameters is shifting rapidly. On Anthropic API version `2026-10-21`, passing custom values for `temperature`, `top_p`, or `top_k` returns a **400 error on every model**; calls must use default parameters ($T=1.0$). Similarly, OpenAI reasoning models (o1/o3) ignore or restrict custom temperatures. Control consistency through few-shot examples and structural constraints rather than relying on sampling knobs.

> **Watch out:** Relying on temperature=0 does not guarantee 100% bitwise determinism across GPU clusters due to non-deterministic floating-point batching operations.

## Watch out

- Tuning both temperature and top-p simultaneously, which makes debugging stochastic behavior impossible.
- Hardcoding custom temperature values that break when upgrading to newer frontier API versions.

## Remember

- Temperature scales probability variance, while top-p bounds cumulative tail probability.
- Change temperature or top-p, not both; use 0.0 for deterministic extraction tasks.
- Frontier reasoning models and modern APIs increasingly enforce default sampling parameters.
