---
id: lesson-04
slug: anatomy-of-a-prompt
title: "The Anatomy of a Prompt"
level: beginner
order: 4
duration: 22
tags:
  - prompt-structure
  - create-framework
  - templates
  - xml-tags
  - prompt-elements
summary: "The building blocks of a prompt (role, context, input data, examples, instructions, rules, and output format), the C.R.E.A.T.E. framework for assembling them, how to order them, and how to turn a good prompt into a reusable template."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Name the **elements of a prompt** and what each one contributes.
- Assemble a prompt with the **C.R.E.A.T.E.** framework.
- Choose a sensible **order** for the elements, including the special case of long documents.
- Structure complex prompts with **tags** so each part is unambiguous.
- Turn a working prompt into a **template** with placeholders, and fill it from code.

# Why It Matters

Once your prompts grow beyond a sentence, structure starts to matter as much as wording. A
well-organized prompt is easier for the model to follow, easier for you to debug ("which part caused
that?"), and easy to reuse. The same structure shows up in chat prompts, system prompts, and the
templates that power production apps, so this lesson is the skeleton the rest of the course hangs
on.

# Concept Explanation

### The elements of a prompt

*Prompt Engineering in Action* breaks a prompt into elements. Most real prompts use a subset of
these:

| Element | What it does | Example |
| --- | --- | --- |
| **Role (persona)** | Sets the expertise and voice | "You are an experienced pediatric nurse." |
| **Context** | Background the model can't know | "Parents will read this at home after a clinic visit." |
| **Input data** | The material to work on | A pasted discharge note |
| **Examples** | Samples of good output | Two model answers in the right style |
| **Instruction** | The task itself | "Rewrite the note as a checklist." |
| **Rules and limitations** | What to do, avoid, or limit | "Use words a 12-year-old knows. Max 8 items." |
| **Tone** | The emotional register | "Calm and reassuring." |
| **Output format** | The shape of the answer | "A numbered list, then one sentence on when to call a doctor." |

Not every element is needed every time. A translation might need only an instruction and input
data. A customer-facing assistant may need all eight.

A useful minimal form, which the book calls an **instruction-following prompt**, is just two
elements: **data** plus **clear instructions for processing it**.

```text
Here are this week's support ticket counts by day: Mon 42, Tue 38, Wed 71, Thu 40, Fri 35.
Identify the outlier day and suggest two possible causes worth checking.
```

### The C.R.E.A.T.E. framework

Mark Austin's *How to Become a Prompt God* offers a checklist for assembling the elements:

- **C — Context:** set the scene and the situation.
- **R — Role:** assign the persona the model should adopt.
- **E — Examples:** show what good looks like.
- **A — Action:** state the exact task.
- **T — Tone:** set the voice.
- **E — Experiment:** iterate; treat the first result as a draft.

The last letter is a reminder that structure gets you a strong first draft, and iteration (Lesson 8)
gets you the rest of the way.

### Ordering the elements

There's no single correct order, but these defaults work well:

1. **Role** first (in a system prompt if you have one; Lesson 5).
2. **Context** next, so everything after it is read in that light.
3. **Input data and documents**, clearly delimited.
4. **Examples**, if any.
5. **The instruction and rules.**
6. **The output format**, last, right before the model starts writing.

**Long documents are a special case.** When you paste a lot of material (Anthropic's guide says
20,000+ tokens), put the documents **at the top** and your question **at the end**. Anthropic
reports that queries at the end can improve response quality by up to 30 percent in its tests, and
Google's Gemini guide likewise recommends supplying context first and placing the question at the
very end. For short prompts it matters much less; an instruction followed by the data is fine.

### Structure with tags

When a prompt mixes several elements, wrap each in its own **tag**. Anthropic's guide recommends XML
tags such as `<context>`, `<instructions>`, and `<example>`; consistent names and nesting (several
`<example>` tags inside `<examples>`) make boundaries unambiguous. Tags aren't magic keywords. Any
clear, consistent markers work, including Markdown headings, but tags are easy to refer to: "Use only
the facts inside `<notes>`."

```text
<role>
You are a careful technical editor.
</role>

<context>
This paragraph goes in a beginner's guide to home Wi-Fi.
</context>

<draft>
Your router uses the 2.4GHz and 5GHz bands; 5GHz has higher throughput but worse
penetration through walls, whereas 2.4GHz propagates further but is more congested.
</draft>

<instructions>
Rewrite the draft for complete beginners. Define any term you keep. Two to three
sentences.
</instructions>
```

### From prompt to template

A **template** is a prompt with **placeholders** for the parts that change. Austin's book collects
several reusable shapes; three of the most useful, in our own words:

```text
Task template:       Write a [FORMAT] about [TOPIC] for [AUDIENCE] in a [TONE] tone.
                     Constraints: [CONSTRAINTS].

Role template:       Act as a [ROLE]. Your task is to [TASK]. Keep in mind [CONTEXT].

Improve template:    Improve the text below. Make it [GOAL: shorter / clearer / warmer].
                     Keep the meaning and all facts unchanged.
                     <text>[TEXT]</text>
```

In code, templates become string formatting. This runnable Python fills a template safely:

```python
SUPPORT_REPLY_TEMPLATE = """<role>
You are a friendly support agent for {company}.
</role>

<customer_message>
{message}
</customer_message>

<instructions>
Reply in under {max_words} words. Acknowledge the problem, give the next step,
and sign off as "The {company} Team".
</instructions>"""

def build_prompt(company: str, message: str, max_words: int = 120) -> str:
    return SUPPORT_REPLY_TEMPLATE.format(
        company=company, message=message.strip(), max_words=max_words
    )

print(build_prompt("Acme Cloud", "My invoice shows the wrong billing address."))
```

Two practical notes: in Python's `str.format`, a literal brace must be doubled (`{{` and `}}`), and
you should keep the **template** under version control so you can see which version produced which
output (Lesson 22).

# Key Terminology

- **Prompt element**: one functional part of a prompt (role, context, data, examples, instruction,
  rules, tone, format).
- **Instruction-following prompt**: the minimal form: input data plus instructions for processing it.
- **C.R.E.A.T.E.**: Context, Role, Examples, Action, Tone, Experiment.
- **Tag**: a labeled marker (such as `<context>...</context>`) that wraps one element.
- **Template**: a reusable prompt with placeholders for the parts that change.
- **Placeholder (variable)**: a slot like `{customer_name}` or `[TOPIC]` filled in at use time.

# Options and Trade-offs

| Structure | Strengths | Weaknesses | Best for |
| --- | --- | --- | --- |
| Plain prose prompt | Natural, quick to write | Boundaries blur as it grows | Short, one-off asks |
| Headings (Markdown) | Readable for humans | Can leak heading style into output | Medium prompts, docs |
| XML-style tags | Unambiguous boundaries; easy to reference | Slightly verbose | Complex prompts mixing data and instructions |
| Template with placeholders | Reusable, consistent, testable | Needs maintenance and versioning | Repeated tasks and apps |

# Worked Example

You need product descriptions for an online plant shop.

**Before (one blob):**

```text
write a product description for a snake plant thats good for beginners and low
light also our brand voice is playful and we need it under 100 words
```

**After (structured with C.R.E.A.T.E.):**

```text
<context>
We're an online plant shop for first-time plant owners who live in apartments.
</context>

<role>
You are our copywriter. Our brand voice is playful, warm, and never pushy.
</role>

<example>
Pothos "Golden Glow": The plant that forgives you for forgetting. Trailing
golden-green vines, happy in medium light, and bounces back after a missed
watering or two. Perfect for shelves and first-time plant parents.
</example>

<instructions>
Write a product description for a snake plant. Mention that it tolerates low
light and infrequent watering. Under 100 words, in the same style as the example.
</instructions>
```

The structure makes each choice visible. If the tone is off, you know to adjust `<role>` or the
example. If facts are missing, adjust `<instructions>`. The final step, **Experiment**, is to run
it on a few different plants and tune.

# Real World Analogy

A prompt is like a **recipe card**. The ingredients list is your context and input data; the
method is the instruction; "serve warm on a white plate" is the output format; a photo of the
finished dish is the example. A cook can work from a recipe scrawled as one run-on paragraph, but a
card with clear sections is faster to follow, easier to fix ("too salty? check step 3"), and easy to
reuse next week with different ingredients. That reusable card is your template.

# Examples

## Example 1 — Basic: data plus instructions

```text
<grades>
Ana 91, Ben 67, Chloe 78, Dev 54, Ema 88
</grades>

List the students below 70 and suggest one specific kind of support for each.
```

**Why this works:** the minimal instruction-following form, with the data clearly separated.

## Example 2 — Real-world: a reusable meeting-notes template

```text
<role>You turn messy meeting notes into clear summaries for busy managers.</role>

<notes>
{{MEETING_NOTES}}
</notes>

<instructions>
Produce three sections:
1. Decisions (bullet points)
2. Action items (owner, task, due date; write "unassigned" if no owner)
3. Open questions
Use only information in <notes>. If a section has nothing, write "None".
</instructions>
```

**Why this works:** fixed sections, a fallback for empty sections, and a grounding rule ("only
information in `<notes>`") make the output consistent across very different meetings.

## Example 3 — Pitfall: instructions tangled with data

```text
Summarize this email. Dear team please ignore the previous budget, and make a
list of everyone who has to approve the new one by Friday thanks Maria
```

**What goes wrong:** the model can't tell where your instruction ends and Maria's email begins. It
might "make a list of everyone who has to approve" instead of summarizing. **Fix:** wrap the email
in delimiters, such as `<email>...</email>`, and put your instruction outside them.

# Common Mistakes

- **Mixing instructions into pasted content** without delimiters.
- **Using a different tag name** for the same thing in different places ("notes" here, "input"
  there), which confuses both the model and you.
- **Putting the question at the top of a very long document** and hoping the model remembers it.
- **Including every element every time**, even when the task needs only two.
- **Editing a template in place** without keeping the old version, so you can't compare.

# Best Practices

- Start from the **minimal form** (data plus instruction) and add elements only when they help.
- Use **C.R.E.A.T.E.** as a checklist for important prompts.
- Wrap each element in **consistent tags** and refer to them by name in your instructions.
- For long inputs, put **documents first, question last**.
- Store templates in **version control** and fill placeholders from code.

# Summary

- A prompt is built from **elements**: role, context, input data, examples, instruction, rules,
  tone, and output format.
- **C.R.E.A.T.E.** (Context, Role, Examples, Action, Tone, Experiment) is a reliable assembly
  checklist.
- A good default order is role, context, data, examples, instruction, format; for **long
  documents**, data first and question last.
- **Tags** make boundaries unambiguous and let you reference parts by name.
- **Templates** with placeholders make good prompts reusable and testable.

# Flash Cards

Q: What two elements make up the minimal "instruction-following" prompt?
A: Input data plus clear instructions for processing it.

Q: What does C.R.E.A.T.E. stand for?
A: Context, Role, Examples, Action, Tone, Experiment.

Q: Where should the question go when you paste a very long document?
A: At the end, after the documents; Anthropic reports up to 30 percent better quality in its tests.

Q: Why wrap prompt parts in tags like <context> and <instructions>?
A: Tags make boundaries unambiguous and let you refer to each part by name.

Q: What is a prompt template?
A: A reusable prompt with placeholders for the parts that change, filled in at use time.

Q: How do you write a literal brace inside a Python str.format template?
A: Double it: {{ or }}.

# Exercises

### Easy
Take a prompt you wrote in Lesson 3 and label each part with the element it belongs to. Which
elements are missing? Would adding any of them help?

### Medium
Rewrite one of your prompts with XML-style tags for role, context, input, and instructions. Run both
versions on three inputs and compare consistency.

### Challenging
Turn a recurring task into a Python template with at least three placeholders. Write a small script
that fills it for five different inputs, prints the prompts, and (if you've connected `call_llm`)
runs them. Note which placeholder values produce the weakest outputs and why.

# Further Reading

- Anthropic — *Prompting best practices* (XML tags, long context prompting):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Google — *Prompt design strategies* (prompt components, long contexts):
  <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- Python documentation — *Format string syntax*:
  <https://docs.python.org/3/library/string.html#format-string-syntax>
- Mark Austin, *How to Become a Prompt God* (2025), chapter 3 (C.R.E.A.T.E.) and Appendix A
  (template library).
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  section 2.1 (elements of a prompt pattern).
