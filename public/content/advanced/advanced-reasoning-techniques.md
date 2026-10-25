---
id: lesson-17
slug: advanced-reasoning-techniques
title: "Tree, Graph, and Step-Back Reasoning"
level: advanced
order: 17
duration: 28
tags:
  - tree-of-thoughts
  - graph-of-thoughts
  - step-back-prompting
  - generated-knowledge
  - auto-cot
summary: "Reasoning techniques beyond a single chain: Tree of Thoughts (explore, evaluate, backtrack), Graph of Thoughts (combine and refine ideas), step-back prompting, generated knowledge, and Auto-CoT, with honest guidance on cost and on when reasoning models make them unnecessary."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain **Tree of Thoughts (ToT)** and its four components, and implement a small version in code.
- Explain how **Graph of Thoughts (GoT)** extends ToT with merging and refinement.
- Apply **step-back prompting** and **generated knowledge prompting**, and know their risks.
- Describe how **Auto-CoT** builds chain-of-thought examples automatically.
- Judge when these techniques are **worth their cost**, especially with reasoning models.

# Why It Matters

Chain-of-thought follows one line of reasoning from start to finish. If an early step goes wrong,
everything after it is wrong too, and there's no going back. Many real problems (planning,
puzzles, strategy, diagnosis) reward **exploring alternatives** and **abandoning dead ends**. The
techniques in this lesson add that exploration. They're also expensive and partly absorbed into
modern reasoning models, so knowing when *not* to use them matters as much as knowing how.

# Concept Explanation

### Tree of Thoughts: explore, evaluate, backtrack

Shunyu Yao and colleagues (2023) introduced **Tree of Thoughts**. It treats coherent chunks of
reasoning ("thoughts") as steps in a search: the model proposes several possible next thoughts,
evaluates how promising each is, and explores the best ones, **looking ahead or backtracking** when
needed. On the Game of 24 (combine four numbers with arithmetic to make 24), GPT-4 with
chain-of-thought solved **4%** of tasks; with ToT, **74%**.

*Prompt Engineering in Action* breaks ToT into four components:

1. **Thought decomposition**: decide what one "thought" is (an equation line, a plan step, a
   paragraph).
2. **Thought generator**: produce several candidate next thoughts.
3. **State evaluator**: judge which partial solutions look promising ("sure / maybe / impossible",
   or a score).
4. **Search algorithm**: decide which branches to expand, for example breadth-first or depth-first
   search.

### ToT in code

Real ToT is an **algorithm around the model**: code calls the model many times to propose and
evaluate. This runnable sketch is a small beam search using the `call_llm` placeholder:

```python
def propose(problem: str, path: list[str], k: int = 3) -> list[str]:
    steps = "\n".join(path) or "(none yet)"
    reply = call_llm(
        f"Problem: {problem}\nSteps so far:\n{steps}\n"
        f"Propose {k} different possible next steps, one per line, no numbering."
    )
    return [line.strip() for line in reply.splitlines() if line.strip()][:k]

def score(problem: str, path: list[str]) -> float:
    reply = call_llm(
        f"Problem: {problem}\nPartial solution:\n" + "\n".join(path) +
        "\nRate how likely this partial solution leads to a correct answer, "
        "from 0 to 10. Reply with the number only."
    )
    try:
        return float(reply.strip())
    except ValueError:
        return 0.0

def tree_of_thoughts(problem: str, depth: int = 3, beam: int = 2) -> list[str]:
    frontier: list[list[str]] = [[]]
    for _ in range(depth):
        candidates = [path + [step] for path in frontier for step in propose(problem, path)]
        candidates.sort(key=lambda p: score(problem, p), reverse=True)
        frontier = candidates[:beam]          # keep the best branches, prune the rest
    return frontier[0]
```

Count the calls: with depth 3, beam 2, and 3 proposals per path, that's dozens of model calls for one
problem. ToT buys accuracy on search-like problems with a lot of compute.

