---
id: lesson-01
slug: what-is-prompt-engineering
title: "What Is Prompt Engineering?"
level: beginner
order: 1
duration: 18
tags:
  - prompt-engineering
  - prompts
  - llm-basics
  - iteration
  - getting-started
summary: "What a prompt is, what happens when you send one, why the wording changes the answer so much, and how prompt engineering turns trial and error into a repeatable design-test-refine loop."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define a **prompt**, a **response**, and **prompt engineering** in plain words.
- Describe, at a high level, what a language model does with your prompt.
- Explain why the same model gives weak answers to vague prompts and strong answers to clear ones.
- Describe the **design → test → refine** loop that the rest of this course builds on.
- Tell when better prompting is the right fix and when you need something else (retrieval, tools,
  or fine-tuning).

# Why It Matters

Large language models (LLMs) such as ChatGPT, Claude, and Gemini can summarize, translate, explain,
classify, write code, and plan. But the model only sees what you type. It doesn't know your
audience, your deadline, your company's style, or what you tried yesterday unless you say so. The
gap between "the AI gave me something generic" and "the AI saved me an hour" is almost always in the
prompt.

Prompt engineering is the skill of closing that gap on purpose. It's useful whether you chat with an
assistant once a week or build an app that sends a million prompts a day. The techniques in this
course are vendor-neutral: they work across models, and where vendors differ, we'll say so.

# Concept Explanation

### What a prompt is

A **prompt** is everything you give a language model as input for one request. It can contain:

- **Instructions**: what you want done ("Summarize this in three bullet points").
- **Context**: background the model can't know ("The readers are new nurses").
- **Input data**: the text, table, code, or image to work on.
- **Examples**: samples of the output you want.
- **Format guidance**: how the answer should look (a table, JSON, a 100-word paragraph).

What comes back is the **response** (sometimes called the **output** or **completion**). In a chat
app, the whole conversation so far is part of the prompt for the next turn, so earlier messages keep
shaping later answers.

### What happens when you send a prompt

Under the hood, the model does something surprisingly simple, many times in a row:

1. Your text is split into **tokens**: small chunks such as whole words, parts of words, or
   punctuation.
2. The model reads all the tokens and predicts which token is most likely to come **next**.
3. It adds a token, then predicts the next one, and so on until it decides the answer is finished
   or hits a length limit.
4. The tokens are turned back into readable text.

Lesson 2 opens up each step. For now, keep one idea: the model is continuing your text in the way
that best fits everything it sees. Change what it sees and you change what it writes.

### Completion versus response

Early models simply **continued** text. If you typed "Aliens landed in 2040 and", the model wrote
the rest of the story. Today's chat models are additionally trained to **follow instructions** and
answer questions, so "Write a two-sentence story about aliens landing in 2040" works directly. Both
behaviors come from the same next-token prediction. The second is the result of extra training on
examples of helpful answers. You'll mostly use instruction-following models in this course, but the
continuation instinct never goes away. That's why examples and formatting in a prompt pull so hard
on the output (Lesson 6).

### Why wording matters so much

Two prompts that mean the same thing to you can mean very different things to a model:

```text
Prompt A:  Help me prepare for an interview.

Prompt B:  I have a 45-minute video interview on Thursday for a junior data analyst
           role at a hospital. I know SQL and Excel well but have never used Python.
           Give me the 8 questions I'm most likely to be asked, each with a one-line
           tip for answering it. Put the Python question last and suggest an honest
           way to talk about it.
```

Prompt A forces the model to guess the role, the level, the format, and what "prepare" means, so it
gives a safe, generic list. Prompt B removes the guessing. Neither prompt uses special tricks. Most
prompt engineering is just **not making the model guess**.

### Prompt engineering is engineering

Both source books for this course make the same point: good prompts come from a loop, not a single
inspired attempt. *Prompt Engineering in Action* compares it to choosing the right data structure
for a program. The loop looks like this:

1. **Design**: write a prompt with a clear task, context, and output format.
2. **Test**: run it, ideally on several different inputs.
3. **Inspect**: compare the output to what you wanted. What's missing, wrong, or extra?
4. **Refine**: change one thing at a time and test again.
5. **Save**: keep the version that works, and note why.

At larger scale, "inspect" becomes measuring against a test set (Lesson 22). The habit is the same.

### Where prompts live

