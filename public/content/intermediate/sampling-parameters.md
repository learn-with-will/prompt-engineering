---
id: lesson-13
slug: sampling-parameters
title: "Sampling Parameters and Randomness"
level: intermediate
order: 13
duration: 26
tags:
  - temperature
  - top-p
  - max-tokens
  - stop-sequences
  - api-basics
summary: "How temperature, top-p, top-k, output limits, and stop sequences shape generation; why frontier models and APIs are removing sampling controls (Claude's API version 2026-10-21 rejects them); how to control variety and consistency without them; and a working call_llm implementation."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain how **temperature**, **top-p**, and **top-k** reshape a model's choices.
- Use **output-token limits** and **stop sequences** correctly, and check why a response stopped.
- Describe the **industry shift** away from user-set sampling parameters, with current examples.
- Control **consistency and variety** with prompting when sampling knobs aren't available.
- Implement the course's **`call_llm`** helper with a real SDK.

# Why It Matters

For years, "set temperature to 0.2 for facts and 0.9 for creativity" was standard advice, and both
source books teach it. The mechanics still matter: they explain why outputs vary, and you'll meet
these settings in open-weight models, older models, and many APIs. But the landscape has shifted
fast. Some of the most widely used APIs now **reject or ignore** sampling settings on their newest
models. A prompt engineer needs to understand both the knobs and what to do when the knobs are gone.

# Concept Explanation

### Where the knobs act

Recall from Lesson 2: at each step the model produces a probability for every possible next token,
then **samples** one. Sampling parameters change that last step, not the model's knowledge or
reasoning.

### Temperature

**Temperature** rescales the probabilities before sampling. Low temperature sharpens them (the
likeliest token becomes even likelier); high temperature flattens them (unlikely tokens get more
chances). This runnable sketch applies temperature to made-up scores for three candidate words:

```python
import math

def apply_temperature(scores: dict[str, float], t: float) -> dict[str, float]:
    scaled = {tok: s / t for tok, s in scores.items()}
    top = max(scaled.values())
    exps = {tok: math.exp(v - top) for tok, v in scaled.items()}
    total = sum(exps.values())
    return {tok: round(e / total, 3) for tok, e in exps.items()}

scores = {"bright": 2.0, "sunny": 1.5, "luminous": 0.5}
for t in (0.2, 1.0, 1.8):
    print(t, apply_temperature(scores, t))
# 0.2 -> "bright" almost always; 1.8 -> the three words are much closer
```

Classic guidance, where temperature is adjustable: lower for **consistent, factual, or
classification** tasks; higher for **brainstorming and creative variety**. Ranges differ by vendor;
OpenAI's Responses API, for example, documents temperature **between 0 and 2**.

Two corrections to common advice:

- **Low temperature isn't a fact-checker.** It makes the model more likely to repeat its top
  choice, which is not the same as being right. A confident wrong answer stays wrong.
- **Low temperature doesn't guarantee identical outputs.** Treat it as "less varied", not
  "deterministic", and design tests that tolerate small differences.

### Top-p and top-k

- **Top-p (nucleus sampling)** keeps only the smallest set of tokens whose probabilities add up to
  *p* and samples from those. At 0.1, only tokens in the top 10% of probability mass are considered.
- **Top-k** keeps only the *k* most likely tokens.

```python
def nucleus(probs: dict[str, float], p: float) -> list[str]:
    kept, total = [], 0.0
    for tok, prob in sorted(probs.items(), key=lambda kv: kv[1], reverse=True):
        kept.append(tok)
        total += prob
        if total >= p:
            break
    return kept

print(nucleus({"bright": 0.6, "sunny": 0.3, "luminous": 0.1}, p=0.85))  # ['bright', 'sunny']
```

Change **one** sampling knob at a time. OpenAI's API reference says it plainly: "We generally
recommend altering this or `top_p` but not both."

### Output limits and stop sequences

- **Maximum output tokens** (called `max_tokens`, `max_output_tokens`, or similar) is a **hard cap**.
  When the response reaches it, generation simply **stops**, often mid-sentence. It is not an
  instruction to be brief; the model doesn't plan around it. Mark Austin's book suggests
  "max_tokens=280" for a tweet, but 280 is a tweet's *character* limit, and tokens aren't
  characters. Ask for length in the prompt, and set the cap generously as a safety net. On models
  that reason internally, OpenAI notes the cap includes **reasoning tokens** too.
- **Stop sequences** end generation when a given string appears, which is handy for
  completion-style prompts ("stop at `###`").
- **Always check why a response ended.** APIs report a stop reason. Anthropic's Messages API, for
  example, returns values such as `end_turn` (finished naturally), `max_tokens` (hit the cap),
  `stop_sequence`, `tool_use`, and `refusal`. A `max_tokens` stop means your output is truncated.

### The shift: frontier models are dropping sampling controls

As of writing (October 2026), several major vendors have moved away from user-set sampling on their
newest models:

