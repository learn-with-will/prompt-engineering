---
id: lesson-11
slug: chain-of-thought
title: "Chain-of-Thought Reasoning"
level: intermediate
order: 11
duration: 26
tags:
  - chain-of-thought
  - reasoning
  - zero-shot-cot
  - reasoning-models
  - faithfulness
summary: "Chain-of-thought prompting, from the original few-shot method and the famous 'Let's think step by step' to structured reasoning with answer tags, how built-in reasoning models change the advice, and why a model's stated reasoning isn't proof of how it decided."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain **chain-of-thought (CoT)** prompting and the evidence behind it.
- Use **zero-shot CoT** and **few-shot CoT**, and separate reasoning from the final answer with
  tags.
- Decide **when CoT helps** and when it only adds cost.
- Adjust your prompting for **reasoning models** that think before answering.
- Explain why CoT explanations can be **unfaithful**, and what to rely on instead.

# Why It Matters

Ask a model a multi-step question and demand an instant answer, and it has to produce the answer
token in one leap. Let it work through intermediate steps first, and accuracy on math, logic, and
planning problems can jump dramatically. CoT is one of the best-documented techniques in prompt
engineering. It's also changing fast: many current models reason internally on their own, which
changes how you should prompt them. Knowing both the classic technique and the new advice keeps you
effective across models.

# Concept Explanation

### The original idea: few-shot chain-of-thought

In 2022, Jason Wei and colleagues showed that including a few examples whose answers **spell out
the intermediate reasoning steps** significantly improved large models on arithmetic, commonsense,
and symbolic reasoning. With just **eight** such exemplars, a 540-billion-parameter model reached
state-of-the-art accuracy on GSM8K, a benchmark of grade-school math word problems. The paper
described this ability as **emerging** in sufficiently large models.

A few-shot CoT prompt looks like this:

```text
Q: A café sells muffins for $3 and coffee for $2. Ana buys 2 muffins and
3 coffees. How much does she spend?
A: Muffins cost 2 x $3 = $6. Coffees cost 3 x $2 = $6. Total = $6 + $6 = $12.
The answer is $12.

Q: A library has 120 books. It lends out 45 and receives 30 donations.
How many books does it have now?
A:
```

The example teaches **how** to answer (show each step, then state the answer), not just what the
answer looks like.

### Zero-shot CoT: "Let's think step by step"

Months later, Takeshi Kojima and colleagues found you don't always need examples. Simply adding
**"Let's think step by step"** before the answer raised accuracy on the MultiArith benchmark from
**17.7% to 78.7%**, and on GSM8K from **10.4% to 40.7%**, with the InstructGPT model text-davinci-002.

```text
A store had 52 kites. It sold 3 boxes of 8 kites each, then received a
shipment of 15 kites. How many kites does it have now?
Let's think step by step.
```

Variations work too: "Work through this step by step before giving your answer", "Show your
reasoning, then give the final answer". Mark Austin's book frames it as asking the model to
"show its work".

### Structured CoT: separate reasoning from the answer

If a program will use the answer, or you want to skim, ask for the reasoning and the answer in
**separate tagged sections**:

```text
Solve the problem below. Think it through inside <reasoning> tags, then give
only the final number inside <answer> tags.

<problem>
A train leaves at 9:40 and the trip takes 2 hours 35 minutes. When does it arrive?
</problem>
```

Then extract the answer in code:

```python
import re

def extract_answer(response: str) -> str | None:
    match = re.search(r"<answer>\s*(.*?)\s*</answer>", response, re.DOTALL)
    return match.group(1) if match else None

reply = "<reasoning>9:40 + 2h = 11:40; + 35 min = 12:15.</reasoning>\n<answer>12:15</answer>"
print(extract_answer(reply))  # 12:15
```

Anthropic's current guide recommends exactly this shape, an `<answer>` tag you can extract, as its
**manual CoT** technique for when a model's built-in thinking is turned off.

### When CoT helps, and when it doesn't

CoT tends to help on tasks with **multiple dependent steps**: arithmetic word problems, logic
puzzles, planning, comparing several options against criteria, debugging. It helps much less on:

- **Simple lookups or classifications** ("What's the capital of Peru?", "Is this email spam?").
- **Pure style tasks** (rewriting tone).
- **Latency- or cost-sensitive** uses, since reasoning tokens take time and money.

The original research also found the benefit depends on **model scale**: small models produced
fluent but wrong chains. Test on your own task before adding CoT everywhere.

### Reasoning models change the advice

Many current models are trained to **reason before answering** on their own, often called
"thinking" or "reasoning" modes, sometimes with a setting (often called **effort**) that controls how
much they think. This shifts what good prompting looks like:

