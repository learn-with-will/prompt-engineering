---
id: lesson-06
slug: few-shot-examples
title: "Zero-, One-, and Few-Shot Examples"
level: beginner
order: 6
duration: 24
tags:
  - few-shot
  - zero-shot
  - in-context-learning
  - examples
  - classification
summary: "How examples inside a prompt teach a model the task's format, labels, and style; how many to use and how to choose them; and the traps that research and practice have uncovered: order effects, label bias, and copied surface details."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define **zero-shot**, **one-shot**, and **few-shot** prompting and **in-context learning**.
- Explain what examples actually teach a model, using findings from research.
- Choose examples that are **relevant, diverse, balanced, and consistently formatted**.
- Recognize and fix **order effects**, **label bias**, and **surface-detail leakage**.
- Assemble a few-shot prompt programmatically from a list of examples.

# Why It Matters

Some things are easier to show than to describe: a tone of voice, a tricky output format, where the
line falls between two categories. Examples inside a prompt (the "shots") are one of the most
reliable ways to get consistent output. Anthropic's guide calls examples one of the most reliable
ways to steer format, tone, and structure, and Google's Gemini guide recommends always including
them. But examples are also powerful enough to mislead the model, so they need choosing with care.

# Concept Explanation

### Zero, one, and few shots

- **Zero-shot**: only instructions, no examples. "Classify this review as positive, negative, or
  neutral." Modern instruction-tuned models handle many tasks this way.
- **One-shot**: one example of input and output, then the real input.
- **Few-shot (multi-shot)**: several examples, then the real input.

The ability to pick up a task from examples inside the prompt, with no retraining, is called
**in-context learning**. It was the headline finding of the 2020 GPT-3 paper, *Language Models are
Few-Shot Learners*: a large enough model could translate, answer questions, and do simple arithmetic
from a handful of demonstrations "specified purely via text interaction with the model".

### What examples teach

You might assume the model learns the correct answers from your examples. Research suggests the
picture is more interesting. Sewon Min and colleagues (2022) found that **randomly replacing the
labels** in demonstrations "barely hurts" performance on many classification tasks. What mattered
more was that the examples showed:

1. **The label space**: which answers are allowed ("POSITIVE", "NEGATIVE", "NEUTRAL").
2. **The input distribution**: what real inputs look like.
3. **The format**: the exact shape of input and output.

Takeaway: examples are first of all a **specification by demonstration** of the task's shape. Still
use correct labels (wrong ones can hurt on harder tasks and confuse people reading your prompt), but
put most of your effort into format, coverage, and realism.

### How many examples?

- Anthropic's guide suggests **3–5 examples** for best results.
- Google's Gemini guide recommends always including a few, and warns that with **too many** the
  model may start to **overfit**: copying the examples instead of generalizing.
- One example is often enough for a pure **format** demonstration. For fuzzy category boundaries,
  use more, focused on the hard cases.

### Choosing good examples

Make your examples:

- **Relevant**: close to the real inputs the prompt will see.
- **Diverse**: varied in length, wording, and topic, so the model doesn't latch onto an accident
  (all examples are about shoes, so it assumes everything is about shoes).
- **Edge-case aware**: include the tricky ones, like mixed sentiment, missing data, or sarcasm.
- **Balanced**: roughly equal coverage of each label, unless reality is truly skewed.
- **Consistent**: identical formatting across examples. Google's guide stresses paying attention to
  tags, whitespace, newlines, and example separators.
- **Clearly marked**: wrapped in tags such as `<example>` inside `<examples>`, so they're not
  mistaken for instructions or input.

### Instability: order and label bias

Few-shot prompts can be surprisingly sensitive. Tony Zhao and colleagues (2021) showed that the
**choice of examples, their format, and even their order** could move a model's accuracy from near
chance to near state of the art. They traced it to biases toward answers that appear **near the end**
of the prompt or are **common** in training data. Practical defenses:

- **Shuffle** example order and check that results don't change much.
- **Balance** labels and don't put all examples of one label last.
- **Test** on real inputs rather than trusting a prompt that worked once.

### Surface-detail leakage

