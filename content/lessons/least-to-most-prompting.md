---
slug: least-to-most-prompting
title: "Least-to-Most Prompting"
topic: chaining-context
kind: technique
summary: "Tackle complex reasoning challenges by decomposing problems into sub-problems and solving from simplest to hardest."
tags: [least-to-most, reasoning, decomposition, research]
related: [sequential-prompt-chaining, cognitive-verifier-pattern, tree-of-thoughts]
---
> **In one line:** Least-to-most prompting decomposes a complex problem into sub-problems and solves them sequentially from simplest to hardest.

## The idea

Standard Chain-of-Thought prompting often breaks down when faced with problems requiring multi-layer compositional generalization—tasks that are significantly harder than the examples shown in the prompt.

Introduced by Denny Zhou and colleagues (2022, *Least-to-Most Prompting Enables Complex Reasoning in Large Language Models*, arXiv:2205.10625), **Least-to-Most Prompting** introduces a two-phase strategy:
1. **Decomposition**: Decompose the original complex problem into an ordered list of progressively simpler sub-problems.
2. **Sub-problem Resolution**: Solve the sub-problems sequentially, starting with the simplest. Crucially, the solution to each sub-problem is appended into the prompt context when solving the next, more difficult sub-problem.

On the SCAN benchmark (evaluating compositional generalization), standard Chain-of-Thought achieved only **16% accuracy**, while Least-to-Most prompting achieved **99%+ accuracy** with identical base models.

| Benchmark | Standard CoT Accuracy | Least-to-Most Accuracy | Why the Difference |
|---|---|---|---|
| **SCAN** (Compositional generalization) | 16.2% | **99.7%** | Solves linguistic primitives before composing long actions |
| **DROP** (Reading comprehension) | 54.4% | **73.2%** | Computes intermediate arithmetic counts before answering |
| **Math Word Problems** | 65.1% | **79.5%** | Resolves dependent equations in causal order |

## See it

```python
# Implementing Least-to-Most sequential problem solving
def least_to_most_solver(complex_question: str) -> str:
    # Phase 1: Decompose into sub-questions
    decomp_prompt = f"""Decompose this problem into an ordered list of simpler sub-questions
needed to find the final answer. Order from simplest to hardest.

Problem: {complex_question}
Sub-questions:"""
    sub_questions = call_llm(decomp_prompt).strip().split("
")
    
    # Phase 2: Solve sequentially, carrying context forward
    running_context = f"Original Problem: {complex_question}
"
    for sq in sub_questions:
        solve_prompt = f"""{running_context}
Current sub-question to solve: {sq}
Solve this sub-question concisely:"""
        answer = call_llm(solve_prompt)
        running_context += f"Sub-Q: {sq}
Answer: {answer}
"
        
    return answer
```

## Go deeper

Least-to-Most prompting mirrors human pedagogical mastery: learn basic arithmetic before algebra, and learn algebra before calculus. By carrying previously solved sub-answers forward in context, the model never has to solve a compound problem in a vacuum; every subsequent step is supported by verified prior answers.

> **Tip:** Use Least-to-Most prompting when tasks require multi-hop dependency resolution, such as calculating complex tax obligations or parsing legacy code dependencies.

## Watch out

- Attempting to solve sub-problems in parallel when they possess strict causal dependencies.
- Allowing an error in the first sub-problem to poison every subsequent calculation step.

## Remember

- Least-to-Most decomposes problems and solves them sequentially from simplest to hardest.
- Zhou et al. proved a jump from 16% to 99% accuracy on compositional generalization (SCAN).
- Sub-answers are accumulated in context to serve as verified premises for subsequent harder steps.
