---
id: lesson-07
slug: output-formats-and-constraints
title: "Output Formats and Constraints"
level: beginner
order: 7
duration: 22
tags:
  - output-format
  - constraints
  - template-pattern
  - positive-instructions
  - guardrails
summary: "How to get output in exactly the shape you need (lists, tables, templates, machine-readable text), how to phrase constraints so they work (positive instructions, real units, reasons), and how constraints can make output better rather than just shorter."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Specify output shapes: **lists, tables, sections, scripts, and templates**.
- Use the **Template pattern** to make outputs fill a fixed structure.
- Phrase constraints **positively** ("do this") rather than only negatively ("don't do that").
- Set **length** constraints that work, and explain why a token limit isn't a length instruction.
- Write prompts whose output a **program** can reliably check and parse.

# Why It Matters

The right content in the wrong shape still costs you time: you reformat it, copy pieces out, or
write code to clean it up. When output feeds another tool (a spreadsheet, a website, an app), the
shape has to be exact. Format and constraints are where prompts go from "helpful" to "drop-in
ready", and they're also a surprisingly strong lever on quality.

# Concept Explanation

### Name the shape

Say exactly what the output should look like. Useful shapes include:

- **Numbered or bulleted lists**: "a numbered list of 5 steps, one sentence each".
- **Tables**: "a table with columns Feature, Benefit, Example".
- **Sections with headings**: "three sections: Summary, Risks, Next steps".
- **Scripts and dialogue**: "format each line as Speaker: line".
- **Fixed records**: "one line per item: name | price | in_stock".
- **Machine-readable formats** such as JSON or CSV (Lesson 14 covers guaranteed JSON).

If no format is specified, models pick one, often Markdown with headings and bullets, which may not
suit your destination.

### The Template pattern

The **Template pattern** from the prompt-pattern catalog (presented in *Prompt Engineering in
Action*) gives the model a skeleton with placeholders to fill:

```text
Template:
Question: [interview question]
What it tests: [one skill]
Strong answer includes: [two or three points]

Generate four interview questions for a junior data analyst, following the
template exactly. Repeat the template for each question.
```

The book notes the trade-off: a template **limits creativity** in exchange for **consistency and
predictability**. That's exactly what you want for anything you'll scan, compare, or parse.

### Say what to do, not only what not to do

Anthropic's guide puts this first among its formatting tips: **tell the model what to do instead of
what not to do**. "Don't use markdown" names the thing to avoid but not the target; "Write your
answer as smoothly flowing prose paragraphs" describes the destination. The same guide adds two more
tips worth remembering:

- **Match your prompt's style to the output you want.** A prompt full of bullet points and headings
  tends to get bullet points and headings back. Remove markdown from your prompt to get less of it.
- **Be explicit** about the formatting you want when it matters.

