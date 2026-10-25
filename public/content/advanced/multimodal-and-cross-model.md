---
id: lesson-20
slug: multimodal-and-cross-model
title: "Multimodal and Cross-Model Prompting"
level: advanced
order: 20
duration: 26
tags:
  - multimodal
  - vision
  - image-generation
  - model-selection
  - portability
summary: "Prompting beyond plain text (images, documents, audio, and image generation) and across models: why the same prompt behaves differently on different models, how to write portable prompts, how to choose and combine models, and how to migrate prompts when models change."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Write effective prompts that include **images and documents**, and know where vision goes wrong.
- Structure prompts for **image-generation** models.
- Explain why the **same prompt** gives different results on different models.
- Write **portable** prompts and keep **model-specific variants** when needed.
- **Choose, combine, and migrate** between models with testing rather than folklore.

# Why It Matters

Many real tasks aren't text-only: reading a receipt, describing a chart, checking a screenshot,
designing a banner. And you'll rarely use just one model for life. Teams switch vendors, upgrade to
new versions, and mix cheap and powerful models in one system. Prompts that worked beautifully on one
model can degrade quietly on another. Knowing how to prompt across modalities and models, and how to
test the difference, keeps your work robust.

# Concept Explanation

### Prompting with images and documents

Many models accept **images** and **documents** (such as PDFs) alongside text. The prompting
principles are the same as for text, plus a few specifics:

- **Say what to look at.** "Describe this image" gets a generic caption. "Read the total, the date,
  and the merchant name from this receipt" gets data.
- **Label multiple images** and refer to them by label: "Image 1 is the old design, image 2 the
  new one. List every visible difference."
- **Describe, then analyze.** For complex visuals, ask the model to first describe what it sees
  (axes, labels, values), then draw conclusions. Errors in the description become visible before
  they turn into wrong conclusions.
- **Verify extracted text and numbers.** Reading text from images can introduce errors (a 7 read as
  a 1, a decimal point missed). Validate totals and cross-check critical values.
- **Mind resolution and cropping.** Tiny text in a large screenshot is hard to read; crop to the
  relevant area when you can.

```text
<image 1: a photo of a restaurant receipt>

From this receipt, extract: merchant name, date, each line item with price,
tax, and total. Reply as JSON. If any value is unreadable, use null and add the
field name to an "unreadable" list. Then check whether the line items plus tax
equal the total, and set "totals_match" to true or false.
```

### Prompting image-generation models

Text-to-image models (the source books mention DALL-E and Stable Diffusion) respond to a different
prompt style: descriptive rather than instructional. Useful ingredients:

- **Subject**: who or what, doing what.
- **Setting**: where and when.
- **Style and medium**: watercolor, flat vector illustration, 35mm photo, isometric 3D.
- **Composition**: close-up, wide shot, centered, rule of thirds, top-down.
- **Lighting and color**: soft morning light, high contrast, pastel palette.
- **Constraints**: aspect ratio, "no text in the image", empty space for a headline.

```text
A flat vector illustration of a small greenhouse on a city rooftop at sunrise,
plants in recycled containers, soft pastel palette, wide shot with empty sky on
the left for a headline, no text or logos in the image.
```

A common workflow from Mark Austin's book is **output chaining** across models: a language model
drafts the scene descriptions, and an image model renders them. The same ethics apply as in Lesson 5,
with higher stakes: don't generate realistic images of real people doing things they didn't do, and
respect trademarks and artists' rights under your platform's terms.

### Why the same prompt differs across models

Models differ in their training data, tuning, tokenizers, context limits, default formatting,
refusal behavior, and whether they reason internally. *Prompt Engineering in Action* demonstrates
this by sending one coding prompt to two different assistants and getting answers of very different
quality, then engineering the prompt (naming the exact libraries, saying what it did *not* want)
until the weaker one improved. It also notes that **domain-tuned** models (for example, a
cybersecurity-tuned model) interpret ambiguous words like "virus" in their domain's sense.

Vendors' own guides also differ in emphasis: Anthropic's guide leans on XML tags for structure;
Google's Gemini guide recommends always including few-shot examples; OpenAI's guide covers Markdown
and XML formatting and message roles. None of these are contradictions, but they're reminders that
"the best prompt" is partly model-specific.

Be wary of personality folklore ("model X is the creative one, model Y the philosopher"), including
the light-hearted characterizations in Austin's book. Models change with every release. **Test**
instead of assuming.

### Writing portable prompts

Prompts that travel well across models share these traits:

- **Explicit task, context, and output format** (Lessons 3-7), rather than reliance on a model's
  defaults.