### The single-prompt approximation

A popular shortcut, shown in *Prompt Engineering in Action*, simulates ToT inside one prompt by
imagining several experts who each propose a step, critique each other, drop flawed lines, and
converge:

```text
Imagine three experts solving this problem. Each writes one step of their
reasoning and shares it. Then each critiques the others' steps. Any expert whose
reasoning has a flaw says so and either fixes it or drops out. Repeat until they
agree, then state the final answer and the confidence of each remaining expert.

Problem: <problem>
```

This can encourage the model to consider alternatives, but it's an **approximation**: one model
writes all the "experts" in one pass, with no real search or independent evaluation.

### Graph of Thoughts: combine and refine

Maciej Besta and colleagues (2023) generalized ToT to **Graph of Thoughts**: thoughts are vertices
in an arbitrary graph, and edges are dependencies. That allows operations a tree can't express:
**merging** several thoughts into a better one, **refining** a thought through feedback loops, and
**aggregating** partial results. On a sorting task, GoT improved quality by **62%** over ToT while
cutting cost by more than **31%**.

GoT shines when sub-results must be combined: sort chunks, then merge; draft sections, then
reconcile; gather evidence from several sources, then synthesize. In practice it looks a lot like a
well-designed chain (Lesson 15) with merge and refine steps.

A lesson from *Prompt Engineering in Action* applies to all of these: models don't inherently
understand technique names. Writing "use Graph of Thoughts" does little; you have to **spell out
the structure**, such as which hypotheses to generate, how they relate, and how to combine them, or
implement it in code.

### Step-back prompting: ask the bigger question first

Huaixiu Steven Zheng and colleagues (2023) introduced **step-back prompting**: before answering a
detailed question, ask the model a more **abstract** question about the underlying principle, then
use that to answer. With PaLM-2L it improved MMLU Physics by 7%, Chemistry by 11%, TimeQA by 27%,
and MuSiQue by 7%.

```text
Step back: What general principle or concept determines the answer to the
question below? State it in one or two sentences.
Then: Using that principle, answer the question.

Question: If you double the pressure of an ideal gas at constant temperature,
what happens to its volume?
```

It's cheap (one prompt or two short calls) and useful wherever specific details distract from a
governing rule.

### Generated knowledge prompting

Jiacheng Liu and colleagues (2021) proposed **generated knowledge prompting**: first ask the model to
generate relevant facts about the question, then answer with those facts included. It improved
commonsense reasoning benchmarks without any external knowledge base.

```text
Step 1: List four relevant facts about how microwaves heat food and interact with metal.
Step 2: Using those facts, answer: Is it safe to microwave food in a metal container?
```

Treat it with care: the "knowledge" is generated by the same model, so it can be **wrong** and then
lend false confidence to the answer. *Prompt Engineering in Action* demonstrates the technique on a
medical scenario, which is exactly where invented "knowledge" is dangerous. For factual or
high-stakes domains, prefer **retrieved** knowledge from trusted sources (Lesson 18).

### Auto-CoT: examples without hand-writing them

