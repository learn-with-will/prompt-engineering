---
slug: automatic-prompt-engineer
title: "Automatic Prompt Engineer (APE)"
topic: multimodal-meta
kind: technique
summary: "Automate prompt optimization by generating candidate instructions, scoring them on test sets, and selecting top performers."
tags: [ape, prompt-optimization, automated-tuning, research]
related: [meta-prompting-principles, prompt-overfitting-and-splits, automating-prompt-workflows]
---
> **In one line:** Automatic Prompt Engineer (APE) treats instruction generation as a search problem: generating candidates, scoring on test data, and selecting the best.

## The idea

Finding the exact prompt phrasing that maximizes benchmark accuracy on a difficult dataset is traditionally a tedious trial-and-error manual process.

In 2022, Yongchao Zhou and colleagues (*Large Language Models Are Human-Level Prompt Engineers*, arXiv:2211.01910) introduced **APE (Automatic Prompt Engineer)**. APE formalizes prompt engineering as an automated search-and-optimization algorithm:
1. **Instruction Proposal**: An LLM is given input-output demonstration pairs and prompted to propose candidate natural language instructions that explain the transformation.
2. **Scoring / Evaluation**: Each candidate instruction is executed across a validation dataset. Programmatic scoring functions compute accuracy, formatting compliance, or similarity scores.
3. **Selection & Resampling**: The highest-scoring instructions are selected. The model generates semantic variations and refinements of the top candidates to explore the solution space further.

On 24 diverse NLP benchmark tasks, APE-generated prompts **matched or outperformed human-written instructions on 19 out of 24 tasks**.

| Optimization Step | Process | Metric / Objective |
|---|---|---|
| **1. Propose** | LLM generates candidate instructions from input/output pairs | Generate 10–20 diverse instruction candidates |
| **2. Evaluate** | Execute candidates across validation dataset | Calculate accuracy score (e.g. 84% vs 91%) |
| **3. Select & Refine** | Mutate and refine top 3 candidate prompts | Select instruction that maximizes accuracy |

## See it

```python
# Conceptual implementation of the APE (Automatic Prompt Engineer) loop
def ape_optimize_prompt(train_data: list[dict], candidates_count: int = 5) -> str:
    # 1. Propose candidate instructions based on demonstrations
    demos = "
".join(f"Input: {d['x']} -> Output: {d['y']}" for d in train_data[:3])
    prompt = f"Given these examples, generate {candidates_count} instructions:
{demos}"
    candidates = call_llm(prompt).strip().split("
")
    
    # 2. Score each candidate across validation samples
    best_prompt, best_score = "", -1.0
    val_set = train_data[3:15]
    for cand in candidates:
        correct = sum(
            1 for s in val_set
            if call_llm(f"{cand}
Input: {s['x']}
Output:").strip() == s['y'].strip()
        )
        score = correct / len(val_set)
        if score > best_score:
            best_score, best_prompt = score, cand
            
    return best_prompt
```

## Go deeper

Modern prompt optimization frameworks (such as Stanford's DSPy or automated prompt tuning harnesses) extend APE principles into programmatic compilers. By treating prompts as optimizable parameters within a software graph, DSPy automatically tunes prompt wording, few-shot demonstration selection, and reasoning steps to maximize user-defined metric scores.

> **Tip:** Always evaluate candidate prompts on a held-out test set to ensure the optimization process did not overfit to the training samples.

## Watch out

- Running APE optimization loops on tiny datasets (<10 samples), which leads to extreme overfitting.
- Optimizing solely for accuracy while ignoring prompt token length, resulting in bloated, slow prompts.

## Remember

- APE automates prompt discovery through candidate generation, scoring, and selection.
- Zhou et al. demonstrated that APE matched or beat human-written instructions on 19 of 24 tasks.
- Modern frameworks like DSPy build on APE to compile and optimize prompts programmatically.
