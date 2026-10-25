---
id: lesson-09
slug: prompt-pattern-catalog
title: "The Prompt Pattern Catalog"
level: intermediate
order: 9
duration: 26
tags:
  - prompt-patterns
  - meta-language
  - recipe-pattern
  - outline-expansion
  - semantic-filter
summary: "Prompt patterns as reusable solutions to recurring problems: the six categories of the catalog by White and colleagues, a map of seventeen patterns, deep dives into Meta Language Creation, Recipe, Outline Expansion, Semantic Filter, and Infinite Generation, and how to combine patterns safely."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what a **prompt pattern** is and how it differs from a prompting **technique**.
- Name the **six categories** of the prompt-pattern catalog and place patterns in them.
- Apply **Meta Language Creation**, **Recipe**, **Outline Expansion**, **Semantic Filter**, and
  **Infinite Generation**, including their limits.
- **Combine** patterns into a single prompt without them fighting each other.

# Why It Matters

Many prompting problems repeat: "the answer isn't in the shape I need", "the model doesn't ask
before assuming", "I keep typing the same instructions". Patterns give those recurring problems
names and reusable solutions, the way design patterns do in software. Once you know them, you stop
reinventing prompts and start assembling them, and you can explain to teammates *why* a prompt is
built the way it is.

# Concept Explanation

### What a prompt pattern is

In 2023, Jules White and colleagues at Vanderbilt published *A Prompt Pattern Catalog to Enhance
Prompt Engineering with ChatGPT*. They describe prompt patterns as a knowledge-transfer method
**analogous to software patterns**: reusable solutions to common problems in a particular context.
The paper catalogs 16 patterns. *Prompt Engineering in Action* builds two chapters on them,
giving each pattern a **format** (a fill-in-the-blanks template) and examples, and adds a few
patterns that aren't in the original paper, such as Audience Persona, Outline Expansion, and
Semantic Filter.

The same book draws a useful distinction:

- A **pattern** is a reusable *structure* for a prompt ("Act as X. Do Y." is the Persona pattern).
- A **technique** is *how* you interact with the model using that structure (zero-shot, few-shot,
  chain-of-thought, chaining). You can use the Persona pattern zero-shot or few-shot.

### The six categories

The paper groups its patterns by the problem they solve:

| Category | Problem it solves |
| --- | --- |
| **Input Semantics** | How the model interprets what you type |
| **Output Customization** | The form, structure, or perspective of the output |
| **Error Identification** | Finding and correcting errors in outputs |
| **Prompt Improvement** | Making the prompt itself, its inputs, or its questions better |
| **Interaction** | How the conversation flows between you and the model |
| **Context Control** | What context the model works with |

### A map of the patterns in this course

| Pattern | Category | Format in brief | Covered in |
| --- | --- | --- | --- |
| Persona | Output Customization | Act as X. Do Y. | Lesson 5 |
| Audience Persona † | Output Customization | Explain X. Assume I am Y. | Lesson 5 |
| Template | Output Customization | Fill this skeleton exactly | Lesson 7 |
| Outline Expansion † | Output Customization | Outline X, then ask which point to expand | This lesson |
| Recipe | Output Customization | Task, inputs, steps, examples, criteria | This lesson |
| Semantic Filter † | Output Customization | Remove X from the text, keeping meaning | This lesson |
| Meta Language Creation | Input Semantics | When I say X, I mean Y | This lesson |
| Question Refinement | Prompt Improvement | Suggest a better version of my question | Lesson 8 |
| Alternative Approaches | Prompt Improvement | List and compare other ways to do X | Lesson 8 |
| Cognitive Verifier | Prompt Improvement | Ask sub-questions, then combine answers | Lesson 10 |
| Refusal Breaker | Prompt Improvement | If you can't answer, explain why and suggest alternatives | Lesson 23 |
| Flipped Interaction | Interaction | Ask me questions until you can do X | Lesson 10 |
| Game Play | Interaction | Run a game about X with these rules | Lesson 10 |
| Infinite Generation | Interaction | Keep generating X until I say stop | This lesson |
| Reflection | Error Identification | Explain your reasoning and assumptions | Lesson 12 |
| Fact Check List | Error Identification | List the facts the answer depends on | Lesson 12 |
| Context Manager | Context Control | Within this scope, consider X and ignore Y | Lesson 16 |

