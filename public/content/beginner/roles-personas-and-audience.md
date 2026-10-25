---
id: lesson-05
slug: roles-personas-and-audience
title: "Roles, Personas, and Audience"
level: beginner
order: 5
duration: 22
tags:
  - personas
  - system-prompts
  - audience
  - role-play
  - ethics
summary: "How to give a model a role (the Persona pattern), tell it who it's talking to (the Audience Persona pattern), where standing roles belong (the system prompt), what personas can and can't do, and the ethics of role-play."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Use the **Persona pattern** ("Act as X. Perform task Y.") and write a persona like a job
  description.
- Use the **Audience Persona pattern** ("Explain X. Assume I am Y.") to pitch an answer correctly.
- Put standing roles and rules in a **system prompt** and explain why.
- Explain what personas **change** (focus, vocabulary, tone, format) and what they **don't** (the
  model's knowledge and accuracy).
- Design **scenarios** for practice and simulation, and apply the **ethics of role-play**.

# Why It Matters

"Act as a..." is one of the most popular prompting moves, and one of the most misunderstood. A good
role sharpens tone, priorities, and structure. A bad one ("You are the world's greatest doctor")
adds confidence without adding knowledge. Knowing exactly what roles do lets you use them where they
help, skip them where they don't, and avoid the ethical traps of impersonation.

# Concept Explanation

### The Persona pattern

In the prompt-pattern catalog by Jules White and colleagues (2023), presented in *Prompt Engineering
in Action*, the **Persona pattern** tells the model who to be while it works:

```text
Act as [PERSONA]. [TASK].
```

A one-word persona ("Act as a marketer") gives a little focus. A persona written like a **job
description** gives much more: the expertise, the priorities, the tone, and the kind of output
expected.

```text
Act as a senior UX researcher who specializes in mobile banking apps. You care
most about accessibility and clear evidence, and you flag assumptions explicitly.
Review the onboarding flow described below and list the five biggest usability
risks, each with the evidence you'd collect to confirm it.
```

### The Audience Persona pattern

The flip side tells the model who **you** are, or who the output is for:

```text
Explain [TOPIC] to me. Assume I am [AUDIENCE].
```

"Explain public-key encryption. Assume I'm a 10-year-old who likes secret codes" and "...Assume I'm
a backend developer who has used TLS but never implemented crypto" produce very different, and
correctly pitched, answers. In practice, the **audience** often matters more than the persona,
because it controls vocabulary, depth, and examples.

You can combine both: "Act as a pediatric dietitian. Explain iron-rich foods to a parent of a picky
four-year-old."

### Where roles belong: the system prompt

Most chat APIs separate a **system prompt** (standing instructions for the whole conversation) from
**user messages** (each turn's request). Anthropic's guide recommends setting the role in the system
prompt. OpenAI's Responses API offers an `instructions` field that inserts a system (or developer)
message. Chat apps expose the same idea as custom instructions or project instructions.

Put things in the system prompt that should hold for every turn: the role, the audience, tone rules,
safety boundaries, and output conventions. Put the specific task in the user message. With the
`call_llm` placeholder from Lesson 1:

```python
SYSTEM = (
    "You are a patient math tutor for students aged 12-14. "
    "Never give the final answer outright; guide with one hint at a time "
    "and ask the student to try the next step."
)

reply = call_llm("I don't get how to solve 3x + 5 = 20.", system=SYSTEM)
print(reply)
```

### What a persona does and doesn't do

A persona is a powerful style and focus control. It is **not** a knowledge upgrade.

- **It changes:** vocabulary, priorities ("a security reviewer looks for risks first"), structure,
  tone, and what the model chooses to mention.
- **It doesn't change:** what the model actually knows. Telling it to be "a world-class cardiologist"
  doesn't add medical facts it lacks.
- **It can backfire:** an expert persona can make uncertain answers *sound* more authoritative.

Research backs this up. A 2023 study by Mingqian Zheng and colleagues tested 162 roles across four
model families on 2,410 factual questions and found that adding personas to system prompts **did
not improve** accuracy compared to no persona; the effect of a given persona was largely random. So
use roles for **how** the answer is shaped, and use context, documents, and verification for
**whether** it's right.

### Scenario crafting

A **scenario** goes beyond a role: it sets a scene for the model to play in. Mark Austin's *How to
Become a Prompt God* lists three ingredients:

1. **Setting**: where and when ("a tense quarterly review meeting").
2. **Audience**: who's on the other side ("a skeptical CFO").
3. **Conflict**: what makes it interesting ("the project is 20% over budget").

Scenarios shine for **practice and simulation**: rehearsing a negotiation, a job interview, a hard
conversation, or a customer complaint. Tell the model how to behave *as the other party* and when to
step out of character to give feedback.

```text
Let's rehearse a salary negotiation. You play Dana, a hiring manager at a
mid-sized software company with a fixed budget but some flexibility on signing
bonuses. Stay in character and push back realistically. After I type "pause",
step out of character and give me three specific tips on my last answer.
Start by making me an offer.
```

### The ethics of role-play

Roles are fun and useful, but some lines matter:

- **Don't impersonate real people** in ways that could deceive or defame. "Write as [real
  politician]" can produce fake quotes that spread. Use a **fictional character inspired by an
  archetype** instead ("a tech billionaire obsessed with Mars"), and label satire as satire.