- Anthropic's guide advises: **prefer general instructions over prescriptive steps**. A prompt such
  as "think thoroughly" often produces better reasoning than a hand-written step-by-step plan, and
  the model's reasoning frequently exceeds what a human would prescribe.
- It treats manual CoT (asking for visible reasoning in tags) as a **fallback** for when thinking is
  off; on its most capable current models it recommends relying on built-in thinking instead.
- It notes that **worked examples still help**: examples shape how the model approaches similar
  problems in its own thinking.
- OpenAI's reasoning guide gives similar advice: reasoning models work best with **a clear goal and
  an explicit output contract**, without prescribing every intermediate step, and it describes
  effort as a tuning knob rather than the main way to improve quality.

In short: with reasoning models, describe the **goal, constraints, and the answer format** clearly,
and let the model plan its own steps. Save "step 1, step 2, step 3" scripts for when you need a
specific procedure followed for business reasons.

### CoT explanations aren't a window into the model

It's tempting to read a chain of thought as the model's true decision process. Research says be
careful. Miles Turpin and colleagues (2023) showed that CoT explanations can **systematically
misrepresent** why a model answered as it did. When they biased models toward an answer (for
example, by making the correct option always "(A)" in the examples), the models' explanations
rationalized the biased answers **without mentioning** the bias, and accuracy dropped by as much as
36% on a suite of tasks.

So use CoT to **improve answers**, not to **certify** them. To check correctness, verify the final
answer independently: recompute it, test the code, check the source (Lesson 12).

### A note on example leakage

Few-shot CoT examples are still examples, and Lesson 6's warning applies: models copy surface
details. If every exemplar is about shopping totals, the model may force a geometry problem into a
shopping-total shape. Vary the topics of your reasoning examples while keeping their structure
consistent.

# Key Terminology

- **Chain-of-thought (CoT)**: prompting a model to produce intermediate reasoning steps before its
  final answer.
- **Few-shot CoT**: examples that include worked reasoning, followed by the new problem.
- **Zero-shot CoT**: a reasoning trigger such as "Let's think step by step" with no examples.
- **Manual CoT**: asking for visible reasoning in tags (for example `<reasoning>` and `<answer>`),
  typically when built-in thinking is off.
- **Reasoning model**: a model trained to think internally before answering, often with an effort
  setting.
- **Faithfulness**: whether a stated explanation reflects the real reason for the model's answer.

# Options and Trade-offs

| Approach | When it shines | Cost | Caveat |
| --- | --- | --- | --- |
| Direct answer | Simple lookups, classification | Lowest | Weak on multi-step problems |
| Zero-shot CoT | Quick boost on reasoning tasks | More output tokens | Format of reasoning varies |
| Few-shot CoT | Consistent reasoning format | Long prompt plus output | Example leakage; effort to write |
| Structured CoT with tags | Programs need the answer | Same as CoT | Must parse; handle missing tags |
| Built-in reasoning (thinking) | Hard reasoning, agents, code | Thinking tokens and latency | Prefer goals over step scripts |

# Worked Example

You want a model to choose between three office locations.

**Direct prompt:**

```text
Which office should we pick: Downtown ($9,000/month, 10-min commute avg),
Riverside ($6,500/month, 25-min avg), or Airport Park ($5,000/month, 40-min avg)?
```

The model picks one with a one-line justification that ignores half the trade-offs.

**Structured reasoning prompt:**

```text
We're choosing an office for a 30-person team. Our priorities, in order:
1) average commute under 30 minutes, 2) monthly cost, 3) room to grow.

<options>
Downtown: $9,000/month, 10-min average commute, no room to grow
Riverside: $6,500/month, 25-min average commute, one extra floor available
Airport Park: $5,000/month, 40-min average commute, large campus
</options>

Reason through each option against the priorities in order inside <reasoning>
tags. Then give your recommendation and a two-sentence justification inside
<answer> tags.
```

The reasoning eliminates Airport Park on priority 1, compares the other two on cost, and notes
Riverside's growth room. You can read the reasoning to see whether it applied your priorities
correctly, but you should still sanity-check the conclusion yourself, because a plausible chain can
still be wrong.

# Real World Analogy

Chain-of-thought is like a math teacher saying **"show your work"**. Writing each step on scratch
paper catches mistakes a mental leap would miss, and it lets the teacher follow along. But every
teacher has also seen a student write a tidy-looking derivation *after* copying the answer from a
friend. The work on the page isn't proof of how the answer was reached. That's why the teacher
still checks the final answer, and why you should too.

# Examples

## Example 1 — Basic: zero-shot CoT

```text
If a recipe for 4 people uses 300 g of flour, how much flour do I need for
10 people? Work it out step by step, then state the answer in grams.
```