† From *Prompt Engineering in Action* rather than the original paper; the categories shown for
these follow the book. The paper's two remaining patterns aren't covered separately here: **Output
Automater** (when an answer involves steps, also produce a script that automates them) and
**Visualization Generator** (produce input for a diagramming or image tool).

### Meta Language Creation: your own shorthand

**Problem:** you keep typing the same long instruction. **Pattern:** define a shorthand once, then
use it.

```text
For the rest of this conversation, when I start a message with "#brief", rewrite
the text that follows as three bullet points of at most 12 words each, for a
busy executive. When I start with "#es", translate the text into neutral Latin
American Spanish and keep any product names in English.
```

After that, "#brief [long email]" does the whole job. The book's format: *When I say [X], I mean [Y].*

Limits to know:

- The shorthand lives **only in this conversation's context**. A new chat, or a long chat that
  loses its beginning, forgets it. For permanent shortcuts, put definitions in a system prompt or
  project instructions.
- Choose symbols that **can't appear by accident** in normal text, and avoid ambiguous ones.
- Don't use shorthand to request things a model is bad at. The book's example has the model
  generate passwords, but a language model is **not a secure random generator**; use a
  cryptographic tool such as Python's `secrets` module for passwords and keys.

### Recipe: partial steps, filled in

**Problem:** you know roughly how a task should go but not every step, or you want a structured,
complete procedure. **Pattern:** give the task, the inputs, the steps you know, examples, and how the
result will be judged; let the model fill in the rest.

```text
Task: Write a 400-word onboarding guide for new volunteers at a food bank.
Inputs: our shift times (8am, 1pm), the check-in desk location, safety rules.
Steps I know: 1) arrival and check-in, 2) safety briefing, 3) station assignment.
Fill in any missing steps a first-time volunteer would need.
Example tone: "Welcome! You're about to make someone's week better."
Success criteria: a first-timer could follow it without asking anyone; under 400 words.
```

*Prompt Engineering in Action* contrasts three related ideas: a **Template** only fills slots; a
**Recipe** produces a detailed result from an outline of steps; an **agent** (Lesson 19) chooses
its own steps at run time. Recipes are fixed sequences, which makes them simpler and more
predictable than agents.

### Outline Expansion: big documents, one section at a time

**Problem:** long documents generated in one go come out shallow. **Pattern:** generate an outline,
then expand the parts you choose.

```text
Act as an experienced technical writer. Create a bullet-point outline for a
beginner's guide to home networking. Then ask me which bullet to expand. When I
pick one, expand it into its own detailed sub-outline, and ask again.
```

This keeps you in control of structure and depth, and each expansion gets the model's full
attention. Combine it with **Persona** (as above) for expertise and tone, and check facts in the
expanded sections, since outlines can sound authoritative while being wrong.

### Semantic Filter: remove information, keep meaning

**Problem:** text contains information you must remove (personal data, internal names, profanity)
but the rest must stay intact. **Pattern:** name what to remove, the rules, and the exceptions, and
ask for minimal changes.

```text
Rewrite the support transcript below for use as a public training example.
Remove: customer names, email addresses, phone numbers, street addresses, and
order numbers. Replace each with a bracketed label such as [NAME] or [EMAIL].
Keep: the agent's first name, product names, and everything else exactly as
written. Do not summarize or reword anything that isn't removed.

<transcript>...</transcript>
```

The book's format: *Filter the input to remove [X], following rules [Y], with exceptions [Z].*
Two cautions: the book itself warns that without explicit rules the model may **change other
content**, so say "change nothing else"; and model-based redaction can **miss** items. For legal or
compliance redaction, pair it with deterministic tools (pattern matching for emails and phone
numbers) and human review.

### Infinite Generation: keep producing

**Problem:** you want a stream of items (names, quiz questions, ideas) without re-prompting each
time. **Pattern:** set the rules once and say to continue until you say stop.

```text
Generate names for fantasy villages, 10 at a time. Each should be easy to
pronounce and sound like it belongs in a cold, mountainous region. No repeats.
After each batch, wait. When I type "more", give 10 new ones. When I type
"stop", list your three favorites so far.
```

