---
id: lesson-03
slug: clarity-and-specificity
title: "Clarity and Specificity"
level: beginner
order: 3
duration: 20
tags:
  - clarity
  - specificity
  - golden-rule
  - delimiters
  - prompt-mistakes
summary: "The two habits behind most good prompts: saying exactly what you want in plain words, and filling in the who, what, why, how long, and what shape, plus the classic mistakes that make models guess."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Apply the **colleague test** (Anthropic's "golden rule") to any prompt.
- Turn a vague request into a specific one using **audience, goal, length, format, and tone**.
- Use the **S.P.E.C.IFY** checklist: Style, Purpose, Examples, Constraints.
- **Explain the why** behind an instruction so the model can generalize.
- Spot and fix the most common mistakes: overloaded, cryptic, context-free, and contradictory
  prompts.

# Why It Matters

Clarity and specificity are the cheapest improvements in all of prompt engineering. They need no
special technique and work on every model. Most "the AI is bad at this" moments turn out to be "the
AI had to guess". This lesson gives you a short checklist you'll use in every prompt you write for
the rest of the course.

# Concept Explanation

### The colleague test

Anthropic's prompting guide suggests thinking of the model as **a brilliant but new employee** who
lacks context on your norms and workflows. Its key test: show your prompt to a colleague with
minimal context on the task and ask them to follow it. If they'd be confused, the model will be too.

The colleague test catches the most common failure: prompts that make perfect sense to *you*,
because you hold all the context in your head, and none to anyone else.

### Clarity: say it plainly

Clarity is about **how** you ask:

- **Use direct instructions.** "Write a 300-word introduction to telehealth for patients" beats "I
  was wondering if you could maybe say something about telehealth?"
- **Use plain words.** Jargon and buzzwords ("leverage cross-functional synergies") are ambiguous to
  people and models alike. Say what you mean.
- **One clear ask, or numbered asks.** If you need several things, number them, and say whether the
  order matters.
- **Make the main request easy to find.** Don't bury it in paragraph four of background.

### Specificity: fill in the blanks

Specificity is about **what** you include. Before sending a prompt, check these five questions:

| Question | Example detail |
| --- | --- |
| **Who** is it for? | "for first-year nursing students" |
| **What** exactly should it do? | "list the 5 most common medication errors" |
| **Why** does it matter? | "they'll use it as a checklist on shift" |
| **How long**? | "one line per error" |
| **What shape and tone**? | "a numbered list, plain and calm" |

You won't need all five every time. A quick factual question needs none. But the more the output
matters, the more of them you should answer.

### The S.P.E.C.IFY checklist

Mark Austin's *How to Become a Prompt God* packages specificity into a memorable checklist,
**S.P.E.C.IFY**:

- **Style**: the voice or tone ("like a calm airline pilot announcement").
- **Purpose**: what the output must achieve ("convince my manager to approve a trial").
- **Examples**: a sample of what good looks like (Lesson 6 goes deep).
- **Constraints**: limits on length, format, words to avoid, deadlines.

It's a mnemonic, not a law. Use it as a final pass to catch what you left out.

### Explain the why

Instructions work better with a reason attached. Anthropic's guide shows that a rule with its
motivation lets the model **generalize**. Compare:

```text
Less effective:  Don't use tables.

More effective:  This answer will be sent as an SMS, which can't display tables
                 or formatting, so write plain sentences only.
```

With the reason, the model also avoids *other* things an SMS can't show (bold text, bullet symbols,
long links) without you listing them all.

### Ask for what you actually want

Models usually do what's asked, not more. If you want an ambitious, thorough result, say so.
Anthropic's guide notes that if you want the model to go beyond the basics, you should **request it
explicitly** rather than hope it infers that from a vague prompt. "Create a landing page" gets a
minimal page. "Create a landing page with a hero section, three feature cards, testimonials, and a
pricing table. Make it polished" gets much more.

### Separate instructions from data