- **Clear delimiters** (tags or headings) around inputs.
- **Examples** for anything format-sensitive.
- **Validation in code** (Lesson 14), so a model that drifts is caught rather than trusted.
- **No vendor-only tricks** in the shared core (for example, techniques a vendor has since removed,
  such as prefill on current Claude models).

When a model genuinely needs something different, keep a **base prompt plus model-specific
variants**, and record why each variant exists.

### Choosing models

Pick models by testing on **your** task, weighing:

| Factor | Question to ask |
| --- | --- |
| Quality | Does it pass my test set? |
| Cost | What does a completed task cost, including retries? |
| Latency | Is it fast enough for the user experience? |
| Context | Does my input fit comfortably? |
| Modalities | Does it accept the images, documents, or audio I need? |
| Data and privacy | Where is data processed and retained? Is an on-premises or open-weight model required? |
| Features | Tool use, structured outputs, reasoning modes, caching? |

Open-weight models you can run yourself offer control and privacy at the cost of running
infrastructure; Austin's book also notes they may need more explicit, hand-holding prompts.

### Combining models

- **Routing**: a cheap, fast model classifies requests; hard ones go to a stronger model.
- **Cascades**: try a cheaper model first and escalate when validation fails or confidence is low.
- **Specialists**: different models (or modalities) for different steps of a chain.
- **Cross-checking**: a second model reviews the first model's output (Lesson 22 covers judge
  biases).

Each extra model adds integration work, inconsistency, and **privacy surface**: Austin's book warns
against piping sensitive data through many models and recommends telling users which models a product
uses.

### Migrating prompts when models change

Model upgrades can break prompts in both directions: a newer model may follow instructions **more
literally**, react more strongly to emphatic language, or no longer support a parameter. Anthropic's
guide, for example, notes that newer models are more responsive to the system prompt, so aggressive
instructions written for older models ("CRITICAL: You MUST...") can cause over-triggering. A safe
migration routine:

1. Run your **test set** on the old and new model with the old prompt.
2. Read the vendor's **migration notes** (removed parameters, changed defaults).
3. **Simplify** before adding: remove workarounds the old model needed.
4. Re-run, compare, and only then switch traffic.

This small harness runs one prompt through several model functions (each wrapping a different
provider or model) and prints the results side by side:

```python
from typing import Callable

def compare_models(prompt: str, models: dict[str, Callable[[str], str]]) -> None:
    for name, call in models.items():
        try:
            output = call(prompt)
        except Exception as err:          # one failing provider shouldn't stop the comparison
            output = f"ERROR: {err}"
        print(f"=== {name} ===\n{output}\n")

# Each entry would wrap a real client, for example a call_llm variant per provider.
compare_models(
    "Classify as BILLING, TECHNICAL, or OTHER. Reply with the label only:\n"
    "'I was charged twice this month.'",
    {"model_a": lambda p: "BILLING", "model_b": lambda p: "Billing issue."},
)
```

Notice what model B's stub illustrates: the same prompt can return a label in a different format,
which is exactly why validation belongs in code.

# Key Terminology

- **Multimodal model**: a model that accepts (or produces) more than one modality, such as text and
  images.
- **Vision prompting**: prompting a model about images or documents it can see.
- **Text-to-image model**: a model that generates images from descriptive text prompts.
- **Output chaining**: passing one model's output as the input to another.
- **Portable prompt**: a prompt that works across models because it relies on explicit structure
  rather than model defaults.
- **Routing / cascade**: sending requests to different models by difficulty, or escalating when a
  cheaper model fails.
- **Prompt migration**: re-testing and adjusting prompts when moving to a new model or version.

# Options and Trade-offs

| Strategy | Strength | Cost | Use when |
| --- | --- | --- | --- |
| One model for everything | Simplest | May overpay or underperform | Small apps, early stages |
| Routing by difficulty | Saves cost on easy requests | Router errors | Mixed easy and hard traffic |
| Cascade with validation | Pays more only when needed | Latency on escalations | Validation can detect failure |
| Specialist models per step | Best tool per job | Integration and consistency work | Multimodal or diverse pipelines |
| Open-weight self-hosted | Control and privacy | Infrastructure, tuning | Strict data requirements |

# Worked Example

An expense app reads receipt photos and categorizes the expense.

**v1:** one prompt, "What's this receipt? Categorize it." Results vary: some answers are prose, some
miss the total, and blurry receipts produce invented amounts.

**v2 (vision prompt plus validation):**

1. A structured extraction prompt (like the receipt example above) with null for unreadable fields.
2. Code checks that line items plus tax equal the total; mismatches go to the user for confirmation.
3. A cheap text model categorizes the extracted merchant and items with an enum schema.

**v3 (cross-model):** the team tests two vision-capable models on 100 real receipts. Model A reads
blurry text better; model B is cheaper and equally good on clear photos. They route by image quality
(a simple blur score computed in code) and keep the validation step for both. When model A's next
version ships, the same 100 receipts become the migration test set.

