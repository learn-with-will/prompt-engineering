---
id: lesson-10
slug: interaction-patterns
title: "Interaction Patterns: Let the Model Ask"
level: intermediate
order: 10
duration: 24
tags:
  - flipped-interaction
  - cognitive-verifier
  - game-play
  - clarifying-questions
  - conversation-design
summary: "Patterns that change who drives the conversation: Flipped Interaction (the model interviews you), Cognitive Verifier (it breaks your question into sub-questions), and Game Play (it runs an interactive game), plus how to set stopping rules and keep state honest."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Use the **Flipped Interaction** pattern so the model gathers what it needs before answering.
- Use the **Cognitive Verifier** pattern to break a vague question into answerable sub-questions.
- Design a **Game Play** prompt for practice, quizzes, and training.
- Set **stopping conditions** and question budgets so interactions don't drag on.
- Explain why a chat model **can't secretly hold state**, and where state should live instead.

# Why It Matters

Lesson 3 taught you to supply context up front. But sometimes you don't know what context matters,
or there's too much to type. Interaction patterns flip the work: the model asks, you answer. Done
well, this produces answers tailored to your situation without you having to anticipate every
detail. These patterns also power real products, from requirement-gathering assistants to tutors
and training simulations.

# Concept Explanation

### Flipped Interaction: the model interviews you

The **Flipped Interaction** pattern (from the prompt-pattern catalog by White and colleagues,
presented in *Prompt Engineering in Action*) makes the model the questioner:

```text
I want a weekly strength-training plan. Ask me questions, one at a time, until
you have enough information to design it. Then show me the plan.
Ask me the first question.
```

The book lists three key elements:

1. **Objective**: what the model is gathering information *for* (a training plan, a trip
   itinerary, a project brief).
2. **Condition**: when to stop asking ("until you have enough information to...").
3. **Interaction length**: how many questions at a time, and roughly how many in total.

The format: *Ask me questions about [X] until [condition Y] is met. Ask [Z] questions at a time.*

Asking **one question at a time** usually gives better answers than a wall of ten, and adding a
**budget** ("no more than 6 questions in total") prevents interrogations. Combining it with a
**Persona** ("Act as a travel planner") shapes which questions get asked.

### Cognitive Verifier: break the question down

The **Cognitive Verifier** pattern asks the model to generate sub-questions that would help it
answer more accurately, collect your answers, and then combine them:

```text
When I ask a question, first generate three additional questions that would
help you answer it more accurately. After I answer them, combine my answers to
give the final answer to my original question.
```

Asked "What LLM app could improve my productivity?", a model with this pattern responds by asking
about your job, your repetitive tasks, and the tools you already use, rather than producing a
generic list of app ideas. It's close to Flipped Interaction; the difference is emphasis.
Flipped Interaction is an open-ended interview toward an objective. Cognitive Verifier is a
**decomposition** of one specific question into the facts it depends on.

### Game Play: learning by playing

The **Game Play** pattern asks the model to run a game around a topic. *Prompt Engineering in
Action* splits it into **rules** (how the game works, who plays which role) and **content** (the
topic the model draws questions or scenarios from):

```text
Let's play a cybersecurity training game. You describe a realistic workplace
scenario in 2-3 sentences that may or may not contain a phishing attempt. I
reply "phish" or "safe" with a one-line reason. You tell me if I was right, why,
and keep a running score. Increase the difficulty every 3 rounds. Stop when I
type "end" and summarize my weak spots.
Start round 1.
```

Use it for quizzes, language practice, interview prep, and security awareness training. The format
from the book: *Let's play a game about [topic X] with [rules Y], [roles Z], and [context E].*

### Who holds the state?

There's a trap in many game prompts: asking the model to "secretly pick a number between 1 and 100"
and let you guess. A chat model has **no hidden memory** between turns. The only thing it carries
forward is the visible conversation (Lesson 2). If the number isn't written in the transcript, there
is no number; the model will simply make one up when you guess, possibly inconsistently. The book's
own example shows exactly this kind of game.

Rules of thumb:

- **Visible state is fine**: scores, rounds, and the questions asked are all in the transcript.
- **Secret state belongs in your code**: if a game or app needs a hidden value (a secret number, the
  correct answer to a quiz question, a random draw), generate and store it in your program and only
  show the model what it should know.