Models copy what they see. Names, units, sentence openings, and lengths from your examples can leak
into unrelated answers. One of this course's source books prints a few-shot math example about
students in a class; the model's answer to a new question about apple trees came back labelled
"Total Students" with the wrong numbers, mimicking the example's surface instead of solving the new
problem. Defenses: vary surface details across examples, keep examples structurally consistent but
topically diverse, and say what should transfer ("follow the format of the examples, but use the
facts in the new question").

### Building few-shot prompts in code

Keeping examples as data makes them easy to shuffle, balance, and test. This runnable Python
builds a tagged few-shot prompt:

```python
import random

EXAMPLES = [
    {"text": "Arrived a day early and works perfectly.", "label": "POSITIVE"},
    {"text": "Stopped charging after a week.", "label": "NEGATIVE"},
    {"text": "It's fine. Does what it says.", "label": "NEUTRAL"},
    {"text": "Love the color, hate the battery life.", "label": "MIXED"},
]

def few_shot_prompt(new_text: str, seed: int | None = None) -> str:
    examples = EXAMPLES[:]
    random.Random(seed).shuffle(examples)  # vary order to test sensitivity
    shots = "\n".join(
        f"<example>\nReview: {ex['text']}\nLabel: {ex['label']}\n</example>"
        for ex in examples
    )
    return (
        "Classify the product review as POSITIVE, NEGATIVE, NEUTRAL, or MIXED. "
        "Reply with the label only.\n\n"
        f"<examples>\n{shots}\n</examples>\n\n"
        f"Review: {new_text}\nLabel:"
    )

print(few_shot_prompt("Great screen, but the speakers crackle.", seed=1))
```

# Key Terminology

- **Shot**: one example (input plus desired output) inside a prompt.
- **Zero-shot / one-shot / few-shot**: prompting with no, one, or several examples.
- **In-context learning**: learning a task from examples in the prompt, without changing the
  model's weights.
- **Label space**: the set of allowed outputs for a classification task.
- **Overfitting to examples**: copying examples too closely instead of generalizing.
- **Surface-detail leakage**: names, units, or phrasing from examples showing up in unrelated
  answers.

# Options and Trade-offs

| Approach | Pros | Cons | Use when |
| --- | --- | --- | --- |
| Zero-shot | Short, cheap, no example bias | Format and boundaries may drift | Simple, well-known tasks |
| One-shot | Locks in a format quickly | Model may copy it too literally | Output shape matters, content varies |
| Few-shot (3–5) | Consistent format, tone, and labels | Longer prompts; order and selection effects | Classification, extraction, style matching |
| Many-shot (dozens) | Covers rare cases | Cost, latency, overfitting risk | Hard edge cases with a large context budget |
| Examples plus instructions | Shows *and* tells | Must not contradict each other | Most production prompts |

# Worked Example

You need to tag incoming support tickets by urgency.

**Zero-shot attempt:**

```text
Rate this ticket's urgency: low, medium, or high.
"The export button is greyed out for one of our 40 users."
```

Results are inconsistent: sometimes "medium", sometimes "Medium urgency because...", sometimes a
paragraph.

**Few-shot version:**

```text
Rate each support ticket's urgency as LOW, MEDIUM, or HIGH.
HIGH = many users blocked or data at risk. MEDIUM = some users blocked or a
key feature degraded. LOW = cosmetic, single-user, or a question.
Reply with the label only.

<examples>
<example>
Ticket: "Nobody in the company can log in since 9am."
Urgency: HIGH
</example>
<example>
Ticket: "Typo on the pricing page."
Urgency: LOW
</example>
<example>
Ticket: "Reports load slowly for our finance team, about 2 minutes each."
Urgency: MEDIUM
</example>
<example>
Ticket: "How do I change my profile photo?"
Urgency: LOW
</example>
</examples>

Ticket: "The export button is greyed out for one of our 40 users."
Urgency:
```

Now the format is fixed, the definitions explain the boundaries, and the examples cover each label
including a question-type ticket. Next step: test on 20 real tickets and add an example for any
case the model gets wrong.

# Real World Analogy

Teaching with examples is like **training a new barista in latte art**. You could describe a
rosetta in words ("pour from height, then lower, wiggle, and pull through"), but showing three cups
teaches faster. Show three *identical* hearts and they'll only ever pour hearts. Show a heart, a
rosetta, and a tulip, and they learn the skill behind all three. And if every demo cup was blue,
don't be surprised if they reach for blue cups: details you never meant to teach get copied too.

# Examples

## Example 1 — Basic: one-shot format lock

```text
Turn each product into a one-line tagline in this exact format.

<example>
Product: noise-cancelling headphones
Tagline: Headphones — Silence the world, keep the music.
</example>

Product: insulated water bottle
Tagline:
```

**Why this works:** one example is enough when the goal is a fixed format, not a fuzzy judgment.

## Example 2 — Real-world: extraction with an edge case

```text
Extract the order number and the requested action from each message.
If something is missing, write "unknown". Reply as: order=<value>; action=<value>

<examples>
<example>
Message: "Please cancel order 88123, I ordered the wrong size."
Output: order=88123; action=cancel
</example>
<example>
Message: "Where is my package?? It's been two weeks."
Output: order=unknown; action=track
</example>
<example>
Message: "Can I swap #77410 for the blue one?"
Output: order=77410; action=exchange
</example>
</examples>

Message: "I need a refund for 90155, it arrived broken."
Output:
```

**Why this works:** the second example teaches the fallback for missing data, a case that
instructions alone often fail to pin down.

## Example 3 — Pitfall: unbalanced examples

```text
<examples>
<example>Review: "Amazing!" Label: POSITIVE</example>
<example>Review: "Best purchase ever." Label: POSITIVE</example>
<example>Review: "So good, buying another." Label: POSITIVE</example>
<example>Review: "Meh." Label: NEUTRAL</example>
</examples>
```

**What goes wrong:** no NEGATIVE example at all, and three POSITIVE ones. The model may never answer
NEGATIVE or may over-predict POSITIVE. **Fix:** cover every label, balance them, mix up the order,
and include a hard case (sarcasm, mixed feelings).

# Common Mistakes

- **Examples that are all alike**, which the model over-generalizes from.
- **Missing labels or edge cases** in the examples.
- **Inconsistent formatting** between examples (different spacing, label styles, separators).
- **Examples that contradict the instructions**; the model often follows the examples.
- **Trusting one lucky run** without shuffling or testing on real inputs.

# Best Practices

- Start with **3–5 examples**, then add examples specifically for the cases the model gets wrong.
- Make examples **relevant, diverse, balanced, and consistently formatted**, wrapped in tags.
- Combine examples with a **short definition** of each label or rule.
- **Shuffle and retest** to check that order isn't driving results.
- Keep examples as **data in code** so you can version, balance, and test them.

# Summary

- **Zero-, one-, and few-shot** prompting differ by the number of examples; learning from them is
  **in-context learning**.
- Examples mostly teach the **label space, input distribution, and format**, according to research.
- Use about **3–5** relevant, diverse, balanced, consistently formatted examples in tags.
- Watch for **order effects, label bias, overfitting, and surface-detail leakage**.
- Pair examples with brief definitions, and test on real inputs.

# Flash Cards

Q: What is in-context learning?
A: A model picking up a task from examples inside the prompt, without any change to its weights.

Q: According to Min et al. (2022), what do demonstrations mainly teach?
A: The label space, the distribution of inputs, and the format, more than the specific correct labels.

Q: How many examples does Anthropic's guide suggest?
A: About 3–5, wrapped in example tags.

Q: Why should you shuffle the order of few-shot examples when testing?
A: Order can change results; models can be biased toward answers that appear near the end of the prompt.

Q: What is surface-detail leakage?
A: Names, units, or phrasing from an example showing up in an unrelated answer because the model copied the example's surface.

Q: What's the risk of including too many examples?
A: The model may overfit, copying the examples instead of generalizing, and the prompt costs more.

# Exercises

### Easy
Write a zero-shot and a three-shot version of a classification prompt (for example, sorting emails
into work, personal, and promotions). Run both on ten messages and compare consistency.

### Medium
Take your three-shot prompt and run it with three different example orders. Did any classification
change? Add one hard example for each mistake you find and rerun.

### Challenging
Build a small Python script that keeps examples in a list, generates the few-shot prompt with a
random order, and (with `call_llm` connected) classifies 20 test inputs under five different
shuffles. Report how many test inputs changed label across shuffles, and what that tells you about
your examples.

# Further Reading

- Brown et al., *Language Models are Few-Shot Learners* (2020): <https://arxiv.org/abs/2005.14165>
- Min et al., *Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?* (2022):
  <https://arxiv.org/abs/2202.12837>
- Zhao et al., *Calibrate Before Use: Improving Few-Shot Performance of Language Models* (2021):
  <https://arxiv.org/abs/2102.09690>
- Anthropic — *Prompting best practices* ("Use examples effectively"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Google — *Prompt design strategies* (few-shot examples):
  <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  section 4.2.1 (zero-, one-, and multi-shot prompting).