Be realistic about what "infinite" means: each response still ends, and the model continues only
when you send another message. Over a long session the context grows, early rules can fade, and
**repetition** creeps in. Restate the rules occasionally, or generate in code with fresh calls.

### Combining patterns

Patterns compose. *Prompt Engineering in Action* shows combinations such as Persona + Outline
Expansion, Template + Infinite Generation (a story told chapter by chapter in a fixed format), and
Game Play + Infinite Generation (a trivia game that keeps score until you stop). When combining:

- Make sure the patterns **don't contradict** (a strict Template and a "be creative" Persona pull
  in different directions; say which wins).
- Keep each pattern's instruction **in its own sentence or tag**, so you can remove one cleanly.
- Test the combination; interactions between patterns aren't always obvious.

Patterns are just text, so you can keep them as small reusable pieces in code:

```python
PATTERNS = {
    "persona": "Act as {role}.",
    "outline_expansion": (
        "Create a bullet-point outline on {topic}, then ask me which bullet to expand."
    ),
    "question_refinement": (
        "Before answering any question, suggest a better version of it and ask "
        "whether I want to use it."
    ),
}

def compose(*parts: str, **values: str) -> str:
    return "\n".join(PATTERNS[p].format(**values) for p in parts)

print(compose("persona", "outline_expansion",
              role="an experienced technical writer", topic="home networking"))
```

# Key Terminology

- **Prompt pattern**: a named, reusable prompt structure that solves a recurring problem.
- **Prompting technique**: a way of interacting with the model (zero-shot, few-shot, CoT, chaining)
  that can use any pattern.
- **Meta Language Creation**: defining shorthand that the model should interpret in a set way.
- **Recipe pattern**: providing a task, inputs, partial steps, examples, and success criteria.
- **Outline Expansion**: generating an outline, then expanding chosen sections on request.
- **Semantic Filter**: removing specified information while preserving the rest of the meaning.
- **Infinite Generation**: setting rules once and continuing a stream of outputs until told to stop.

# Options and Trade-offs

| Pattern | Biggest benefit | Main limitation | Pair it with |
| --- | --- | --- | --- |
| Meta Language Creation | Saves typing; consistent actions | Forgotten outside the conversation | System prompt for permanence |
| Recipe | Complete, structured procedures | Fixed steps; can over-specify | Template for the final format |
| Outline Expansion | Depth on long documents; you steer | Many turns; outline may be wrong | Persona; fact checking |
| Semantic Filter | Fast cleanup of sensitive content | Can miss items or alter text | Deterministic checks, human review |
| Infinite Generation | Streams of ideas or questions | Repetition; fading rules | Template; periodic rule restatement |

# Worked Example

You're preparing a workshop handout on spotting phishing emails.

**Step 1 (Persona + Outline Expansion):**

```text
Act as a security awareness trainer who writes for non-technical office staff.
Create a bullet-point outline for a two-page handout on spotting phishing
emails. Then ask me which bullet to expand.
```

**Step 2:** you pick "Red flags in the sender's address". The model expands it into specific,
checkable signs.

**Step 3 (Template for consistency):**

```text
For each red flag in the expanded section, use this template:
Red flag: <short name>
What it looks like: <one concrete example>
What to do: <one action>
```

**Step 4 (Semantic Filter before sharing):** you paste a real phishing email your company received
as an example and filter it:

```text
Remove our employees' names and email addresses from the email below, replacing
them with [EMPLOYEE] and [EMAIL]. Change nothing else.
```

Four patterns, each doing one job, assembled into a handout you control section by section.

# Real World Analogy

