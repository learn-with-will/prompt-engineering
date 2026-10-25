---
id: lesson-12
slug: self-consistency-and-verification
title: "Self-Consistency and Verification"
level: intermediate
order: 12
duration: 26
tags:
  - self-consistency
  - self-critique
  - reflection-pattern
  - fact-check-list
  - verification
summary: "Ways to make answers more reliable: self-consistency voting across several sampled reasoning paths, generate-critique-revise loops, the Reflection and Fact Check List patterns, and a hierarchy of verification methods from code checks to human review."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Implement **self-consistency**: sample several reasoning paths, extract the answers, and vote.
- Use agreement between samples as a **confidence signal**.
- Run a **generate → critique → revise** loop and know its limits.
- Apply the **Reflection** and **Fact Check List** patterns, and avoid treating them as proof.
- Choose the strongest **verification method** available for a task.

# Why It Matters

A single model response is one sample from many possible answers, and some of those are wrong.
Reliability techniques trade extra calls or extra steps for a better chance of being right, and,
just as importantly, for a signal of when *not* to trust an answer. In any application where
mistakes are costly, verification is what separates a demo from a dependable tool.

# Concept Explanation

### Self-consistency: ask several times, vote on the answer

Xuezhi Wang and colleagues (2022) proposed **self-consistency** as an upgrade to chain-of-thought.
Instead of taking one reasoning path, you **sample a diverse set** of reasoning paths for the same
question and select the **most consistent final answer**. The intuition: a hard problem usually has
several valid ways of reasoning toward the one correct answer, while mistakes tend to scatter. On
arithmetic and commonsense benchmarks it boosted chain-of-thought accuracy substantially, for
example **+17.9%** on GSM8K and +11.0% on SVAMP.

Two details make or break it:

1. **The samples must differ.** Self-consistency relies on sampling randomness. If you force the
   most likely output every time (for example, temperature 0 on APIs that allow it), all the paths
   are the same and there's nothing to vote on. Many current models and APIs no longer let you
   change sampling settings (Lesson 13); their default sampling usually varies enough.
2. **Vote on the extracted answer, not the whole text.** Two responses that reason differently but
   both conclude "$95" agree, even though their text differs. Compare the final answers.

One of this course's source books shows a self-consistency program that runs at temperature 0 and
counts identical *full responses*, which defeats both points. Here's a corrected, runnable version
using `call_llm` and the tag extraction from Lesson 11:

```python
import re
from collections import Counter

PROMPT = """Solve the problem. Reason inside <reasoning> tags, then give only the
final answer inside <answer> tags.

<problem>{problem}</problem>"""

def extract_answer(text: str) -> str | None:
    m = re.search(r"<answer>\s*(.*?)\s*</answer>", text, re.DOTALL)
    return m.group(1).strip().lower() if m else None

def self_consistent_answer(problem: str, samples: int = 5) -> tuple[str | None, float]:
    answers = []
    for _ in range(samples):
        answer = extract_answer(call_llm(PROMPT.format(problem=problem)))
        if answer is not None:
            answers.append(answer)
    if not answers:
        return None, 0.0
    best, votes = Counter(answers).most_common(1)[0]
    return best, votes / samples  # answer and agreement rate

answer, agreement = self_consistent_answer(
    "A farmer has 20 trees producing 10 apples a day each. He eats 4, bakes "
    "with 6, and sells the rest at $0.50 each. How much does he earn per day?"
)
print(answer, agreement)
```

### Agreement as a confidence signal

The **agreement rate** (how many samples gave the winning answer) is useful on its own. If 5 of 5
samples agree, you can be more comfortable; if the votes split 2-2-1, the question is genuinely hard
or ambiguous for the model. Route low-agreement cases to a human, a stronger model, or a tool
instead of returning a coin flip.

The costs are real: five samples cost roughly five times as much and take longer unless you run them
in parallel. Use self-consistency where an answer is **short and checkable** (a number, a label, a
choice) and where being wrong is expensive. It's awkward for long free-form writing, where there's
no single "answer" to vote on.

### Generate, critique, revise

A second family of techniques has the model **review and improve** its own output. Mark Austin's
book describes it in three steps: generate something, make the model play critic, then demand a
revision that fixes the flaws it found. The research version is **Self-Refine** (Aman Madaan and
colleagues, 2023): the same model generates, gives itself feedback, and refines, iteratively, with
no extra training. Across seven tasks, outputs improved by about **20%** absolute on average.

Anthropic's guide calls this the most common chaining pattern, **self-correction**: draft, review
against criteria, refine, ideally as **separate calls** so you can log and inspect each step.