When a prompt includes text to work on (an email, an article, notes), mark clearly where it starts
and ends. Common **delimiters** include triple quotes, XML-style tags, or headings:

```text
Summarize the customer review below in one sentence. Then rate its sentiment
as POSITIVE, NEGATIVE, or MIXED.

<review>
The delivery was two days late, but the support team was lovely and the
blender works great.
</review>
```

Delimiters stop the model from confusing your instructions with the content, and they matter even
more for security when the content comes from someone else (Lesson 23).

### Don't overcorrect

Specific isn't the same as long. Common overcorrections:

- **Padding**: long background that doesn't affect the output just dilutes the ask. The *Prompt
  Engineering in Action* authors call this **prompt dilution**.
- **Contradictions**: "Be brief" plus "Cover every detail" forces the model to pick one.
- **Shouting**: older prompting advice used ALL CAPS and "CRITICAL: you MUST". Anthropic notes that
  newer models are more responsive to instructions, so aggressive language can cause
  *over*-reaction; plain phrasing ("Use this tool when...") usually works better.

# Key Terminology

- **Colleague test (golden rule)**: if a colleague with minimal context would be confused by your
  prompt, the model will be too.
- **Clarity**: phrasing the request directly, in plain words, with an easy-to-find main ask.
- **Specificity**: supplying the details that remove guesswork: audience, goal, length, format, tone.
- **S.P.E.C.IFY**: a checklist mnemonic for Style, Purpose, Examples, and Constraints.
- **Delimiter**: a marker (triple quotes, tags, headings) that separates instructions from content.
- **Prompt dilution**: weakening a prompt with irrelevant or poorly organized information.

# Options and Trade-offs

| Choice | Benefit | Risk | Guideline |
| --- | --- | --- | --- |
| Short, direct prompt | Fast to write, easy to read | Model guesses missing details | Fine for simple, low-stakes asks |
| Detailed, specific prompt | Predictable, tailored output | Can bury the ask or contradict itself | Use for anything that matters or repeats |
| Rules with reasons | Model generalizes to cases you didn't list | Longer prompts | Add reasons for rules that seem arbitrary |
| Rules without reasons | Compact | Model applies them too literally | Fine for obvious rules |
| Emphatic language (CAPS, MUST) | Was a fix for older models | Over-triggering on newer models | Prefer calm, plain instructions |

# Worked Example

**The vague prompt:**

```text
Make me a study plan.
```

**Colleague test:** a colleague would ask: for what subject? By when? How much time per day? What do
you already know? What should the plan look like?

**Rebuilt prompt:**

```text
I'm taking the AWS Cloud Practitioner exam in 4 weeks. I work full time, so I
can study 45 minutes on weekdays and 2 hours on Saturdays. I already understand
basic networking but I'm new to AWS.

Create a week-by-week study plan. For each week, give:
1. The topics to cover, in order.
2. One hands-on activity using the AWS free tier.
3. A 10-minute self-test idea for the weekend.

Format it as a table with one row per week. Keep each cell under 25 words.
```

What changed: the **goal and deadline** (exam in 4 weeks), the **constraints** (time available),
the **starting point** (knows networking), numbered **requirements**, and an explicit **format**.

# Real World Analogy

Ordering a **custom birthday cake** works the same way. "A chocolate cake, please" gets you *a*
chocolate cake. "A two-layer chocolate cake for 12 people, no nuts (my niece is allergic), with
'Happy 8th, Maya' in purple icing, ready Saturday at 10am" gets you *the* cake. Notice the reason
in parentheses: telling the baker *why* there can be no nuts makes them careful about nut-based
decorations and shared equipment too, not just the batter.

# Examples

## Example 1 — Basic: vague to specific

```text
Vague:     Write about sleep.

Specific:  Write a 200-word blog intro for busy parents explaining why a
           consistent bedtime helps adults sleep better. Warm, practical tone.
           End with one question that invites readers to keep reading.
```

**Why this works:** audience, length, purpose, tone, and an ending instruction remove every guess.