- **Randomness belongs in your code**: a model's "random" choices aren't random. Use a real random
  generator.

### Stopping conditions and drift

Every interactive pattern needs a way to end:

- **A question budget** ("at most 5 questions").
- **A completion condition** ("when you know my budget, dates, and interests").
- **An exit word** ("stop", "end", "pause").

Long interactive sessions also drift: early rules fade as the transcript grows. Restate the rules
occasionally, or have the model summarize what it knows so far before continuing.

### Interaction patterns in an app

In a product, Flipped Interaction becomes a **clarification step**: if a request is ambiguous, ask
before acting. That's valuable when mistakes are costly (booking, sending, deleting) and annoying
when they're not. Many teams use a rule like this in the system prompt:

```text
If the request is ambiguous in a way that would change the result, ask one short
clarifying question. Otherwise, make a reasonable assumption, state it in one
line, and proceed.
```

When you implement an interview in code, use a **sentinel**: a fixed marker the model outputs when
it's done asking, so your program knows when to move on. A minimal runnable loop with the `call_llm`
placeholder:

```python
SYSTEM = (
    "You are a project-intake assistant. Ask the user one question at a time to "
    "learn the project's goal, deadline, budget, and audience. Ask at most 6 "
    "questions. When you have all four, reply with a line starting 'BRIEF:' "
    "followed by a 4-line project brief, and nothing else."
)

transcript = "User: I need help planning a website redesign."
for _ in range(7):  # hard cap, even if the model forgets its budget
    reply = call_llm(transcript, system=SYSTEM)
    if reply.strip().startswith("BRIEF:"):
        print(reply)
        break
    answer = input(f"{reply}\n> ")
    transcript += f"\nAssistant: {reply}\nUser: {answer}"
```

Note the **hard cap in code**. The prompt asks for at most six questions, but the program doesn't
depend on the model counting correctly.

# Key Terminology

- **Flipped Interaction**: the model asks you questions toward an objective until a condition is met.
- **Cognitive Verifier**: the model generates sub-questions for one question, then combines the
  answers.
- **Game Play**: the model runs an interactive game defined by rules and content.
- **Stopping condition**: the rule that ends an interaction (budget, completion condition, exit
  word).
- **Sentinel**: a fixed marker in the output that tells a program a phase is complete.
- **Hidden state**: information a game or app must keep secret; it belongs in code, not in the chat.

# Options and Trade-offs

| Pattern | Best for | Cost | Watch out for |
| --- | --- | --- | --- |
| Up-front context (Lesson 3) | You know what matters | One message | You may not know what's relevant |
| Flipped Interaction | Personalized plans, briefs, intake | Several turns | Endless questions without a budget |
| Cognitive Verifier | One fuzzy question | One extra round | Sub-questions may be generic |
| Game Play | Practice, quizzes, training | Many turns | Drift; secret state the model can't hold |
| Ask-or-assume rule | Apps and agents | Small | Over-asking on trivial requests |

# Worked Example

You want help choosing a laptop but don't know which specs matter.

**Without a pattern:**

```text
What laptop should I buy?
```

You get a generic list of popular models and a paragraph about "it depends on your needs".

**With Flipped Interaction plus a Persona:**

```text
Act as a knowledgeable, unbiased computer shop advisor. I want to buy a laptop.
Ask me questions one at a time, at most 6, to learn what I need. Then recommend
three types of laptop (not specific models), each with the key specs I should
look for and a typical price range. Ask your first question.
```

The model asks about your main uses, budget, portability needs, operating system preference,
battery expectations, and screen size. The final answer is built from your answers, and the
"types, not models" instruction keeps it from inventing specific products and prices it can't
verify. You can then search for current models matching those specs.

# Real World Analogy

Flipped Interaction is like visiting a **good tailor**. A bad tailor hands you a suit off the rack.
A good one measures your shoulders, asks what the suit is for, how you like it to fit, and when you
need it, and only then starts cutting. The questions aren't a delay; they're the reason the suit
fits. And a professional tailor doesn't ask forty questions: they know which handful matter, which
is why your prompt should set a budget.

# Examples