- **Anthropic:** on Claude API version **2026-10-21**, a Messages request that sends `temperature`,
  `top_p`, or `top_k` returns a **400 error on every model**, even at the default value. Requests
  sample with the defaults (temperature 1.0). Claude 4.7 and later models already accepted only the
  defaults; the older API version still accepts other values on older models. Anthropic notes that
  on those older models, a request that lowered temperature for consistency loses that effect, and
  "no other setting replaces it."
- **Google:** the Gemini prompting guide advises keeping temperature, top-p, and top-k at their
  defaults on earlier Gemini 3 models "to avoid degraded reasoning performance", and says Gemini
  3.6+ and Gemini 4 **ignore** custom values.
- **OpenAI:** the Responses API still documents `temperature` and `top_p`, while its reasoning models
  are tuned mainly through a **reasoning effort** setting.

Meanwhile a different knob has appeared: **effort** (Anthropic's `effort`, OpenAI's
`reasoning.effort`), which controls how much a model thinks and how many tokens it spends, not how
randomly it picks words. Always check your provider's current documentation; this area changes from
release to release.

### Controlling outputs without sampling knobs

Most of the consistency you want comes from the prompt anyway:

- **For consistency:** specific instructions, a fixed output format, few-shot examples, structured
  outputs (Lesson 14), and validation with retries.