```text
Step 1:  Write a 150-word product description for <product>.

Step 2:  Review the description below against these criteria: (1) mentions the
         three key features, (2) under 150 words, (3) no unverifiable claims like
         "best" or "#1", (4) ends with a call to action. For each criterion, say
         pass or fail with a one-line reason.
         <description>{draft}</description>

Step 3:  Revise the description to fix every failed criterion. Change nothing else.
         <description>{draft}</description>
         <review>{review}</review>
```

**Critique works best against explicit criteria.** "Make it better" invites vague, sometimes
worse edits. "Check these four things" gives the critic something to check. And know the limit: a
model reviewing its own work shares its own blind spots. Self-critique catches **careless** errors
(a missed requirement, a contradiction) better than **knowledge** errors (a wrong fact it believes).

### The Reflection pattern: surface assumptions

The **Reflection** pattern (from White and colleagues' catalog) asks the model to explain the
reasoning and assumptions behind each answer:

```text
From now on, when you answer, briefly state the key assumptions you made and
anything you were unsure about, after the answer.
```

This is genuinely useful: assumptions like "I assumed you're in the US" or "I assumed the data is
monthly" are exactly what you need to spot. But be careful with the common add-on "...and cite your
sources". Without retrieval or search, a model can produce **plausible but fabricated citations**,
and its stated reasoning may not reflect how it actually answered (Lesson 11). Reflection helps you
**find things to check**; it doesn't check them.

### The Fact Check List pattern: know what to verify

The **Fact Check List** pattern asks the model to list the facts its answer depends on, the ones
that would undermine the answer if they were wrong:

```text
Write a 120-word summary of the history of the bicycle. At the end, add a
"Facts to check" list of the specific dates, names, and claims the summary
depends on.
```

The list turns a wall of prose into a **checklist** you (or a search tool, or a reviewer) can work
through. It's only as good as the checking that follows: a list of facts the model believes is not
the same as a list of verified facts.

### A hierarchy of verification

Prefer the strongest check available:

1. **Deterministic checks**: run the code, execute the tests, recompute with a calculator or
   script, validate against a schema, compare with a database. These can't be talked into a wrong
   answer.
2. **Grounding in sources**: check claims against provided documents or real search results, with
   quotes (Lessons 16 and 18).
3. **Independent model review**: a separate call (or a different model) judges against explicit
   criteria (Lesson 22 covers LLM-as-a-judge and its biases).
4. **Self-critique**: useful for careless errors, weakest for knowledge errors.
5. **Human review**: for high-stakes outputs, a qualified person stays in the loop.

Anthropic's guide also suggests a light-touch version for many tasks: append something like
"Before you finish, verify your answer against [test criteria]". It notes that some newer models
already verify well on their own, so carried-over verification instructions can cause
**over-verification** and extra cost. Measure before adding steps.

# Key Terminology

- **Self-consistency**: sampling several reasoning paths and choosing the most common final answer.
- **Agreement rate**: the share of samples that gave the winning answer; a confidence signal.
- **Self-Refine / self-correction**: generate, critique against criteria, and revise, iteratively.
- **Reflection pattern**: the model states its reasoning, assumptions, and uncertainties.
- **Fact Check List pattern**: the model lists the facts its answer depends on, for verification.
- **Deterministic check**: verification by code, tests, calculation, or schema that doesn't rely on
  model judgment.

# Options and Trade-offs

| Technique | Improves | Cost | Limitation |
| --- | --- | --- | --- |
| Self-consistency | Accuracy on short, checkable answers | N times the calls | Needs diverse samples; poor fit for long text |
| Generate-critique-revise | Completeness, adherence to criteria | 2-3 calls | Shares the model's blind spots |
| Reflection pattern | Visibility of assumptions | A few extra tokens | Explanations and citations may be unreliable |
| Fact Check List | Knowing what to verify | A few extra tokens | Doesn't verify anything itself |
| Deterministic checks | Correctness you can trust | Engineering effort | Only for checkable outputs |
| Human review | High-stakes judgment | People's time | Slow; must be targeted |

# Worked Example

An internal tool answers employees' questions about vacation-day calculations.

**Single-shot answer:** "You have 14.5 days remaining." It's right most of the time, wrong
occasionally, and nobody can tell which.

**Hardened design:**

1. **Self-consistency**: sample 5 structured-CoT answers and vote on the extracted number.
2. **Agreement rule**: if fewer than 4 of 5 agree, don't answer; reply "Let me route this to HR"
   and open a ticket.
3. **Deterministic check**: the calculation inputs (accrual rate, days used) come from the HR
   database, and a Python function recomputes the final number from the model's extracted inputs.
   If the model's answer and the function's disagree, the function wins and the case is logged.
4. **Reflection**: the answer includes "Assumptions: full-time employee, calendar-year accrual" so
   employees can spot when an assumption doesn't apply to them.

The model still does the language work: understanding the question and explaining the result. The
correctness comes from voting, thresholds, and code.

# Real World Analogy

Self-consistency is like **asking several people for directions** in an unfamiliar town. If four
of five independently point toward the river, you go toward the river. If they point in five
different directions, you've learned something valuable: nobody here is sure, so check a map.
Verification is the map. Asking the same person twice doesn't help; you need independent answers,
or better, a source that can't be wrong in the same way.

# Examples

## Example 1 — Basic: a critique with criteria

```text
Here's my cover letter. Check it against these criteria and report pass/fail
for each: (1) names the job title, (2) gives one specific achievement with a
number, (3) under 250 words, (4) no clichés like "team player".
<letter>...</letter>
```

**Why this works:** explicit criteria turn a vague "is it good?" into a checklist the model can
apply.

## Example 2 — Real-world: Fact Check List before publishing

```text
Draft a 200-word newsletter item about our city's new recycling rules, based
only on the notice below. Then add "Facts to verify:" listing every date,
material, and fee mentioned.
<notice>...</notice>
```

**Why this works:** the draft is grounded in the notice, and the list tells the editor exactly what
to double-check against it before sending.

## Example 3 — Pitfall: "cite your sources" without sources

```text
Explain the health benefits of green tea and cite your sources with links.
```

**What goes wrong:** without search or provided documents, the model may produce real-looking but
nonexistent studies or links. **Fix:** provide sources or use a search-enabled tool, and click every
link before relying on it. Use Reflection to surface assumptions, not to manufacture evidence.

# Common Mistakes

- **Running self-consistency without sampling diversity**, so every sample is identical.
- **Voting on whole responses** instead of extracted final answers.
- **Critiquing without criteria** ("make it better"), which invites random edits.
- **Treating self-critique as verification** of facts the model doesn't know.
- **Accepting model-supplied citations** without checking them.

# Best Practices

- Use self-consistency for **short, checkable, high-value** answers, and act on the **agreement
  rate**.
- Run critique and revision as **separate, logged steps** with explicit criteria.
- Use **Reflection** to surface assumptions and **Fact Check List** to build a verification
  checklist.
- Prefer **deterministic checks** and **sources** over model judgment whenever possible.
- Keep **humans in the loop** where errors are costly, and measure whether extra steps pay off.

# Summary

- **Self-consistency** samples diverse reasoning paths and votes on extracted answers; agreement is
  a confidence signal.
- **Generate-critique-revise** (Self-Refine, self-correction) improves outputs when critique uses
  **explicit criteria**.
- **Reflection** surfaces assumptions; **Fact Check List** lists what to verify. Neither verifies
  anything by itself.
- Model-supplied **citations** without retrieval may be fabricated.
- Prefer **deterministic checks**, then **sources**, then **independent review**, then
  **self-critique**, with **humans** for high stakes.

# Flash Cards

Q: How does self-consistency work?
A: Sample several diverse reasoning paths for the same question, extract each final answer, and choose the most common one.

Q: Why does self-consistency fail at temperature 0?
A: All samples come out the same, so there's no diversity to vote over.

Q: What does a low agreement rate across samples tell you?
A: The question is hard or ambiguous for the model; route it to a human, a tool, or a stronger check.

Q: What makes a self-critique step effective?
A: Explicit criteria to check against, run as a separate step from generation and revision.

Q: What's the risk of asking a model to "cite sources" without retrieval?
A: It may produce plausible but fabricated citations and links.

Q: What is the strongest kind of verification?
A: Deterministic checks: running code or tests, recomputing, schema validation, or comparing with authoritative data.

# Exercises

### Easy
Ask a model the same tricky word problem five times in fresh chats. Record the final answers. What
was the agreement rate, and was the majority right?

### Medium
Take something you've written (a bio, a summary, an email). Write four explicit criteria and run a
critique step, then a revision step that fixes only the failed criteria. Compare with a revision
from "make this better".

### Challenging
Implement the `self_consistent_answer` function with `call_llm` connected. Run it on 10 problems with
known answers, using 1, 3, and 5 samples. Plot or tabulate accuracy and cost per setting, and find
an agreement threshold below which you'd route the question elsewhere.

# Further Reading

- Wang et al., *Self-Consistency Improves Chain of Thought Reasoning in Language Models* (2022):
  <https://arxiv.org/abs/2203.11171>
- Madaan et al., *Self-Refine: Iterative Refinement with Self-Feedback* (2023):
  <https://arxiv.org/abs/2303.17651>
- White et al., *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2023),
  Reflection and Fact Check List patterns: <https://arxiv.org/abs/2302.11382>
- Anthropic — *Prompting best practices* ("Chain complex prompts", self-check advice):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 3.5 and 4.4.
- Mark Austin, *How to Become a Prompt God* (2025), section 7.1 (teaching AI to critique itself).