## Example 2 — Real-world: explaining the why

```text
Rewrite the release notes below for our customer newsletter. Our readers are
small-business owners, not developers, so replace technical terms with what the
change means for their day-to-day work. Keep each item to one sentence.

<release_notes>
- Migrated invoice PDF rendering to a new service; p95 latency down 60%.
- Added OAuth2 SSO support for Google Workspace.
- Fixed race condition causing duplicate reminder emails.
</release_notes>
```

**Why this works:** the reason ("readers are business owners, not developers") tells the model how
to translate every item, including ones you didn't specifically mention.

## Example 3 — Pitfall: the overloaded, contradictory prompt

```text
Write a short but very detailed report covering everything about our Q3 sales,
also draft three tweets, and make it fun but strictly professional.
```

**What goes wrong:** two unrelated tasks, "short" against "very detailed", "fun" against "strictly
professional", and "everything about our Q3 sales" without any sales data. **Fix:** split it into
separate prompts, supply the data, and choose one tone and one length.

# Common Mistakes

- **The overloaded prompt**: several unrelated tasks crammed together. Split them or number them.
- **The cryptic prompt**: "Do that thing we discussed." The model doesn't share your memory.
- **The missing context**: "Finish this story" without the story, or "fix this" without the error.
- **Contradictions**: incompatible length, tone, or scope instructions.
- **Burying the ask**: the actual request hidden under paragraphs of background.

# Best Practices

- Run the **colleague test** before you hit send on anything important.
- Answer **who, what, why, how long, and what shape** in proportion to how much the output matters.
- Attach **reasons** to rules that might seem arbitrary.
- Use **delimiters** around any content you paste in.
- Prefer **plain, calm instructions** over capital letters and threats.

# Summary

- Treat the model like a **brilliant new colleague** who knows nothing about your situation.
- **Clarity** is how you ask: direct, plain, easy to find. **Specificity** is what you include:
  audience, goal, length, format, tone.
- **S.P.E.C.IFY** (Style, Purpose, Examples, Constraints) is a quick final checklist.
- **Explaining why** lets the model generalize beyond the rules you listed.
- Avoid overloaded, cryptic, context-free, and contradictory prompts, and don't pad or shout.

# Flash Cards

Q: What is the colleague test?
A: Show your prompt to a colleague with minimal context; if they'd be confused, the model will be too.

Q: What five questions make a prompt specific?
A: Who it's for, what exactly to do, why it matters, how long, and what shape and tone.

Q: What does S.P.E.C.IFY stand for?
A: Style, Purpose, Examples, and Constraints.

Q: Why attach a reason to an instruction?
A: The model can generalize from the reason and handle related cases you didn't spell out.

Q: What are delimiters for?
A: They mark where pasted content begins and ends, so the model doesn't confuse your instructions with the data.

Q: Why avoid "CRITICAL: you MUST" phrasing with newer models?
A: Newer models follow instructions closely, so emphatic language can make them over-react; plain phrasing usually works better.

# Exercises

### Easy
Take the prompt "Write something about exercise" and rewrite it three ways for three different
audiences (a teenager, a 70-year-old, a busy office worker). Compare the outputs.

### Medium
Find a prompt you use regularly. Run the colleague test with a real person: send them only the
prompt and ask what they'd produce. Fix every question they ask, then compare the model's output
before and after.

### Challenging
Write a prompt containing three rules without reasons. Run it on five inputs. Then add a one-line
reason to each rule and rerun. Document at least one case where the reason made the model handle a
situation you never mentioned.

# Further Reading

- Anthropic — *Prompting best practices* ("Be clear and direct", "Add context to improve
  performance"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — *Prompt engineering* guide (message formatting and delimiters):
  <https://platform.openai.com/docs/guides/prompt-engineering>
- Google — *Prompt design strategies*: <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- Mark Austin, *How to Become a Prompt God* (2025), chapter 2 (clarity, specificity, S.P.E.C.IFY).
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  chapter 2 (prompt dilution).
