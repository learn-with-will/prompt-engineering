---
slug: zero-shot-cot
title: "Zero-Shot Chain-of-Thought"
topic: reasoning-verification
kind: technique
summary: "Unlock step-by-step reasoning without writing exemplars using 'Let's think step by step'."
tags: [zero-shot-cot, reasoning, heuristics, prompts]
related: [chain-of-thought-prompting, reasoning-tags-and-models, self-consistency-voting]
---
> **In one line:** Appending 'Let's think step by step' triggers sequential reasoning without requiring hand-crafted few-shot exemplars.

## The idea

While Wei et al. established few-shot Chain-of-Thought using curated demonstrations, authoring multiple high-quality exemplars for every task is labor-intensive. In 2022, Takeshi Kojima and colleagues (*Large Language Models are Zero-Shot Reasoners*, arXiv:2205.11916) discovered a surprisingly simple phrase that unlocked reasoning capabilities without any demonstrations at all: **Zero-Shot CoT**.

By simply appending the magic prompt phrase:
`"Let's think step by step."`
to the end of a question, the researchers observed dramatic performance surges across mathematical, symbolic, and logical reasoning benchmarks. On the MultiArith benchmark using InstructGPT (text-davinci-002), accuracy leaped from **17.7% to 78.7%**, and on GSM8K from **10.4% to 40.7%**.

The prompt works because instruction tuning associates phrases like `"step by step"` with structured, analytical, and disciplined reasoning texts in the pre-training corpus.

| Method | Exemplars Needed | MultiArith Benchmark Jump |
|---|---|---|
| **Zero-Shot Baseline** | 0 examples | 17.7% accuracy |
| **Zero-Shot CoT** ("Let's think step by step") | 0 examples | 78.7% accuracy (+61% gain) |
| **Few-Shot CoT** (Wei et al.) | 8 curated examples | ~80%+ accuracy |

## See it

```python
# Implementing standard Two-Step Zero-Shot CoT extraction
def solve_with_zero_shot_cot(question: str) -> str:
    # Step 1: Elicit the reasoning trace
    step1_prompt = f"""Question: {question}
Answer: Let's think step by step."""
    reasoning_trace = call_llm(step1_prompt)
    
    # Step 2: Extract the clean final numerical answer
    step2_prompt = f"""Question: {question}
Reasoning: {reasoning_trace}
Therefore, the final answer (a single number or phrase) is:"""
    final_answer = call_llm(step2_prompt)
    
    return final_answer.strip()
```

## Go deeper

Zero-Shot CoT is often implemented as a **two-step pipeline** in software systems: First, prompt the model to generate the reasoning trace using `"Let's think step by step"`. Second, pass that generated trace into a lightweight follow-up prompt asking `"Therefore, the final concise answer is:"` to extract a clean string for database storage without conversational clutter.

> **Tip:** You can tailor the prompt to specific domains: e.g. "Let's analyze the financial balance sheet step by step" or "Let's trace the network packets sequentially."

## Watch out

- Expecting Zero-Shot CoT to fix factual gaps; if the model lacks the underlying facts, it will just reason logically from false premises.
- Appending the phrase to creative writing or translation tasks where step-by-step breakdown adds unnecessary latency.

## Remember

- 'Let's think step by step' unlocks intermediate reasoning without needing few-shot examples.
- Kojima et al. proved massive benchmark gains (17.7% to 78.7% on MultiArith) from this single phrase.
- Use a two-step prompt pipeline to extract a clean final answer from the reasoning trace.