- **Don't build personas on stereotypes** about groups of people.
- **Be transparent with users.** If you deploy a persona in a product, people should know they're
  talking to an AI, not a human.
- **Keep the persona inside your rules.** A persona never overrides safety or honesty
  requirements; say so in the system prompt if your persona is edgy ("Sarcastic, but never mean
  about the user personally").

# Key Terminology

- **Persona pattern**: "Act as X. Perform task Y." The model adopts a role while it works.
- **Audience Persona pattern**: "Explain X. Assume I am Y." The model pitches its answer to a stated
  audience.
- **System prompt**: standing instructions (role, audience, rules) that apply to a whole
  conversation or application.
- **User message**: one turn's request, sent after the system prompt.
- **Scenario**: a scene with setting, audience, and conflict for the model to play in.
- **Impersonation**: presenting generated text as if a real, identifiable person said it.

# Options and Trade-offs

| Technique | Best for | Watch out for |
| --- | --- | --- |
| Short persona ("Act as an editor") | Quick tone and focus shifts | Little real effect on content |
| Job-description persona | Consistent priorities and structure | Long; must not contradict other rules |
| Audience persona | Pitching depth and vocabulary correctly | Vague audiences ("a beginner") help less than concrete ones |
| System prompt role | Rules that must hold every turn | Needs testing; buried rules can still be missed |
| Scenario role-play | Practice, simulation, training | Staying in character when you need facts; ethics of real people |

# Worked Example

You run a small accounting firm and want a model to draft replies to client questions.

**First try:**

```text
You are the best accountant in the world. Answer this client: "Can I deduct my
home office?"
```

The reply is confident and generic, and states rules as if they apply everywhere, though tax law
depends on the country and the client's situation.

**Improved, with a system prompt and audience:**

```text
System:
You draft email replies for a small accounting firm in the UK. Your readers are
small-business owners with no accounting training. Be friendly and plain-spoken.
Never state a definitive tax position; explain the general rule, list the facts
we'd need to confirm, and recommend a short call. Sign as "The Brightside
Accounting team".

User:
Draft a reply to this client email:
<email>
Hi, I work from my spare room three days a week. Can I deduct my home office?
</email>
```

The role is now a **job description** with a jurisdiction, an audience, a tone, and a
**limit on confidence** ("never state a definitive tax position"). That last rule does more for
safety and accuracy than any "best in the world" flattery could.

# Real World Analogy

Giving a model a persona is like **handing an actor a costume and a character brief**. A white
coat and a stethoscope make them look and sound like a doctor, and a good brief makes them act
like one. But the costume doesn't give them a medical degree. If the scene needs a correct dosage,
you'd better put it in the script. Personas shape the performance; facts still have to come from
somewhere real.

# Examples

## Example 1 — Basic: audience persona

```text
Explain how vaccines train the immune system. Assume I'm a 9-year-old who loves
superhero movies. Use one superhero comparison and keep it to 5 sentences.
```

**Why this works:** a concrete audience, a requested analogy style, and a length.

## Example 2 — Real-world: a support assistant's system prompt

```text
You are the support assistant for Tidy, a home-cleaning booking app.
Audience: customers on mobile, often in a hurry.
Tone: warm, brief, practical. Use short paragraphs, no jargon.
Scope: bookings, payments, cancellations, and account settings only. For
anything else, say you can't help with that and offer the help-center link.
Never promise refunds; explain the refund policy and offer to open a ticket.
```

**Why this works:** role, audience, tone, scope, and a hard boundary (refunds) that holds every
turn.

## Example 3 — Pitfall: the flattering super-persona

```text
You are a world-renowned oncologist with 40 years of experience. Tell me
exactly which treatment I should choose for my mother's cancer.
```

**What goes wrong:** the persona adds authority, not knowledge or access to the patient's records,
so the answer can sound definitive while being unsafe. **Fix:** ask for general information and
questions to bring to the treating doctor, and supply real context if you have it: "Explain the
general differences between these treatment types and list questions we should ask her oncologist."

# Common Mistakes

- **Expecting a persona to make answers more accurate.** It shapes style and focus, not knowledge.
- **Stacking incompatible personas** ("a pirate, a CPA, and a poet at once"), which muddles all
  three.
- **Leaving the audience vague.** "Explain for beginners" helps less than "for a nurse who has never
  coded".
- **Putting standing rules in one user message** and expecting them to hold for the whole chat.
- **Impersonating real people** or leaning on stereotypes for a persona.

# Best Practices

- Write personas as **job descriptions**: expertise, priorities, tone, and expected output.
- Always consider the **audience**; it often matters more than the persona.
- Put durable roles and rules in the **system prompt**; put the task in the user message.
- Add **limits on confidence** for high-stakes domains (law, medicine, finance).
- Use **fictional archetypes** instead of real people, and tell users they're talking to an AI.

# Summary

- The **Persona pattern** ("Act as X") sets the model's role; the **Audience Persona pattern**
  ("Assume I am Y") pitches the answer to the reader.
- Standing roles and rules belong in the **system prompt** (or the vendor's equivalent field).
- Personas change **style, focus, and tone**, not knowledge; research found they don't improve
  factual accuracy on their own.
- **Scenarios** (setting, audience, conflict) are great for practice and simulation.
- Role-play has **ethical limits**: no deceptive impersonation, no stereotypes, and transparency
  with users.

# Flash Cards

Q: What is the format of the Persona pattern?
A: "Act as [persona]. [Task]." The model adopts the role while doing the task.

Q: What is the format of the Audience Persona pattern?
A: "Explain [topic] to me. Assume I am [audience]." The model pitches depth and vocabulary to that reader.

Q: What belongs in a system prompt rather than a user message?
A: Anything that must hold every turn: the role, audience, tone rules, scope, and safety boundaries.

Q: Does adding an expert persona make factual answers more accurate?
A: Not reliably; a 2023 study of 162 personas found no improvement on factual questions, and personas can make wrong answers sound more confident.

Q: What three ingredients make a good scenario?
A: A setting, an audience, and a conflict.

Q: How should you handle requests to role-play a real person?
A: Use a fictional character inspired by an archetype instead, label satire, and avoid content that could deceive or defame.

# Exercises

### Easy
Ask a model to explain compound interest three times: with no persona, as "a financial advisor",
and for "a 15-year-old saving for a bike". Which change affected the answer most: the persona or
the audience?

### Medium
Write a system prompt for an assistant you'd actually use (a study buddy, a writing coach, a
recipe helper). Include role, audience, tone, scope, and one hard boundary. Test it with five
messages, including one that tries to go out of scope.

### Challenging
Design a role-play scenario for practicing a difficult conversation at work, with a clear exit
command for feedback. Run it twice, once with a mild and once with a tough counterpart. Then
evaluate: did the model stay in character, did it break character only when asked, and was the
feedback specific?

# Further Reading

- White et al., *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2023):
  <https://arxiv.org/abs/2302.11382>
- Zheng et al., *When "A Helpful Assistant" Is Not Really Helpful: Personas in System Prompts Do
  Not Improve Performances of Large Language Models* (2023): <https://arxiv.org/abs/2311.10054>
- Anthropic — *Prompting best practices* ("Give Claude a role"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 2.5.1-2.5.2 (Persona and Audience Persona patterns).
- Mark Austin, *How to Become a Prompt God* (2025), chapters 3 and 5 (personas, scenario crafting,
  the ethics of role-play).
