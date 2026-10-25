---
id: lesson-02
slug: how-language-models-work
title: "How Language Models Read Your Prompt"
level: beginner
order: 2
duration: 22
tags:
  - tokens
  - transformers
  - context-window
  - hallucination
  - llm-basics
summary: "Tokens, next-token prediction, attention, training, the context window, knowledge cutoffs, randomness, hallucination, and bias: the handful of mechanics that explain why prompts behave the way they do."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **tokens** are and why token counts differ from word counts.
- Describe **next-token prediction** and why the same prompt can give different answers.
- Explain, without math, what **attention** in a transformer does with your prompt.
- Define the **context window** and the **knowledge cutoff**, and how each limits a model.
- Explain why models **hallucinate** and show **bias**, and name a mitigation for each.

# Why It Matters

You don't need to build a model to prompt one well, but a few mechanics explain almost every
surprise you'll meet. Why did the model ignore something I said at the start of a long chat? (Context
limits.) Why did it invent a citation? (It predicts plausible text, it doesn't look things up.) Why
did the same prompt give a different answer today? (Sampling.) Once you know the mechanics, these
stop being mysteries and become design constraints you can work around.

# Concept Explanation

### Tokens: how text is chopped up

A model doesn't read letters or whole words. It reads **tokens**: chunks produced by a
**tokenizer**. Common words are often one token; rare words, names, and numbers are split into
several pieces; punctuation and spaces count too. Two consequences matter for prompting:

- **Tokens aren't words or characters.** OpenAI's help article on tokens offers a rough rule of
  thumb for English: one token is about four characters, or about three quarters of a word. Other languages,
  code, and numbers usually take more tokens per word.
- **Tokenizers differ between models.** The same text can be a different number of tokens on
  different models, even from the same vendor.

So when you want a length, ask for **words, sentences, or paragraphs** ("in about 150 words"), not
tokens. Providers count tokens for billing and limits; you count words for readers.

### Next-token prediction

Given the tokens so far, the model computes a probability for every token in its vocabulary: how
likely each one is to come next. It then picks one, appends it, and repeats. Here's the idea in a
few lines of runnable Python, using made-up probabilities for the text "The capital of France is":

```python
import random

# Made-up probabilities for the next token after "The capital of France is"
next_token_probs = {" Paris": 0.92, " a": 0.03, " the": 0.03, " Lyon": 0.02}

def sample(probs: dict[str, float]) -> str:
    tokens = list(probs)
    weights = list(probs.values())
    return random.choices(tokens, weights=weights, k=1)[0]

print([sample(next_token_probs) for _ in range(10)])
# Usually " Paris", occasionally something else: sampling adds variety.
```

Real models do this with tens of thousands of possible tokens at every step. Picking from the
distribution, instead of always taking the top token, is why outputs vary from run to run. Lesson 13
covers the settings that control this.

### Attention: how the model weighs your words

Modern LLMs are built on the **transformer** architecture, introduced in the 2017 paper *Attention
Is All You Need*. Its key mechanism, **self-attention**, lets every token look at every other token
in the context and decide how much each one matters for predicting what comes next. When you write
"Summarize the report below for a CFO", attention is how "CFO" influences the vocabulary and focus
of a summary written hundreds of tokens later.

You'll sometimes see two families mentioned:

- **Decoder-style models** (the GPT family and most chat models) generate text left to right.
- **Encoder-style models** (such as BERT) read text in both directions and are mostly used for
  classification and search rather than open-ended writing.

### How models are trained

1. **Pretraining**: the model learns to predict the next token over a very large amount of text.
   This is where its knowledge, language skill, and also its biases come from. For scale: GPT-3,
   described in 2020, had 175 billion **parameters** (the adjustable numbers inside the network).
2. **Instruction tuning and feedback training**: the model is trained further on examples of
   helpful answers and on feedback about which answers are better. This turns a text-continuer
   into an assistant that follows instructions and declines some requests.

Some models are additionally trained to **reason** before answering, producing internal thinking
before the visible response. Lesson 11 covers how that changes prompting.

### The context window

The **context window** is everything the model can see in one request: the system prompt, the
conversation so far, any documents, tool results, and the response it's writing. It's measured in
tokens. Sizes have grown enormously: GPT-3's window was 2,048 tokens, while some current models
accept a million or more.

Two things follow:

- **The model has no memory outside the window.** In a chat app, the app resends the conversation
  each turn. When a conversation gets too long, older parts may be dropped or summarized, and the
  model can lose early instructions. "Memory" features work by saving notes and inserting them into
  later prompts: still the context window, just managed for you.
- **Position matters.** Research on long contexts (*Lost in the Middle*, 2023) found models often
  use information best when it's at the **beginning or end** of the context, and worse when it's
  buried in the middle. Lesson 16 turns this into layout rules.

### The knowledge cutoff

A model's built-in knowledge stops at its **training cutoff**. It doesn't know what happened after,
and it may not realize that it doesn't know. For anything recent or fast-changing, give it the facts
or a search tool.

### Randomness and stability

Because responses are sampled, the same prompt can produce different wording, different structure,
and occasionally a different answer. That's useful for brainstorming and a problem for automation.
You'll make outputs more consistent mainly by making prompts more specific and adding examples
(Lessons 3-7), not by hoping for the same luck twice.

### Hallucination

A **hallucination** is fluent, confident output that is false or unsupported: a made-up statistic, a
citation to a paper that doesn't exist, a wrong date. It happens because the model generates
*plausible* text; it isn't retrieving verified facts. Hallucination is more likely when the prompt
asks for specifics the model doesn't have (obscure facts, exact numbers, quotes, references).
Mitigations you'll learn: provide source material, ask the model to answer only from it, allow "I
don't know", and verify anything important.

### Bias

Models learn patterns from human-written text, including stereotypes. Ask for "a story about a
nurse and an engineer" and the default characters may follow a stereotype. Bias can also affect
judgments such as ranking résumés. You can reduce it with explicit instructions and careful
evaluation (Lesson 23), but you can't assume it away.

### Does the model "understand"?

People disagree. Philosophers have argued for decades (for example, John Searle's "Chinese Room"
thought experiment) that producing the right symbols isn't the same as understanding them. In
practice, take a working stance: treat the model as a very capable pattern-continuer that can
reason surprisingly well, can be confidently wrong, and needs clear instructions. Don't assume it
shares your goals or context unless you state them.

# Key Terminology

- **Tokenizer**: the component that splits text into tokens; different models use different ones.
- **Parameters**: the adjustable numbers inside a neural network that training sets.
- **Transformer**: the neural network architecture behind modern LLMs.
- **Self-attention**: the mechanism that lets each token weigh every other token in the context.
- **Context window**: the maximum number of tokens a model can consider in one request, input and
  output together.
- **Knowledge cutoff**: the date after which a model's training data has no information.
- **Hallucination**: fluent but false or unsupported output.
- **Stateless**: each request stands alone; any "memory" must be sent again in the prompt.

# Options and Trade-offs

| Limitation | Why it happens | What to do in your prompt or setup |
| --- | --- | --- |
| Lengths come out wrong | Tokens aren't words | Ask for words, sentences, or paragraphs |
| Different answer each run | Responses are sampled | Be more specific; add examples; test several runs |
| Forgets early instructions | Context window limits and position effects | Restate key rules; summarize and restart long chats |
| Doesn't know recent events | Knowledge cutoff | Paste the facts or use a search tool |
| Invents facts or citations | It generates plausible text | Provide sources; allow "I don't know"; verify |
| Stereotyped defaults | Patterns in training data | Specify what you want; review outputs for bias |
| Arithmetic slips | Numbers are split into tokens; it predicts digits | Ask it to write or run code for exact math |

# Worked Example

You're writing an FAQ with a model and want each answer to fit a small help-center widget.

**Attempt 1:**

```text
Answer this FAQ question in 50 tokens: How do I reset my password?
```

The answers come out at uneven lengths. "Tokens" means nothing to the model as a writing target,
and you can't easily count them either.

**Attempt 2:**

```text
Answer this FAQ question in 2 short sentences (under 40 words total), using
plain language for non-technical customers: How do I reset my password?
```

Now the length is something both you and the model understand. If you also set a maximum output
limit in an API call, treat it as a **safety cap**, not a writing instruction: a token limit
doesn't make the model write concisely. It cuts the response off mid-sentence when reached
(Lesson 13).

# Real World Analogy

A language model is like an **improv actor who has read an enormous library**. Give them a scene
("You're a patient math tutor; the student just got question 3 wrong") and they continue it
fluently, drawing on everything they've read. They're brilliant at staying in the scene, but they
only know what's been said on stage tonight, and if the scene calls for a fact they don't know,
they may confidently improvise one. Your prompt is the scene-setting. The clearer it is, the less
improvising they have to do.

# Examples

## Example 1 — Basic: asking for length the right way

```text
Explain photosynthesis in exactly 3 sentences for a 10-year-old.
```

**Why this works:** sentences are a unit the model reliably counts and you can check at a glance.

## Example 2 — Real-world: rescuing a long conversation

After two hours of brainstorming in one chat, the model starts ignoring the style rules you set at
the beginning. Instead of repeating yourself, ask for a handoff summary and start fresh:

```text
Summarize this conversation for a fresh start: the goal, the decisions we've
made, the style rules I set, and the open questions. Use short bullet points.
```

Paste the summary into a new conversation. **Why this works:** the key facts move from the buried
middle of a huge context to the very start of a small one.

## Example 3 — Pitfall: asking for references

```text
List five peer-reviewed papers that prove remote work increases productivity,
with authors, years, and DOIs.
```

**What goes wrong:** the request is for exact, checkable specifics, which is where models are most
likely to produce plausible but nonexistent papers or DOIs. **Fix:** use a tool with real search, or
ask the model to suggest *search terms and databases*, then check every reference yourself.

# Common Mistakes

- **Measuring length in tokens** when you mean words or sentences.
- **Assuming the model remembers** something from another chat or from an hour ago in a very long
  one.
- **Asking about recent events** without giving the model the facts or a search tool.
- **Treating confident tone as evidence.** Hallucinations sound exactly as confident as facts.
- **Trusting model arithmetic** for anything that must be exact.

# Best Practices

- Put the most important instructions where the model uses them best: near the **start**, and
  restate critical rules near the **end** of long prompts.
- For long-running work, **summarize and restart** instead of letting a chat grow forever.
- Give the model **source material** for factual tasks and tell it to say when the answer isn't in
  the source.
- Use **code or tools** for exact math, dates, and counting.
- Test important prompts **more than once**; randomness is normal.

# Summary

- Models read and write **tokens**, which don't map neatly to words. Ask for lengths in words or
  sentences.
- Generation is repeated **next-token prediction**; sampling from probabilities makes outputs vary.
- **Self-attention** lets every token influence every other, which is how your context shapes the
  answer.
- The **context window** is the model's entire world for a request, and position within it matters.
- Models have a **knowledge cutoff**, can **hallucinate**, and reflect **biases** in their training
  data, so supply facts, allow uncertainty, and verify.

# Flash Cards

Q: What is a token?
A: A chunk of text (a word, part of a word, a number piece, or punctuation) produced by a tokenizer; models read and write tokens, not words.

Q: Why should you ask for "about 100 words" instead of "100 tokens"?
A: Tokens don't map neatly to words and vary by model, while words and sentences are units both you and the model can count.

Q: What does self-attention do?
A: It lets each token weigh every other token in the context, so earlier details (like the audience) shape later output.

Q: What is the context window?
A: Everything the model can see in one request, measured in tokens, including the system prompt, conversation, documents, and its own response.

Q: Why do models hallucinate?
A: They generate plausible continuations rather than retrieving verified facts, so they can produce confident but false specifics.

Q: Where in a long context do models tend to use information best?
A: At the beginning or the end; information buried in the middle is more likely to be missed.

# Exercises

### Easy
Ask a model the same open question three times in three fresh chats. Note what stays the same and
what changes. What does that tell you about relying on a single run?

### Medium
Find a tokenizer tool from your model provider (many vendors publish one or a token-counting API).
Compare the token counts of an English paragraph, the same paragraph in another language, a block
of code, and a list of long numbers. Which used the most tokens per word?

### Challenging
Write a two-page document with one key fact hidden in the middle. Ask a model a question that
depends on that fact. Then move the fact to the first paragraph and ask again. Repeat a few times
and record whether position changed the results.

# Further Reading

- Vaswani et al., *Attention Is All You Need* (2017): <https://arxiv.org/abs/1706.03762>
- Brown et al., *Language Models are Few-Shot Learners* (GPT-3, 2020):
  <https://arxiv.org/abs/2005.14165>
- Liu et al., *Lost in the Middle: How Language Models Use Long Contexts* (2023):
  <https://arxiv.org/abs/2307.03172>
- OpenAI Help Center — *What are tokens and how to count them?*:
  <https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  chapter 1 (LLMs and the transformer).
- Mark Austin, *How to Become a Prompt God* (2025), chapter 1.