Negative constraints still have a place for genuine exclusions ("don't mention competitors by
name"), but pair them with the positive alternative ("refer to them as 'other providers'").

### Constraints that work

Good constraints are **concrete and checkable**:

| Vague | Concrete |
| --- | --- |
| "Keep it short" | "Under 80 words" or "in 3 sentences" |
| "Simple language" | "Words a 12-year-old knows; define any technical term" |
| "Professional" | "Formal, no slang, no exclamation marks" |
| "Don't make stuff up" | "Use only the facts in `<notes>`; if something is missing, write 'not provided'" |

Remember from Lesson 2: ask for **words, sentences, or items**, not tokens. In an API you can also set
a maximum output length in tokens, but that's a **safety cap**: when the model hits it, the response
is simply **cut off**, mid-sentence if necessary. It doesn't make the model write concisely. Ask for
brevity in the prompt, and treat the cap as a guardrail.

### Constraints as creative fuel

Mark Austin's book calls constraints "creative handcuffs": limits often make output **better**, not
just shorter. "Explain inflation" gets a textbook paragraph; "Explain inflation using only a pizza
shop as the example, in 4 sentences" forces a fresh, concrete angle. Format constraints work the
same way: "a haiku", "a two-column comparison", or "a 30-second voicemail script" each push the
model toward focus.

### Output for machines

When code will read the output:

1. **Specify the exact format** and give an example of it.
2. **Ban extras**: "Reply with only the record, no introduction or explanation."
3. **Define the empty case**: what to output if there's nothing to report.
4. **Validate** the output in code, and retry or flag it when it doesn't match.

This runnable Python checks a simple two-line format:

```python
import re

PATTERN = re.compile(r"^Category: (BILLING|TECHNICAL|ACCOUNT|OTHER)\nSummary: .{5,200}$")

def is_valid(output: str) -> bool:
    return bool(PATTERN.match(output.strip()))

print(is_valid("Category: TECHNICAL\nSummary: App logs out after a password change."))  # True
print(is_valid("Sure! Here's the category: Technical."))                                 # False
```

For anything more complex than a few fields, use JSON with schema validation (Lesson 14).

### Guardrails on content and tone

Constraints also set boundaries: topics to stay within, tone to hold, content to exclude. Phrase
them positively where you can ("Keep the discussion to our products and policies; for other topics,
politely say you can only help with Acme orders"). Many platforms also offer separate moderation or
content-filter tools; prompts are one layer of protection, not the only one (Lesson 23).

# Key Terminology

- **Output format**: the required shape of a response (list, table, sections, template, JSON).
- **Template pattern**: giving the model a skeleton with placeholders to fill exactly.
- **Positive instruction**: describing what to do ("write flowing prose") rather than what to avoid.
- **Constraint**: a concrete limit on length, vocabulary, tone, content, or format.
- **Output token limit (max tokens)**: an API setting that truncates the response when reached.
- **Validation**: checking in code that output matches the expected format before using it.

# Options and Trade-offs

| Technique | Strength | Weakness | Use when |
| --- | --- | --- | --- |
| Describe the format in words | Quick | Model may interpret loosely | Simple shapes for humans |
| Show one example of the format | Very precise | Model may copy example content | Exact layouts |
| Template pattern | Highly consistent | Less creative | Reports, records, repeated outputs |
| Regex or parser validation | Catches drift | Needs code and a retry plan | Output feeds a program |
| Structured outputs feature (Lesson 14) | Guaranteed schema | Provider-specific | Production JSON |

# Worked Example

You want a weekly status update your team can skim in Slack.

**First attempt:**

```text
Write a status update from these notes. Make it short and not boring.
<notes>
- API migration 80% done, blocked on auth team review
- New hire Priya starts Monday
- Demo moved to Thursday 3pm
- Bug count down from 41 to 23
</notes>
```

The result is a cheerful paragraph with headings and emoji, longer than the notes.

**Refined:**

```text
Turn the notes below into a status update for our team's chat channel.

Format exactly like this, with no introduction or sign-off:
Done: <one line>
In progress: <one line, include any blocker>
Upcoming: <one line>
Number of the week: <one line>

Each line under 15 words. Plain text, no emoji, no markdown.
Use only facts from <notes>; if a line has no facts, write "Nothing new".

<notes>
- API migration 80% done, blocked on auth team review
- New hire Priya starts Monday
- Demo moved to Thursday 3pm
- Bug count down from 41 to 23
</notes>
```

What changed: an exact **template**, a **length** per line in words, a **positive** description of
the style, a **grounding rule**, and a defined **empty case**.

# Real World Analogy

Asking for output without a format is like **asking a friend to bring "some food" to a potluck**.
You'll get something, but maybe three desserts and no main course. Asking for "a vegetarian main
that serves eight, in a dish we can reheat" is a constraint, and it doesn't stifle your friend's
cooking. It points it. Good format and constraints work the same way: they don't limit quality,
they aim it.

# Examples

## Example 1 — Basic: a comparison table

```text
Compare renting and buying a home for a first-time buyer in a table with
columns: Factor, Renting, Buying. Include 6 rows: upfront cost, monthly cost,
flexibility, maintenance, building equity, and risk. Keep each cell under 12 words.
```

**Why this works:** named columns, named rows, and a per-cell limit give a scannable, complete result.

## Example 2 — Real-world: a fill-in template for product specs

```text
Fill in this template for the product described in <description>.
If a field isn't mentioned, write "not stated".

Name:
Dimensions:
Weight:
Materials:
Warranty:
Best for:

<description>
The TrailLite backpack weighs 1.1 kg, is made of recycled nylon, and has a
lifetime warranty. Great for weekend hikes.
</description>
```

**Why this works:** the template fixes the fields and order, and the "not stated" rule prevents
invented dimensions.

## Example 3 — Pitfall: only negative constraints

```text
Describe our hotel. Don't be generic. Don't use clichés. Don't make it long.
Don't use markdown.
```

**What goes wrong:** four "don'ts" and no target. The model still has to guess the audience, length,
and style, and may produce markdown anyway because the prompt never described the alternative.
**Fix:**

```text
Describe our hotel in one 60-word paragraph of plain prose for business
travelers, focusing on the quiet rooms, the 24-hour gym, and the 5-minute walk
to the convention center.
```

# Common Mistakes

- **Leaving the format unspecified** when the output goes somewhere specific.
- **Writing only "don'ts"** without describing the desired result.
- **Measuring length in tokens** or relying on a token cap to make answers short.
- **No empty case**, so the model invents content to fill a required field.
- **No validation** in code that consumes model output.

# Best Practices

- Name the **exact shape** and, for precise layouts, show it.
- Use the **Template pattern** for anything repeated or compared.
- Phrase constraints **positively and concretely**, with reasons when helpful.
- Define what to output when **information is missing**.
- **Validate** machine-read output and plan a retry or fallback.

# Summary

- Always **name the output shape**: list, table, sections, script, template, or machine format.
- The **Template pattern** trades some creativity for consistency.
- **Say what to do**, match your prompt's style to the output, and keep negative rules for real
  exclusions.
- Use **concrete, checkable** constraints; a token limit **truncates**, it doesn't shorten.
- Constraints can **improve** output, and machine-read output needs an **empty case and
  validation**.

# Flash Cards

Q: What is the Template pattern?
A: Giving the model a skeleton with placeholders and asking it to fill the template exactly, trading creativity for consistency.

Q: How does Anthropic suggest phrasing formatting instructions?
A: Tell the model what to do instead of what not to do, for example "write flowing prose paragraphs" instead of "don't use markdown".

Q: Why does matching your prompt's style to the desired output help?
A: The formatting style of the prompt tends to influence the response; a prompt full of bullets tends to get bullets back.

Q: What happens when a response hits the output token limit?
A: It's cut off, possibly mid-sentence; the limit is a safety cap, not an instruction to be concise.

Q: Why define an "empty case" in a format?
A: So the model writes something like "not stated" instead of inventing content to fill a required field.

Q: What should code do with model output it will parse?
A: Validate it against the expected format and retry or flag it if it doesn't match.

# Exercises

### Easy
Ask for the same information (for example, three tips for better sleep) as a paragraph, a numbered
list, and a table. Which format would you actually use, and for what?

### Medium
Rewrite a prompt that uses only negative constraints into one that uses positive, concrete
constraints. Run both five times and compare how often each output matches what you wanted.

### Challenging
Write a template-based prompt whose output a program will read (for example, extracting meeting
details into fixed fields). Write a validation function in Python, run the prompt on ten varied
inputs, and record how many outputs pass. Improve the prompt until at least nine pass.

# Further Reading

- Anthropic — *Prompting best practices* ("Control the format of responses"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — *Prompt engineering* guide: <https://platform.openai.com/docs/guides/prompt-engineering>
- White et al., *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2023), the
  Template pattern: <https://arxiv.org/abs/2302.11382>
- Mark Austin, *How to Become a Prompt God* (2025), chapters 3 and 6 (constraints, forcing formats,
  guardrails).
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  section 2.7.2 (Template pattern).
