---
slug: tree-of-thoughts
title: "Tree of Thoughts (ToT)"
topic: advanced-reasoning
kind: technique
summary: "Explore multiple reasoning paths with deliberate search, heuristic evaluation, and backtracking."
tags: [tree-of-thoughts, tot, search, reasoning]
related: [graph-of-thoughts, step-back-prompting, chain-of-thought-prompting]
---
> **In one line:** Tree of Thoughts enables deliberate problem-solving by searching over multiple branching thought paths with heuristic evaluation and backtracking.

## The idea

Standard Chain-of-Thought reasoning is linear: the model generates step 1, step 2, step 3 without ever pausing to evaluate whether step 2 was a dead end. Once an error occurs in a linear chain, the model cannot backtrack; it is forced to continue forward from its flawed premise.

In 2023, Shunyu Yao and colleagues (*Tree of Thoughts: Deliberate Problem Solving with Large Language Models*, arXiv:2305.10601) introduced **Tree of Thoughts (ToT)**. Inspired by human trial-and-error and classic computer science search algorithms, ToT frames reasoning as a search over a tree of possible intermediate thoughts:
1. **Thought Decomposition**: Breaks the problem into discrete intermediate thought units (e.g. proposing a single arithmetic operation or a single paragraph outline).
2. **Thought Generation**: Generates 3–5 candidate next thoughts at each branching point.
3. **State Evaluation**: A heuristic evaluator prompt rates the viability of each candidate branch (e.g. `Sure`, `Likely`, `Impossible`).
4. **Search Algorithm**: Systematic search algorithms (Breadth-First Search or Depth-First Search with backtracking) explore the most promising branches, pruning dead ends.

| Benchmark | Input-Output Direct | Chain-of-Thought (CoT) | Tree of Thoughts (ToT) |
|---|---|---|---|
| **Game of 24** (Arithmetic puzzle) | 7.3% | 4.0% | **74.0%** (Massive jump) |
| **Creative Writing** (100-word story coherent plans) | 6.2 | 6.9 | **8.1** (Human rating) |
| **Mini Crosswords** | 15.6% word success | 40.6% | **78.0%** word success |

## See it

```python
# Conceptual Tree of Thoughts breadth-first search
def tot_solve(state: str, depth: int = 3, width: int = 2) -> str:
    frontier = [state]
    for _ in range(depth):
        candidates = []
        for path in frontier:
            # 1. Generate branching candidate steps
            steps = call_llm(f"Propose 3 next steps:
{path}").split("
")
            candidates.extend([f"{path}
Step: {s}" for s in steps])
            
        # 2. Score feasibility and prune (beam search)
        scored = [(float(call_llm(f"Score (0-1):
{c}")), c) for c in candidates]
        scored.sort(reverse=True, key=lambda x: x[0])
        frontier = [c for _, c in scored[:width]]
        
    return frontier[0]
```

## Go deeper

The Game of 24 experiment illustrated the transformative power of ToT: given four numbers (e.g. `4, 7, 8, 8`), find an arithmetic combination using basic operators that equals 24. GPT-4 with CoT solved only **4%** of puzzles because it committed early to flawed combinations. With Tree of Thoughts, GPT-4 achieved **74%** accuracy by proposing operations, evaluating remaining possibilities, and backtracking when a path became impossible.

> **Tip:** You can approximate ToT within a single prompt by instructing the model: "Propose three candidate plans, critique the flaws of each, and pursue only the most viable one."

## Watch out

- Applying ToT to simple conversational or extraction tasks where linear prompting already succeeds.
- Ignoring token costs; expanding branches exponentially across multiple depths multiplies API expenses.

## Remember

- Tree of Thoughts models reasoning as search over branching intermediate thoughts.
- Combines candidate thought generation, state evaluation heuristics, and backtracking.
- Solved 74% on the Game of 24 benchmark compared to only 4% for linear Chain-of-Thought.
