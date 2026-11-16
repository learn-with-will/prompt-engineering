---
slug: graph-of-thoughts
title: "Graph of Thoughts (GoT)"
topic: advanced-reasoning
kind: technique
summary: "Model non-linear reasoning by combining, aggregating, and cycling thoughts in arbitrary directed graphs."
tags: [graph-of-thoughts, got, reasoning, graphs]
related: [tree-of-thoughts, step-back-prompting, reasoning-trade-offs-and-costs]
---
> **In one line:** Graph of Thoughts extends tree search by allowing thoughts to be merged, combined, and iterated in arbitrary graph networks.

## The idea

While Tree of Thoughts allows branching and backtracking, a tree structure cannot model certain fundamental human reasoning processes:
- **Merging**: Combining the best elements of two independent ideas into a superior hybrid solution.
- **Aggregation**: Summarizing intermediate conclusions from multiple disparate paths into a central insight.
- **Feedback Loops**: Iterating on a thought and feeding it back into an earlier reasoning node for continuous refinement.

Introduced by Maciej Besta and colleagues (2023, *Graph of Thoughts: Solving Elaborate Problems with Large Language Models*, arXiv:2308.09687), **Graph of Thoughts (GoT)** models reasoning as an arbitrary Directed Acyclic Graph (DAG) or cyclic network:
- **Vertices (Thoughts)**: Discrete intermediate reasoning steps or solution candidates.
- **Edges (Transformations)**: Operations that generate, combine, aggregate, or refine thoughts.

| Reasoning Framework | Data Structure | Transformations Supported | Cost & Latency |
|---|---|---|---|
| **Chain-of-Thought (CoT)** | Linear Linked List | Sequential generation only | Lowest |
| **Tree of Thoughts (ToT)** | Tree Hierarchy | Branching, backtracking, pruning | Moderate |
| **Graph of Thoughts (GoT)** | Arbitrary Directed Graph | Branching, merging, aggregating, feedback loops | High (highest quality) |

## See it

```python
# Conceptual Graph of Thoughts aggregation and combination pattern
def got_combine_solutions(problem: str) -> str:
    # Node 1 & Node 2: Generate two diverse independent approaches
    sol_a = call_llm(f"Propose Solution A (Performance-focused) for: {problem}")
    sol_b = call_llm(f"Propose Solution B (Cost-focused) for: {problem}")
    
    # Graph Edge: Aggregate and merge the two distinct thought nodes
    merge_prompt = f"""Problem: {problem}

Solution Path A:
{sol_a}

Solution Path B:
{sol_b}

Graph Transformation (Merge):
Identify the core strength of Solution A and combine it with the cost efficiency
of Solution B. Synthesize a unified, hybrid architecture that captures both advantages."""
    
    # Node 3: Synthesized hybrid thought
    return call_llm(merge_prompt)
```

## Go deeper

In benchmark sorting and document synthesis evaluations, Besta et al. demonstrated that Graph of Thoughts improved solution quality by **62% over Tree of Thoughts** while cutting execution costs by **over 31%**. By merging intermediate paths rather than exploring duplicate redundant tree branches, GoT reduces the total volume of exploratory tokens required to reach an optimal solution.

> **Tip:** Use GoT principles when synthesizing multi-source competitive intelligence or merging conflicting technical proposals.

## Watch out

- Implementing complex graph engines for trivial tasks that require only single-pass prompting.
- Allowing graph loops without iteration caps, which can cause runaway recursive token generation.

## Remember

- Graph of Thoughts models reasoning as an arbitrary directed network of thought nodes.
- Supports combining, merging, and aggregating disparate reasoning paths.
- Outperformed Tree of Thoughts by 62% in quality on sorting tasks while reducing token overhead by 31%.