## Example 1 — Basic: Cognitive Verifier

```text
Before answering, ask me up to three questions that would help you answer more
accurately, then answer using my replies: Should I learn Python or JavaScript
first?
```

**Why this works:** the right answer depends on goals (web, data, automation), which the model now
asks about instead of guessing.

## Example 2 — Real-world: a Socratic tutor

```text
You are a Socratic tutor for high-school chemistry. When I ask about a problem,
don't give the answer. Ask me one guiding question at a time, check my reply,
and give a hint only if I'm stuck twice in a row. When I reach the answer, ask me
to explain it back in one sentence.
```

**Why this works:** Flipped Interaction aimed at learning: the objective is my understanding, the
condition is "I reach the answer and can explain it".

## Example 3 — Pitfall: the secret number

```text
Pick a secret number between 1 and 100, don't tell me, and I'll guess.
Tell me higher or lower each time.
```

**What goes wrong:** there is no secret number; nothing hidden survives between turns. The model's
"higher/lower" answers may be inconsistent, and it can "win" or "lose" arbitrarily. **Fix:** let a
program choose and store the number, and have the model only phrase the hints, or play a game
whose state is visible (a word game where all moves are in the chat).

# Common Mistakes

- **No stopping condition**, so the model keeps asking questions.
- **Asking for many questions at once**, which produces shallow answers to each.
- **Expecting hidden state** (secret numbers, unrevealed answers) to persist in a chat.
- **Using interaction patterns for simple tasks** where up-front context would be faster.
- **Letting long sessions drift** without restating rules or summarizing progress.

# Best Practices

- State the **objective, stopping condition, and question budget** for every flipped interaction.
- Ask for **one question at a time**.
- Combine with a **Persona** to steer which questions get asked.
- Keep **secret state and randomness in code**; give the model only what it should know.
- In apps, use an **ask-or-assume rule**, a **sentinel** for completion, and a **hard cap** in code.

# Summary

- **Flipped Interaction** makes the model interview you toward an objective until a condition is
  met.
- **Cognitive Verifier** breaks one question into sub-questions and combines the answers.
- **Game Play** runs an interactive game from rules and content, great for practice and training.
- A chat model has **no hidden memory**: visible state works, secret state and randomness belong in
  code.
- Every interaction needs a **budget, a completion condition, or an exit word**, and apps should
  enforce limits in code.

# Flash Cards

Q: What three elements does a good Flipped Interaction prompt need?
A: An objective, a stopping condition, and an interaction length (how many questions, how many at a time).

Q: How does Cognitive Verifier differ from Flipped Interaction?
A: Cognitive Verifier decomposes one specific question into sub-questions; Flipped Interaction is an open-ended interview toward an objective.

Q: What are the two parts of a Game Play prompt?
A: Rules (how the game works and who plays which role) and content (the topic the model draws from).

Q: Why can't a chat model hold a secret number between turns?
A: It has no hidden memory; only the visible conversation carries forward, so an unwritten "secret" doesn't exist.

Q: What is a sentinel in an interactive app?
A: A fixed marker (like "BRIEF:") the model outputs when it's done, so your program knows to move on.

Q: Why put a hard cap on question rounds in code?
A: So the program doesn't depend on the model counting correctly or remembering its question budget.

# Exercises

### Easy
Use Flipped Interaction to plan a weekend trip: one question at a time, at most five. Compare the
final plan with what you get from a one-line request.

### Medium
Design a Game Play prompt to quiz yourself on a subject you're studying. Include rules, a scoring
method, difficulty that increases, and an exit word. Play ten rounds and note where the game
drifted or broke.

### Challenging
Implement the intake loop from this lesson (or your own variant) in Python with a sentinel and a
hard cap. Add a check that rejects a final brief missing any of the required fields and asks the
model one follow-up question to fill it.

# Further Reading

- White et al., *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2023):
  Flipped Interaction, Cognitive Verifier, Game Play: <https://arxiv.org/abs/2302.11382>
- Anthropic — *Prompting best practices*:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Python documentation — *random* and *secrets* modules:
  <https://docs.python.org/3/library/random.html>, <https://docs.python.org/3/library/secrets.html>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 2.7.1, 3.2.2, and 3.3.1.
