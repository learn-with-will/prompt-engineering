---
slug: step-back-prompting
title: "Step-Back Prompting"
topic: advanced-reasoning
kind: technique
summary: "Abstract away from specific details to retrieve high-level principles before solving complex domain tasks."
tags: [step-back-prompting, abstraction, reasoning, research]
related: [tree-of-thoughts, generated-knowledge-prompting, chain-of-thought-prompting]
---
> **In one line:** Step-back prompting asks the model to identify the high-level principle behind a question before solving the specific instance.

## The idea

When presented with highly specific, detail-heavy questions (in physics, chemistry, coding, or history), models frequently get lost in idiosyncratic variables and make reasoning errors. The model dives into complex calculations without grounding itself in the fundamental laws governing the problem.

Introduced by Huaixiu Steven Zheng and colleagues at Google DeepMind (2023, *Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models*, arXiv:2310.06117), **Step-Back Prompting** introduces a two-stage abstraction workflow:
1. **Step-Back Question**: The model is prompted to ask a higher-level, more abstract question about the underlying principles, concepts, or formulas governing the scenario.
2. **Grounded Reasoning**: The model answers the abstract principle question, and then uses that verified foundational principle to solve the original detailed problem.

| Task Domain | Original Specific Query | Abstract Step-Back Question | Benchmark Gain (PaLM-2L) |
|---|---|---|---|
| **Physics** (MMLU) | "If ideal gas volume triples at constant T, what happens to P?" | "What fundamental gas law relates pressure and volume at constant temperature?" | **+7% absolute** |
| **Chemistry** (MMLU) | Specific reaction stoichiometry | "What chemical reaction mechanism applies to this class of compounds?" | **+11% absolute** |
| **TimeQA** (Temporal reasoning) | "Did Estelle win an award before publishing book X?" | "What is the complete historical timeline of Estelle's career milestones?" | **+27% absolute** |

## See it

```python
# Implementing Step-Back Prompting as a two-stage pipeline
def step_back_solve(specific_question: str) -> str:
    # Stage 1: Generate and answer the abstract step-back question
    step_back_prompt = f"""You are an expert problem solver.
Take a step back from the specific details of this question.
What is the general physical principle, law, or high-level concept behind it?

Specific Question: {specific_question}
High-Level Principle:"""
    principle = call_llm(step_back_prompt)
    
    # Stage 2: Solve the specific question grounded in the principle
    final_prompt = f"""Governing Principle:
{principle}

Task:
Using the governing principle above as your foundation, solve the specific problem:
{specific_question}
Answer:"""
    return call_llm(final_prompt)
```

## Go deeper

Step-back prompting works because high-level principles (e.g. Newton's laws, conservation of energy, Big-O complexity definitions) appear with massive frequency in pre-training data and are encoded in weights with high fidelity. Grounding the generation in a well-understood principle creates a strong semantic scaffold that prevents the model from hallucinating intermediate reasoning steps.

> **Tip:** You can execute step-back prompting in a single prompt: "First state the governing equation or general principle, then apply it step-by-step to the specific numbers."

## Watch out

- Applying step-back prompting to simple recall questions where abstraction adds unnecessary overhead.
- Allowing the model to generate a high-level principle that is too broad to be applicable to the specific case.

## Remember

- Step-back prompting abstracts away from specifics to identify governing principles first.
- Zheng et al. demonstrated massive accuracy jumps (+27% on TimeQA, +11% on MMLU Chemistry).
- Grounding specific calculations in verified high-level principles eliminates intermediate logic slips.