You'll write prompts in several places:

- **Chat apps**: type and iterate conversationally.
- **Standing instructions**: custom instructions, project instructions, or a **system prompt** that
  applies to every message (Lesson 5).
- **The API**: your code assembles the prompt from templates and data and sends it to a model
  (Lessons 13-15).
- **Agents and tools**: prompts that tell a model when and how to use tools (Lesson 19).

A note on vocabulary: some writers call a vague, open-ended prompt a "soft prompt" and a precise one
a "hard prompt". In machine-learning research, **soft prompt** usually means something different:
learned numeric vectors used to steer a model, not text at all. This course avoids the term.

### What prompting can't fix

A better prompt can't make a model know facts it was never trained on, or facts that happened after
its training data ends. For those, give the model the information (paste it, or use retrieval:
Lesson 18) or let it use tools such as search (Lesson 19). If you need a model to adopt a very
specialized behavior across millions of requests, **fine-tuning** (further training on your own
examples) may beat prompting. Prompting is the cheapest, fastest lever, so try it first.

### The code convention for this course

Some lessons include short Python programs. Wherever a program needs to call a model, it uses this
placeholder, so the code works with any provider:

```python
def call_llm(prompt: str, system: str | None = None) -> str:
    """Send a prompt (and an optional system prompt) to a language model and
    return the text of its reply. Connect this to your provider's SDK;
    Lesson 13 shows one complete implementation."""
    raise NotImplementedError("Connect call_llm to your model provider")
```

With it, comparing prompts takes a few lines:

```python
prompts = {
    "vague": "Help me prepare for an interview.",
    "specific": (
        "I have a 45-minute interview on Thursday for a junior data analyst role "
        "at a hospital. List the 8 questions I'm most likely to be asked, each "
        "with a one-line answering tip."
    ),
}

for name, prompt in prompts.items():
    print(f"--- {name} ---")
    print(call_llm(prompt))
```

# Key Terminology

- **Large language model (LLM)**: a neural network trained on large amounts of text to predict the
  next token, then usually trained further to follow instructions.
- **Prompt**: the full input for one request: instructions, context, data, examples, and format.
- **Response (output, completion)**: the text the model generates.
- **Token**: a chunk of text (a word, part of a word, or a symbol) that the model reads and writes.
- **Prompt engineering**: designing, testing, and refining prompts to get reliable, useful outputs.
- **System prompt**: standing instructions applied to a whole conversation or app.
- **Fine-tuning**: training a model further on your own examples to change its default behavior.

# Options and Trade-offs

| Lever | What it changes | Cost and speed | Use it when |
| --- | --- | --- | --- |
| Better prompting | How the model interprets the task | Free, instant | Always first |
| Adding context or documents | What facts the model can use | Cheap; uses more tokens | The model lacks your information |
| Retrieval (RAG) | Which documents get added, automatically | Engineering effort | The information is large or changes often |
| Tools (search, code, APIs) | What the model can look up or compute | Engineering effort | You need live data or exact calculation |
| Fine-tuning | The model's default behavior | Data, time, and money | A narrow behavior is needed at large scale |

# Worked Example

You want help writing a message to your landlord about a broken heater.

**First attempt:**

```text
Write a message to my landlord about the heater.
```

The response is polite but vague. It doesn't mention how long the heater has been broken, it
invents a friendly tone you didn't want, and it's three paragraphs long.