Few-shot CoT needs worked examples, and writing them is slow. Zhuosheng Zhang and colleagues (2022)
proposed **Auto-CoT**: cluster a pool of questions, pick a **diverse** representative from each
cluster, and let the model generate a reasoning chain for each with zero-shot CoT ("Let's think step
by step"). Those generated chains become the demonstrations. Because generated chains contain
mistakes, the authors found **diversity** is what keeps errors from dominating. On ten benchmarks
with GPT-3, Auto-CoT matched or exceeded manually written CoT examples. If you use the idea, **review
the generated examples** before shipping them.

### Cost, benefit, and reasoning models

These techniques were developed largely before models reasoned internally. Today:

- **Reasoning models already explore** to some extent in their own thinking, so single-prompt
  simulations add less than they used to.
- **Code-driven search (ToT/GoT) still adds something** a single call can't: independent
  evaluations, real backtracking, explicit merging, and a record of every branch.
- **Cost scales with branches.** Measure accuracy per dollar on your own task before adopting a
  search technique; a single call with higher effort is often the cheaper win.

# Key Terminology

- **Tree of Thoughts (ToT)**: search over intermediate reasoning steps with generation, evaluation,
  and backtracking.
- **State evaluator**: the step that judges how promising a partial solution is.
- **Beam search**: keeping only the top few branches at each level of the search.
- **Graph of Thoughts (GoT)**: reasoning as a graph, allowing merging, refinement, and aggregation.
- **Step-back prompting**: asking a higher-level principle question before the specific one.
- **Generated knowledge prompting**: generating relevant facts first, then answering with them.
- **Auto-CoT**: automatically constructing diverse chain-of-thought demonstrations.

# Options and Trade-offs

| Technique | Best for | Cost | Main risk |
| --- | --- | --- | --- |
| Single chain-of-thought | Most multi-step problems | Low | No recovery from early errors |
| Step-back prompting | Questions governed by a principle | Low | Wrong principle misleads |
| Generated knowledge | Commonsense questions | Low to medium | Invented "facts" add false confidence |
| Single-prompt ToT ("experts") | Encouraging alternatives cheaply | Medium (long output) | Not a real search |
| Code-driven ToT | Puzzles, planning, search problems | High (many calls) | Cost; evaluator quality |
| Graph of Thoughts | Merge and refine sub-results | High | Complexity |
| Auto-CoT | Building demos at scale | One-time generation | Errors in generated examples |

# Worked Example

You're scheduling a three-day conference: 12 talks, 4 rooms, speaker availability constraints, and
no two related talks at the same time.

**Single chain:** the model builds a schedule left to right and, on day 3, discovers a conflict it
can't fix without undoing day 1. It quietly violates a constraint instead.

**ToT-style approach:**

1. **Decomposition**: one thought = one time slot's assignments.
2. **Generator**: for the next slot, propose three different assignments.
3. **Evaluator**: code checks hard constraints (availability, room capacity) deterministically and
   discards violations; the model scores soft goals (spread related topics across days).
4. **Search**: beam search keeps the best two partial schedules; if both dead-end, backtrack one slot.

Notice the evaluator: wherever a constraint is checkable, **code** evaluates it. The model only
judges what code can't. The result is a valid schedule plus a log of why alternatives were rejected.
For a problem this structured, a constraint solver might be better still, which is a reminder that
an LLM is one tool among several.

# Real World Analogy

A single chain of thought is a hiker who picks a trail at every fork and never turns back.
**Tree of Thoughts** is a hiker who scouts a little way down each fork, judges which looks most
promising, and returns to the junction when a trail dead-ends. **Graph of Thoughts** is a whole
search party: teams explore different trails, then meet at the lodge to merge their maps into one
better route. Scouting costs extra time, which is worth it in the mountains and wasteful on a
straight road.

# Examples

## Example 1 — Basic: step-back

```text
Before answering, state the general rule that applies. Then answer.
Question: A shop raises a $40 item's price by 25%, then offers 20% off the new
price. What's the final price?
```

**Why this works:** stating the rule (successive percentage changes multiply) prevents the common
mistake of adding and subtracting percentages.

## Example 2 — Real-world: explicit graph structure for an investigation

```text
Our sign-ups dropped 30% last week. Generate three independent hypotheses
(H1-H3). For each, list the evidence that would confirm or refute it and what we
can check today. Then note any hypotheses that could combine (for example, H1
and H3 together). Finally, propose an investigation order that tests the
cheapest, most discriminating checks first.
```

**Why this works:** it spells out the graph (hypotheses, evidence, combinations, ordering) instead
of just naming a technique.

## Example 3 — Pitfall: naming the technique instead of structuring it

```text
Use Tree of Thoughts to solve this.
```

**What goes wrong:** the model may write some branches as prose, but there's no real generation,
evaluation, or backtracking, so you pay in length without getting a search. **Fix:** either write
the structure explicitly into the prompt, or implement the search in code with separate proposal and
evaluation calls.

# Common Mistakes

- **Expecting a technique name to do the work** ("use GoT") without specifying the structure.
- **Using expensive search on simple problems** that a single call handles.
- **Letting the model evaluate what code could check** deterministically.
- **Trusting generated knowledge** in factual or high-stakes domains.
- **Shipping auto-generated examples** without reviewing them for errors.

# Best Practices

- Start with **CoT or step-back**; escalate to search only when your tests show it helps.
- In ToT, make the **evaluator as deterministic as possible**, and cap depth and beam width.
- Use **GoT-style merge and refine steps** when sub-results must be combined.
- Prefer **retrieved** over **generated** knowledge for facts.
- Measure **accuracy per cost** against a single call with higher reasoning effort.

# Summary

- **Tree of Thoughts** adds exploration: generate candidate thoughts, evaluate states, search, and
  backtrack (Game of 24: 4% to 74%).
- **Graph of Thoughts** adds merging, refinement, and aggregation (sorting quality +62% over ToT,
  cost down more than 31%).
- **Step-back prompting** asks for the governing principle first; **generated knowledge** asks for
  facts first but can invent them.
- **Auto-CoT** builds diverse CoT demonstrations automatically; review them.
- These techniques cost more and partly overlap with **reasoning models**; spell out structure, and
  measure before adopting.

# Flash Cards

Q: What are the four components of Tree of Thoughts?
A: Thought decomposition, a thought generator, a state evaluator, and a search algorithm.

Q: What result did ToT report on the Game of 24?
A: GPT-4 with chain-of-thought solved 4% of tasks; with Tree of Thoughts, 74%.

Q: What can Graph of Thoughts do that a tree can't?
A: Merge several thoughts, refine thoughts through feedback loops, and aggregate partial results.

Q: What is step-back prompting?
A: Asking a higher-level question about the governing principle first, then using it to answer the specific question.

Q: What is the main risk of generated knowledge prompting?
A: The generated "facts" come from the same model and can be wrong, lending false confidence; prefer retrieved knowledge for factual tasks.

Q: Why does writing "use Tree of Thoughts" in a prompt rarely work?
A: Models don't execute technique names; you must spell out the structure or implement the search in code.

# Exercises

### Easy
Pick three word problems involving percentages or rates. Solve each with a plain prompt and with a
step-back prompt. Note where stating the principle changed the answer.

### Medium
Run the single-prompt "three experts" approximation on a planning problem (for example, organizing
a group trip with conflicting preferences). Then run a plain chain-of-thought prompt. Compare the
alternatives considered and the final quality.

### Challenging
Implement the `tree_of_thoughts` sketch with `call_llm` connected on a small puzzle with a checkable
answer (such as Game of 24 instances). Replace the model-based `score` with a deterministic check
where possible. Compare success rate and number of calls against a single chain-of-thought call.

# Further Reading

- Yao et al., *Tree of Thoughts: Deliberate Problem Solving with Large Language Models* (2023):
  <https://arxiv.org/abs/2305.10601>
- Besta et al., *Graph of Thoughts: Solving Elaborate Problems with Large Language Models* (2023):
  <https://arxiv.org/abs/2308.09687>
- Zheng et al., *Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models* (2023):
  <https://arxiv.org/abs/2310.06117>
- Liu et al., *Generated Knowledge Prompting for Commonsense Reasoning* (2021):
  <https://arxiv.org/abs/2110.08387>
- Zhang et al., *Automatic Chain of Thought Prompting in Large Language Models* (2022):
  <https://arxiv.org/abs/2210.03493>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 5.4-5.6.
