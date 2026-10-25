---
id: lesson-08
slug: iterative-refinement
title: "Iterate, Debug, and Refine"
level: beginner
order: 8
duration: 24
tags:
  - iteration
  - debugging
  - question-refinement
  - prompt-library
  - troubleshooting
summary: "How to improve a prompt systematically: diagnose failures by symptom, change one thing at a time, test on varied inputs, let the model suggest better questions and alternatives, and keep a versioned prompt library."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Run a disciplined **refinement loop**: one change per round, tested on several inputs.
- **Diagnose** common failures by symptom and apply the matching fix.
- Use the **Question Refinement** and **Alternative Approaches** patterns to improve prompts with the
  model's help.
- Decide when to refine **in conversation** and when to fold fixes **back into the prompt**.
- Keep a **prompt library** with versions, notes, and test inputs.

# Why It Matters

First drafts rarely nail it, for prompts as for writing. The difference between people who get
consistently great results and people who give up is usually not talent but process: they look at
*why* an output missed and make a targeted change. This lesson closes the beginner tier by turning
everything so far into a repeatable debugging habit.

# Concept Explanation

### The refinement loop

1. **Run** the prompt on several realistic inputs, not just one.
2. **Compare** each output with what you wanted. Write down the gap in one sentence.
3. **Hypothesize** the cause (missing context? vague format? conflicting rules?).
4. **Change one thing** and rerun on the same inputs.
5. **Keep or revert** based on the results, and log what you learned.

Changing one thing at a time is the most important rule. If you add a persona, three examples, and
a new format all at once and the output improves, you won't know which change helped, or whether one
of them quietly made something else worse.

### Diagnose by symptom

Most failures fall into a handful of patterns. This table is a starting point, corrected and
expanded from the troubleshooting guide in Mark Austin's book:

| Symptom | Likely cause | Fix to try |
| --- | --- | --- |
| Generic, bland answer | Missing audience, goal, or context | Add who it's for, why, and specific details |
| Wrong format or extra chatter | Format not specified or shown | Give a template or one example; "reply with only..." |
| Ignores a rule | Rule buried, vague, or contradicted | Move it near the end, make it concrete, add the reason, remove conflicts |
| Too long | No length target | Ask for words, sentences, or items; tokens limits only truncate |
| Invents facts | Asked for specifics it doesn't have | Provide sources; "if it's not in the text, say so"; verify |
| Inconsistent between runs | Underspecified task | Add examples and definitions; test several runs |
| Copies example details | Examples too similar | Diversify examples; say what should transfer |
| Unnecessary refusal | Request looks risky without context | State the legitimate purpose and context plainly |
| Loses track in a long chat | Context too long; key info buried | Summarize and restart; restate key rules |

### Refine in conversation, then fold it back

In a chat, quick follow-ups work well: "Shorter, and make the tone warmer", "Good, now turn point 3
into a table". Austin's book recommends treating the model as a collaborator, not a vending machine.

But if you'll **reuse** the prompt, don't rely on five follow-up corrections every time. Once you've
found what works, **rewrite the original prompt** to include those fixes, then test the new version
from scratch in a fresh conversation. A prompt that only works after a specific chain of corrections
isn't finished.

### Let the model help: Question Refinement

The **Question Refinement pattern** (from the prompt-pattern catalog, presented in *Prompt
Engineering in Action*) asks the model to improve your question before answering it:

```text
Whenever I ask a question, first suggest a better version of the question that
would get a more useful answer, explain in one line why it's better, and ask
whether I want to use it.
```

This is especially useful when you're new to a topic and don't know what you don't know. "What's
the best laptop?" might come back as "What's the best laptop under $1,000 for video editing that
weighs less than 2 kg?" Now you know which details matter.

### Explore options: Alternative Approaches

The **Alternative Approaches pattern** asks the model to lay out different ways to solve a problem
and compare them before you commit:

```text
When I ask how to do something, list two or three different approaches,
compare them on cost, effort, and risk, and then ask me which one to pursue.
```

You can point this at your own prompts too: "Here's my prompt. Suggest three alternative ways to
structure it and the trade-offs of each."

### Ask the model to critique your prompt

A quick, effective move is to show the model your prompt (not just the output) and ask what's
unclear:

```text
Here is a prompt I plan to reuse. Before running it, tell me: what's ambiguous,
what information is missing, and what you would have to guess? Then suggest a
revised version.

<prompt>
...your prompt...
</prompt>
```

This is a small step into **meta-prompting** (Lesson 21). Treat the suggestions as ideas to test,
not as automatically better.

### Test on varied inputs

A prompt tuned on one input can quietly **overfit** to it. Keep a small set of test inputs that
includes:

- a **typical** case,
- a **short or minimal** case,
- a **long or messy** case,
- an **edge case** (missing information, mixed signals, unusual language),
- a case that **should** trigger a rule or refusal.

Running every version on the same set makes comparisons fair. Here's a minimal runnable harness,
using the `call_llm` placeholder from Lesson 1, that logs every run to a CSV file:

```python
import csv
from datetime import date

PROMPT_VERSIONS = {
    "v1": "Summarize this review in one sentence:\n{review}",
    "v2": (
        "Summarize the customer review below in one sentence of at most 20 words, "
        "stating the main reason for their rating.\n<review>\n{review}\n</review>"
    ),
}
TEST_INPUTS = [
    "Great blender, very quiet, smoothies in 30 seconds.",
    "Box was crushed. Blender works but the lid cracked on day two. Support never replied.",
    "ok",
]

with open("prompt_log.csv", "a", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    for version, template in PROMPT_VERSIONS.items():
        for text in TEST_INPUTS:
            output = call_llm(template.format(review=text))
            writer.writerow([date.today(), version, text, output])
```

Open the CSV side by side and judge each version on the whole set, not on its best example.

### Build a prompt library

Both source books recommend saving what works; Austin calls it a "prompt emergency kit" and a
"prompt journal". A useful library entry has:

- the **prompt** (or template) and a **version number**,
- **what it's for** and which model or app you used,
- the **test inputs** and a note on how it performed,
- **known limitations** ("struggles with sarcasm").

A shared document or a folder in version control is plenty to start.

### Knowing when to stop

Stop refining when the prompt meets your quality bar on your test set **consistently**, not when one
run looks great. If several careful rounds don't move the needle, the problem may not be the prompt:
the model may lack knowledge (add sources or tools), the task may need splitting (Lesson 15), or a
different model may suit it better (Lesson 20).

# Key Terminology

- **Refinement loop**: run, compare, hypothesize, change one thing, keep or revert, log.
- **Question Refinement pattern**: the model proposes a better version of your question before
  answering.
- **Alternative Approaches pattern**: the model lays out and compares several approaches before you
  choose one.
- **Overfitting (a prompt)**: tuning a prompt so closely to one input that it fails on others.
- **Test set**: a small, fixed collection of inputs used to compare prompt versions fairly.
- **Prompt library**: a versioned collection of working prompts with notes and test inputs.

# Options and Trade-offs

| Approach | Strength | Weakness | Use when |
| --- | --- | --- | --- |
| Conversational follow-ups | Fast, natural | Fixes don't persist; hard to reproduce | Exploring, one-off tasks |
| Editing the base prompt | Reusable, reproducible | Needs retesting each change | Prompts you'll reuse |
| Model critiques your prompt | Finds blind spots quickly | Suggestions can be generic or wrong | Stuck, or new to the domain |
| Fixed test set and log | Fair comparisons, catches regressions | A little setup | Anything important or repeated |

# Worked Example

A prompt sorts customer feedback into themes, but results are messy.

**v1:**

```text
Group this feedback into themes.
<feedback>...40 comments...</feedback>
```

**Observed gap:** themes are vague ("General issues"), the number of themes varies run to run, and
some comments appear in two themes.

**v2 (one change: define the output):**

```text
Group the feedback below into 3-6 themes. Give each theme a specific name
(not "general" or "other"), a count, and two representative quotes.
<feedback>...40 comments...</feedback>
```

**Result:** names are better and counts appear, but some comments are still double-counted.

**v3 (one change: add a rule with a reason):**

```text
...Assign each comment to exactly one theme so the counts add up to the total
number of comments; the product team uses these counts to prioritize work.
```

**Result:** counts now add up across all five test sets. Each round fixed one observed gap, and the
log shows exactly which change did what.

# Real World Analogy