Prompt patterns are like **chess openings**. Players don't invent their first ten moves from
scratch every game; they know named, tested sequences (the Sicilian, the Queen's Gambit), each
suited to a situation, and they adapt them as the game unfolds. Knowing the openings doesn't
replace thinking, but it frees your attention for the parts of the game that are actually new.
Patterns do the same for prompts.

# Examples

## Example 1 — Basic: Meta Language Creation

```text
In this chat, when I write "->table" after some text, convert that text into a
two-column table (Item, Detail). When I write "->plain", rewrite it in plain
language for a 12-year-old.
```

**Why this works:** two clear triggers that won't appear by accident, each mapped to one action.

## Example 2 — Real-world: Recipe for a repeatable process

```text
Task: Create a pre-launch checklist for publishing a blog post on our company site.
Known steps: proofread, add alt text to images, check links, schedule the post.
Fill in any missing steps a careful editor would include, in the right order.
Format: a numbered checklist with one line per step and an owner role in brackets.
Success criteria: nothing that commonly goes wrong is missing; under 15 steps.
```

**Why this works:** the model fills gaps (SEO title, preview check, legal review for claims) inside a
structure and quality bar you set.

## Example 3 — Pitfall: an under-specified Semantic Filter

```text
Remove the private stuff from this document.
```

**What goes wrong:** "private stuff" isn't defined, there are no exceptions, and nothing says to
leave the rest untouched, so the model may remove too little, too much, or quietly reword
sentences. **Fix:** list exactly what to remove, what to keep, how to mark removals, and "change
nothing else", then verify the result.

# Common Mistakes

- **Treating patterns as magic phrases.** They work because they supply missing structure, not
  because of special wording.
- **Relying on Meta Language shorthand across chats.** Put durable shortcuts in standing
  instructions.
- **Trusting a Semantic Filter for compliance** without deterministic checks and review.
- **Expecting truly infinite generation** without repetition or drift.
- **Combining contradictory patterns** without saying which one wins.

# Best Practices

- Identify the **problem** first, then pick the pattern that targets it.
- Keep each pattern as a **separate sentence or tag** so prompts stay modular.
- Store common patterns as **reusable snippets** (text or code) in your prompt library.
- Add **verification** to any pattern that produces facts (Outline Expansion, Recipe).
- Revisit long pattern-driven sessions: **restate rules** or start fresh when quality drifts.

# Summary

- A **prompt pattern** is a reusable structure for a recurring problem; a **technique** is how you
  interact with the model.
- White and colleagues' catalog has six categories: **Input Semantics, Output Customization, Error
  Identification, Prompt Improvement, Interaction, Context Control**.
- **Meta Language Creation** defines shorthand; **Recipe** fills in a partial procedure; **Outline
  Expansion** builds long documents section by section.
- **Semantic Filter** removes specified content while preserving meaning, with deterministic checks
  for anything sensitive; **Infinite Generation** streams outputs until you stop it.
- Patterns **compose**; keep them modular and resolve conflicts explicitly.

# Flash Cards

Q: What is a prompt pattern?
A: A named, reusable prompt structure that solves a recurring problem, analogous to a software design pattern.

Q: What's the difference between a pattern and a technique?
A: A pattern is a reusable prompt structure; a technique (zero-shot, few-shot, CoT, chaining) is how you interact with the model using it.

Q: What are the six categories in White et al.'s catalog?
A: Input Semantics, Output Customization, Error Identification, Prompt Improvement, Interaction, and Context Control.

Q: What is the format of the Meta Language Creation pattern?
A: "When I say [X], I mean [Y]" — a shorthand the model interprets in a defined way within the conversation.

Q: How does a Recipe differ from a Template and from an agent?
A: A Template fills fixed slots; a Recipe produces a detailed result from partial steps; an agent chooses its own steps at run time.

Q: What two cautions apply to the Semantic Filter pattern?
A: Tell the model to change nothing else, and don't rely on it alone for compliance; add deterministic checks and human review.

# Exercises

### Easy
Define two Meta Language shortcuts for tasks you repeat (for example, "#fix" for proofreading and
"#tldr" for a two-line summary). Use them for a day. Note when they broke and why.

### Medium
Use Outline Expansion with a Persona to build a three-page guide on a topic you know well. Expand
three sections. Mark every factual claim you had to correct.

### Challenging
Build a small Python "pattern library" with at least five patterns as reusable snippets and a
`compose` function. Create three combined prompts from it, run them, and document one conflict
between patterns you had to resolve and how.

# Further Reading

- White et al., *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2023):
  <https://arxiv.org/abs/2302.11382>
- Schulhoff et al., *The Prompt Report: A Systematic Survey of Prompt Engineering Techniques*
  (2024): <https://arxiv.org/abs/2406.06608>
- Python documentation — *secrets* (secure random values for passwords and tokens):
  <https://docs.python.org/3/library/secrets.html>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  chapters 2-3 (basic and advanced prompt patterns).