# Real World Analogy

Prompting different models is like **cooking the same recipe in different ovens**. A good recipe
(clear steps, exact quantities, a picture of the result) works in almost any kitchen, but one oven
runs hot and another bakes unevenly, so experienced bakers test a batch and adjust the time instead
of trusting the recipe blindly. When you buy a new oven, you don't throw out the recipe; you bake a
test batch first. Your test set is that test batch.

# Examples

## Example 1 — Basic: a focused image question

```text
<image: a bar chart of monthly sales>

First, list the month labels and the approximate value of each bar. Then tell me
which month had the largest increase over the previous month.
```

**Why this works:** describe-then-analyze makes reading errors visible before the conclusion.

## Example 2 — Real-world: an image-generation brief from a language model

```text
Write 3 image-generation prompts for a blog header about saving energy at home.
Each prompt must specify subject, setting, style, composition, lighting, and
"no text in the image". Make the three visually different from each other.
```

**Why this works:** the language model does the creative variety; the required ingredients keep each
prompt usable by an image model.

## Example 3 — Pitfall: assuming portability

A team builds a prompt on one model that relies on that model's habit of answering with a bare label.
After switching providers, answers come back as "The category is: Billing." and the downstream code
breaks.

**What goes wrong:** the prompt relied on a default, not an instruction. **Fix:** state the format
explicitly, show an example, use structured outputs or validation, and run the test set before any
model switch.

# Common Mistakes

- **Vague image prompts** ("describe this") when you need specific data.
- **Trusting numbers read from images** without validation.
- **Relying on a model's defaults** instead of explicit instructions, which breaks on migration.
- **Choosing models by reputation** instead of by your own test set.
- **Piping sensitive data through many providers** without need or disclosure.

# Best Practices

- Tell vision models **exactly what to look at**, label multiple images, and **describe before
  analyzing**.
- Structure image-generation prompts by **subject, setting, style, composition, lighting, and
  constraints**.
- Keep a **portable base prompt** with explicit formats and examples, plus documented variants.
- **Choose and route** models with data from your own test set, counting cost per completed task.
- Treat every model change as a **migration**: test, read the notes, simplify, re-test.

# Summary

- **Multimodal prompts** follow the same principles plus specifics: say what to look at, label
  images, describe then analyze, verify extracted values.
- **Image-generation prompts** are descriptive: subject, setting, style, composition, lighting,
  constraints.
- The **same prompt behaves differently** across models; test rather than trusting folklore.
- **Portable prompts** rely on explicit structure, examples, and code validation.
- **Choose, combine, and migrate** models with your test set; route and cascade where it saves cost.

# Flash Cards

Q: Why ask a vision model to describe an image before analyzing it?
A: Reading errors become visible in the description before they turn into wrong conclusions.

Q: What ingredients make a strong image-generation prompt?
A: Subject, setting, style or medium, composition, lighting and color, and constraints such as aspect ratio or "no text".

Q: Why do prompts behave differently on different models?
A: Models differ in training data, tuning, tokenizers, context limits, default formatting, refusal behavior, and reasoning modes.

Q: What makes a prompt portable across models?
A: Explicit task, context, and format; clear delimiters; examples; and validation in code instead of reliance on defaults.

Q: What is a model cascade?
A: Trying a cheaper model first and escalating to a stronger one when validation fails or confidence is low.

Q: What's the first step when migrating a prompt to a new model?
A: Run your test set on both the old and new model with the existing prompt, so you can see what changed.

# Exercises

### Easy
Take a photo of a printed document or receipt. Ask a vision-capable model to extract specific
fields, once with "describe this" and once with a structured extraction prompt. Check every value.

### Medium
Write image-generation prompts for the same concept in three different styles. Generate them (if you
have access) and note which ingredients changed the result most.

### Challenging
Pick a prompt you rely on and run it through two or three different models with a ten-input test set
using the `compare_models` harness pattern. Score the outputs. Identify one instruction you had to
make explicit for portability, and document any model-specific variant you decided to keep.

# Further Reading

- Anthropic — *Prompting best practices* (vision, migration considerations):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Google — *Prompt design strategies*: <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- OpenAI — *Prompt engineering* guide: <https://platform.openai.com/docs/guides/prompt-engineering>
- Schulhoff et al., *The Prompt Report* (2024), which also surveys prompting techniques for
  modalities beyond text: <https://arxiv.org/abs/2406.06608>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 1.5, 1.7, and 5.7.
- Mark Austin, *How to Become a Prompt God* (2025), chapters 8 and 13 (cross-model engineering,
  multimodal prompting).