**Inspect:** what was the model forced to guess? The facts (when it broke, what you've tried), the
tone (firm, since this is the second request), the length, and the ask (a repair date).

**Refined prompt:**

```text
Write a short, firm but polite text message to my landlord. The heater in my
apartment stopped working 6 days ago. I reported it by phone last Monday and
haven't heard back. Temperatures are below freezing this week. Ask for a repair
appointment within 48 hours and mention that I'm keeping a record of the dates.
Keep it under 80 words.
```

**Test again:** now the message has the facts, the right tone, a specific request, and fits in a
text. You changed nothing about the model. You only stopped making it guess.

# Real World Analogy

A prompt is like typing a destination into a **GPS**. Type "downtown" and it will happily route you
somewhere downtown, just not necessarily where you meant to go. Type the exact address, add "avoid
tolls" and "arrive by 9:00", and the same GPS gets you exactly where you need to be. The GPS was
always capable. The precision of the destination is what changed. When a model gives you a generic
answer, ask yourself: did I give it an address, or just a neighborhood?

# Examples

## Example 1 — Basic: adding audience and length

```text
Explain what a credit score is to a 16-year-old getting their first job, in
4 sentences, with one everyday example.
```

**Why this works:** the audience (a teenager), the length (4 sentences), and a requested example
remove the three biggest guesses.

## Example 2 — Real-world: a repeatable work task

```text
You'll receive a customer email. Classify it as one of: BILLING, TECHNICAL,
ACCOUNT, OTHER. Then write a one-sentence summary of what the customer wants.

Respond in exactly this format:
Category: <category>
Summary: <one sentence>

Email:
"""
I changed my password yesterday and now the mobile app keeps logging me out.
"""
```

**Why this works:** a fixed label set, a fixed output format, and a clear boundary (the triple
quotes) around the input make the output easy to check and to process automatically.

## Example 3 — Pitfall: asking for facts the model can't have

```text
What were the three biggest news stories this morning?
```

**What goes wrong:** a model without web access only knows its training data, which stops at a
cutoff date. It may say it doesn't know, or it may produce confident but invented "news".
**Fix:** use a tool with web search, or paste the articles yourself and ask the model to summarize
*those*.

# Common Mistakes

- **Treating the model like a mind reader.** If a detail matters to you, it belongs in the prompt.
- **Judging a prompt on one run.** Outputs vary. Test a prompt several times and on several inputs.
- **Changing five things at once.** You won't know which change helped. Change one thing per round.
- **Using prompting to fix missing knowledge.** If the model lacks the facts, supply them or connect
  a tool.
- **Trusting fluent output blindly.** Fluent isn't the same as correct. Check facts that matter.

# Best Practices

- Ask yourself, "What would a smart stranger need to know to do this well?" Then write that down.
- State the **task**, the **context**, and the **output format** every time they matter.
- Keep a simple **prompt log**: the prompt, the date, what worked, and what didn't.
- Test on **varied inputs**, including awkward ones, before you rely on a prompt.
- When a prompt works, **save it as a template** so you can reuse it.

# Summary

- A **prompt** is the full input for one request; the **response** is what the model generates.
- A model predicts one **token** at a time, continuing the text in the way that best fits what it
  sees.
- Most improvements come from **removing guesswork**: task, context, audience, length, and format.
- Prompt engineering is a loop: **design, test, inspect, refine, save**.
- Prompting can't add knowledge the model lacks. Use documents, retrieval, or tools for that.

# Flash Cards

Q: What is a prompt?
A: Everything you give a model for one request: instructions, context, input data, examples, and format guidance.

Q: In one sentence, what does a language model do with your prompt?
A: It predicts the most likely next token again and again, continuing the text in the way that best fits everything it sees.

Q: Why does a vague prompt usually produce a generic answer?
A: The model has to guess the missing details, so it falls back on the safest, most average response.

Q: What are the steps of the prompt engineering loop?
A: Design, test, inspect, refine (one change at a time), and save what works.

Q: What should you do when a model lacks the facts you need?
A: Supply them in the prompt, use retrieval, or give the model a tool such as search, because prompting alone can't add knowledge.

Q: What is fine-tuning, and when might it beat prompting?
A: Training a model further on your own examples; it can win when you need a narrow behavior at very large scale.

# Exercises

### Easy
Pick a question you asked an AI assistant recently. Rewrite it with a clear audience, length, and
format. Run both versions and note three differences in the answers.

### Medium
Write a prompt for a task you do every week (for example, turning meeting notes into action items).
Run it on three different real inputs. Write down one weakness you see across the runs and fix it
with a single change.

### Challenging
Start a prompt log (a document or spreadsheet) with columns for date, prompt version, input, output
quality (1-5), and notes. Run five versions of one prompt through the design-test-refine loop and
record each step. What single change had the biggest effect?

# Further Reading

- Anthropic — *Prompt engineering overview*:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview>
- OpenAI — *Prompt engineering* guide: <https://platform.openai.com/docs/guides/prompt-engineering>
- Google — *Prompt design strategies* (Gemini API):
  <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, MEAP 2025),
  chapter 1.
- Mark Austin, *How to Become a Prompt God: Mastering Advanced Prompt Engineering for AI* (2025),
  chapters 1-2.