Refining a prompt is like **seasoning soup**. A good cook tastes, adds a pinch of one thing, and
tastes again. Dump in salt, pepper, lemon, and chili all at once and you'll never know which one
ruined it, or which one saved it. And a cook who only tastes one spoonful from the top might miss
that the bottom is burnt: test the whole pot, which in prompting means your whole set of test
inputs.

# Examples

## Example 1 — Basic: conversational refinement

```text
You:   Write a tagline for a bike repair shop.
Model: "Wheel love your bike!"
You:   Less punny, more trustworthy. Mention same-day repairs. Under 8 words.
Model: "Same-day bike repairs you can trust."
```

**Why this works:** each follow-up names a specific gap. If you'll need more taglines later, fold
"trustworthy, mention same-day repairs, under 8 words" into the original prompt.

## Example 2 — Real-world: asking for a better question

```text
Before answering, suggest a better version of my question and explain why
it's better: How do I make my website faster?
```

A typical refined question asks about the platform, the slowest pages, the audience's devices, and
how speed is measured. **Why this works:** the model surfaces the missing context, so your next
prompt is specific.

## Example 3 — Pitfall: overfitting to one input

You tune a summary prompt until it's perfect for one long, formal report. Then it receives a
three-line email and produces a summary longer than the email, with headings.

**What goes wrong:** the prompt was only ever tested on one kind of input. **Fix:** test on a set
that includes short, long, formal, and informal inputs, and add a rule such as "If the text is under
50 words, reply with a single sentence".

# Common Mistakes

- **Changing several things at once**, so you can't tell what helped.
- **Testing on a single input** and declaring victory.
- **Relying on a chain of follow-ups** instead of fixing the base prompt.
- **Not keeping old versions**, so you can't roll back a change that made things worse.
- **Refining forever** when the real problem is missing knowledge or a task that needs splitting.

# Best Practices

- Write the **gap in one sentence** before you change anything.
- Make **one change per round** and rerun on the **same test set**.
- Fold successful follow-ups **back into the base prompt** and retest it fresh.
- Use **Question Refinement**, **Alternative Approaches**, and prompt critiques to find blind spots.
- Keep a **versioned prompt library** with test inputs and known limitations.

# Summary

- Improve prompts with a loop: **run, compare, hypothesize, change one thing, keep or revert, log**.
- **Diagnose by symptom**: generic, wrong format, ignored rules, too long, invented facts,
  inconsistency, copied examples, refusals, lost context.
- Refine in conversation to explore, then **fold fixes into the base prompt** for reuse.
- **Question Refinement** and **Alternative Approaches** let the model improve your questions and
  options.
- Test on **varied inputs** and keep a **prompt library**; stop when results are consistently good.

# Flash Cards

Q: What is the single most important rule of prompt refinement?
A: Change one thing at a time, so you know which change caused which effect.

Q: What should you do with fixes you discovered through conversational follow-ups?
A: Fold them back into the base prompt and retest it from scratch in a fresh conversation.

Q: What does the Question Refinement pattern do?
A: The model suggests a better version of your question, explains why, and asks whether to use it.

Q: What does the Alternative Approaches pattern do?
A: The model lays out several approaches, compares their trade-offs, and lets you choose.

Q: What should a small prompt test set include?
A: A typical case, a minimal case, a long or messy case, an edge case, and a case that should trigger a rule.

Q: When should you stop refining a prompt?
A: When it meets your quality bar consistently across your test set, or when the real issue is missing knowledge or task design.

# Exercises

### Easy
Pick a prompt you use and run it on three different inputs. Write one sentence describing the
biggest gap, make one change to fix it, and rerun.

### Medium
Turn on the Question Refinement pattern for a conversation about a topic you know little about. Ask
five questions and note which refined questions taught you something about what matters.

### Challenging
Create a test set of five inputs for a prompt you rely on. Run three versions of the prompt through
the logging harness from this lesson, score each output from 1 to 5, and write a short changelog
explaining which change helped most and which one you reverted.

# Further Reading

- Anthropic — *Prompting best practices*:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — *Prompt engineering* guide: <https://platform.openai.com/docs/guides/prompt-engineering>
- White et al., *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2023), the
  Question Refinement and Alternative Approaches patterns: <https://arxiv.org/abs/2302.11382>
- Mark Austin, *How to Become a Prompt God* (2025), chapters 2 and 4 and Appendix D (prompt surgery,
  iterative refinement, troubleshooting).
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 2.6.1 and 2.8.3.