**Why this works:** a short, multi-step proportion problem where writing the steps reduces slips.

## Example 2 — Real-world: a reasoning model with goals, not steps

```text
Review the attached incident timeline and identify the most likely root cause
of the outage. Think thoroughly. In your answer, give: the root cause in one
sentence, the evidence from the timeline that supports it, and one alternative
explanation you ruled out and why.
```

**Why this works:** with a model that reasons internally, a clear goal and output contract beat a
hand-written investigation checklist.

## Example 3 — Pitfall: trusting the chain

A model explains, step by step, why a contract clause is enforceable, citing a legal principle in a
confident, logical-sounding chain.

**What goes wrong:** the chain reads well, but a principle in step 2 is wrong for your jurisdiction,
and everything after it inherits the error. The stated reasoning made the answer *feel* verified.
**Fix:** treat reasoning as a draft to check. Verify key premises against sources, or have a
qualified person review high-stakes conclusions.

# Common Mistakes

- **Adding "think step by step" to everything**, including simple tasks where it only adds cost.
- **Over-scripting reasoning models** with rigid step lists that limit their own planning.
- **Not separating the answer** from the reasoning when a program needs to read it.
- **Reading the chain as proof** of correctness or of the model's true decision process.
- **Using look-alike CoT examples**, which leak structure into unrelated problems.

# Best Practices

- Use CoT for **multi-step** problems; skip it for lookups and style edits.
- Put the final answer in a **tagged section** you can extract, and handle the case where the tag
  is missing.
- With reasoning models, state the **goal, constraints, and output format**, and say "think
  thoroughly" rather than scripting each step.
- Keep **worked examples** varied in topic and consistent in structure.
- **Verify answers** independently; don't treat explanations as audits.

# Summary

- **Chain-of-thought** prompting asks for intermediate steps before the answer, and it can greatly
  improve multi-step reasoning in large models.
- **Few-shot CoT** (Wei et al.) uses worked examples; **zero-shot CoT** (Kojima et al.) uses a
  trigger like "Let's think step by step".
- **Structured CoT** with `<reasoning>` and `<answer>` tags makes answers easy to extract.
- **Reasoning models** think on their own: give goals and output contracts, not step scripts, and
  use manual CoT as a fallback.
- CoT explanations can be **unfaithful**; verify final answers independently.

# Flash Cards

Q: What is chain-of-thought prompting?
A: Prompting a model to write intermediate reasoning steps before its final answer.

Q: What did Kojima et al. (2022) find with "Let's think step by step"?
A: Zero-shot accuracy on MultiArith rose from 17.7% to 78.7% (and GSM8K from 10.4% to 40.7%) with text-davinci-002.

Q: Why put the final answer in <answer> tags?
A: So a program (or a skimming reader) can extract it reliably, separate from the reasoning.

Q: How should you prompt a reasoning model that thinks on its own?
A: Give a clear goal, constraints, and output format, and prefer general instructions like "think thoroughly" over prescriptive step lists.

Q: What did Turpin et al. (2023) show about CoT explanations?
A: They can misrepresent the real reason for an answer, rationalizing biased answers without mentioning the bias.

Q: Name two kinds of tasks where CoT adds little value.
A: Simple lookups or classifications, and pure style rewrites (it mainly adds cost and latency there).

# Exercises

### Easy
Pick five multi-step word problems. Ask each with and without "Let's think step by step" (in fresh
chats). Record which answers changed and which were correct.

### Medium
Write a structured CoT prompt with `<reasoning>` and `<answer>` tags for a decision you face (for
example, choosing between two job offers using your stated priorities). Extract the answer with the
regex from this lesson and check whether the reasoning actually followed your priorities.

### Challenging
Test a reasoning-capable model two ways on the same three hard problems: once with a detailed,
prescriptive step-by-step procedure, once with only a goal, constraints, and output format plus
"think thoroughly". Compare accuracy and length. Then deliberately bias one prompt (for example,
hint at a wrong answer) and check whether the explanation mentions the hint.

# Further Reading

- Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* (2022):
  <https://arxiv.org/abs/2201.11903>
- Kojima et al., *Large Language Models are Zero-Shot Reasoners* (2022):
  <https://arxiv.org/abs/2205.11916>
- Turpin et al., *Language Models Don't Always Say What They Think: Unfaithful Explanations in
  Chain-of-Thought Prompting* (2023): <https://arxiv.org/abs/2305.04388>
- Anthropic — *Prompting best practices* ("Thinking and reasoning"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — *Reasoning models* guide: <https://platform.openai.com/docs/guides/reasoning>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 4.3 and 5.1-5.3.
- Mark Austin, *How to Become a Prompt God* (2025), section 4.1.