- **For variety:** ask for it explicitly ("Give 8 ideas that differ in audience, tone, and price
  point"), vary the inputs (different seed topics or constraints per call), or generate several
  candidates and pick (Lesson 12's sampling still works at default settings).
- **For depth:** use the effort or thinking setting where available, and good reasoning prompts
  (Lesson 11).

### Making `call_llm` real

Here's one complete implementation of the course's helper using Anthropic's Python SDK
(`pip install anthropic`, with your key in the `ANTHROPIC_API_KEY` environment variable). Note what
it does **not** send: no temperature, top-p, or top-k. Other vendors' SDKs follow the same shape:
a model name, a system prompt, messages, and an output cap.

```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

def call_llm(prompt: str, system: str | None = None, max_tokens: int = 4000) -> str:
    request = {
        "model": "claude-opus-5-5",  # check the provider's models page for current names
        "max_tokens": max_tokens,    # a safety cap, not a length instruction
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        request["system"] = system
    response = client.messages.create(**request)

    if response.stop_reason == "max_tokens":
        raise RuntimeError("Response was cut off; raise max_tokens or ask for less")
    if response.stop_reason == "refusal":
        raise RuntimeError("The model declined this request")
    # The reply is a list of content blocks; keep only the text blocks.
    return "".join(block.text for block in response.content if block.type == "text")
```

# Key Terminology

- **Sampling**: choosing the next token from the model's probability distribution.
- **Temperature**: a setting that sharpens (low) or flattens (high) the distribution before sampling.
- **Top-p (nucleus sampling)**: sampling only from the smallest set of tokens whose probabilities sum
  to *p*.
- **Top-k**: sampling only from the *k* most likely tokens.
- **Max output tokens**: a hard cap that truncates the response when reached.
- **Stop sequence**: a string that ends generation when it appears.
- **Stop reason**: the API's explanation of why a response ended (finished, cap, stop sequence,
  tool call, refusal).
- **Effort**: a setting on reasoning-capable models that controls how much they think and spend.

# Options and Trade-offs

| Control | What it really does | Good for | Caveat |
| --- | --- | --- | --- |
| Low temperature | Favors the top choice | Consistency where supported | Not accuracy; not guaranteed identical |
| High temperature | More varied choices | Brainstorming where supported | More off-target output |
| Top-p / top-k | Trims unlikely tokens | Fine control where supported | Change one knob, not both |
| Output-token cap | Truncates at a limit | Cost and runaway protection | Doesn't make text concise |
| Stop sequences | Ends at a marker | Completion-style formats | Marker must not appear in normal text |
| Effort / thinking | Depth of reasoning and token spend | Hard tasks vs cheap, fast ones | Varies by model; measure |
| Prompt, examples, schema | Shapes the output itself | Consistency on any model | Takes design and testing |

# Worked Example

Your app generates product names and also classifies support tickets. It was built with
`temperature=0` for tickets and `temperature=1.2` for names, and after an API upgrade both settings
are rejected.

**Tickets (needed consistency):** remove the parameter and get consistency from the prompt instead:
fixed labels with definitions, three to five examples, structured output with an enum of allowed
labels (Lesson 14), and a validation check. Then run your ticket test set and compare accuracy with
the old version.

**Names (needed variety):** replace "be creative" plus high temperature with explicit variety
instructions:

```text
Generate 10 names for a reusable coffee cup brand. Make them deliberately
different: 3 playful, 3 premium, 2 eco-focused, 2 that work as a single
made-up word. No two names may share a first letter.
```

Explicit structure produces more reliable variety than turning up randomness ever did, and it
works on every model.

# Real World Analogy

Sampling parameters are like the instructions you give a **jazz musician**. Temperature is how far
they may stray from the melody; top-p is which notes are allowed at all; the output cap is the
moment the stage manager cuts the lights, finished solo or not. Many of today's top players now
play their own way no matter what you say about straying from the melody. So you guide them the
way a good bandleader does: with the chart (your prompt), examples of the sound you want, and a
clear ending, not by shouting "be more random".

# Examples

## Example 1 — Basic: asking for variety explicitly

```text
Give me 6 opening lines for a short story about a lighthouse keeper. Make each
one a different genre: mystery, comedy, romance, horror, science fiction, and
literary fiction.
```

**Why this works:** variety is built into the instructions instead of left to randomness.

## Example 2 — Real-world: checking the stop reason

Your summarizer sometimes returns summaries that end mid-word. Logging shows the stop reason was
`max_tokens` on exactly those calls.

**Fix:** raise the cap and, more importantly, ask for a length in the prompt ("in 5 bullet points of
at most 15 words each"). Keep the stop-reason check so truncated output is caught instead of shown
to users.

## Example 3 — Pitfall: carrying old settings into a new API

A request still sends `temperature: 0.2`, copied from an old tutorial.

**What goes wrong:** on APIs and models that have removed sampling parameters, the request fails
with an error (on Claude API version 2026-10-21, a 400 even at the default value), or the setting is
silently ignored (as Google documents for its newest Gemini models). **Fix:** remove the parameter,
re-test outputs at the defaults, and move any consistency requirements into the prompt, examples,
and schemas.

# Common Mistakes

- **Using low temperature as a substitute for verification.**
- **Changing temperature and top-p together**, so you can't tell which mattered.
- **Treating the output-token cap as a length instruction**, then shipping truncated text.
- **Ignoring the stop reason**, so truncations and refusals look like normal answers.
- **Copying sampling settings from old tutorials** into APIs that now reject or ignore them.

# Best Practices

- Learn the knobs, but **put your requirements in the prompt**, where they work on every model.
- Where sampling is adjustable, **change one setting at a time** and measure on a test set.
- Set **generous output caps** and always **check the stop reason**.
- Ask for **variety explicitly** and for **length in words, sentences, or items**.
- **Re-check vendor docs** when upgrading SDKs or models; sampling and effort settings change often.

# Summary

- Sampling parameters reshape the final token choice: **temperature** sharpens or flattens,
  **top-p/top-k** trim the candidates.
- The **output-token cap truncates**; **stop sequences** end at a marker; always check the **stop
  reason**.
- Frontier models are **dropping sampling controls**: Claude API version 2026-10-21 rejects them,
  and Google's newest Gemini models ignore them; **effort** settings now control depth instead.
- Get **consistency** from specific prompts, examples, and schemas; get **variety** by asking for it.
- A real **`call_llm`** sends a model, a system prompt, messages, and a cap, and checks why the
  response ended.

# Flash Cards

Q: What does temperature do?
A: It rescales next-token probabilities before sampling: low sharpens them toward the top choice, high flattens them for more variety.

Q: What is top-p (nucleus) sampling?
A: Sampling only from the smallest set of tokens whose probabilities add up to p.

Q: What happens when a response hits the output-token cap?
A: It's cut off, often mid-sentence, and the stop reason reports the cap (for example, max_tokens).

Q: What changed for sampling parameters on Claude API version 2026-10-21?
A: Requests that send temperature, top_p, or top_k return a 400 error on every model, even at default values.

Q: Why doesn't low temperature make answers more accurate?
A: It only makes the model repeat its most likely choice more often; if that choice is wrong, it stays wrong.

Q: How can you get varied outputs without a temperature setting?
A: Ask for variety explicitly (different genres, audiences, constraints), vary the inputs, or generate several candidates and choose.

# Exercises

### Easy
In a tool where you can still set temperature (an open-weight model or a playground that allows
it), generate a product slogan five times at a low and a high setting. Describe the difference.
Then get comparable variety at default settings by asking for it explicitly.

### Medium
Connect the `call_llm` implementation from this lesson (or the equivalent for your provider). Write
a prompt that deliberately asks for a long answer with a small cap. Confirm that your code detects
the truncation through the stop reason.

### Challenging
Take a prompt that relied on low temperature for consistent output (or write one). Remove the
setting and rebuild the consistency with a fixed format, examples, and validation. Run 20 test
inputs three times each and measure how often outputs change category or format.

# Further Reading

- Anthropic — *Migrating to API version 2026-10-21* (sampling parameters removed):
  <https://platform.claude.com/docs/en/api/migration-2026-10-21>
- Google — *Prompt design strategies* (temperature guidance for Gemini models):
  <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- OpenAI — *Responses API reference* (temperature, top_p, max_output_tokens):
  <https://developers.openai.com/api/reference/resources/responses/methods/create>
- OpenAI — *Reasoning models* guide (reasoning effort): <https://platform.openai.com/docs/guides/reasoning>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 1.8.1 and 2.2 (temperature, top-p, and prompt stability).
- Mark Austin, *How to Become a Prompt God* (2025), section 6.1 (parameters).
