---
id: lesson-14
slug: structured-outputs
title: "Structured Outputs and JSON"
level: intermediate
order: 14
duration: 26
tags:
  - json
  - json-schema
  - structured-outputs
  - validation
  - pydantic
summary: "Getting reliable machine-readable output: prompting for JSON, designing schemas the model can fill honestly, validating and retrying in code, and using native structured-output features that guarantee schema-valid responses (but not true ones)."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Prompt for **JSON** and explain the ways prompt-only JSON breaks.
- Write a **JSON Schema** with types, required fields, enums, and no extra properties.
- **Validate and retry** model output in code with Pydantic.
- Use **native structured outputs** (a schema enforced by the API) and know what they do and don't
  guarantee.
- Design schemas that let the model say **"unknown"** instead of inventing values.

# Why It Matters

The moment model output feeds a program (a database insert, a dashboard, another API call),
"mostly right" formatting stops being good enough. One stray sentence before the JSON, one missing
field, one category spelled differently, and the pipeline breaks or, worse, silently stores bad data.
Structured outputs turn a model from a writer into a reliable component.

# Concept Explanation

### Prompting for JSON

The simplest approach is to ask, with the exact shape shown:

```text
Extract the event details from the message below. Reply with only a JSON object,
no other text, in exactly this shape:
{"title": string, "date": "YYYY-MM-DD" or null, "location": string or null,
 "attendees": [string]}

<message>
Team offsite planning: let's do the roadmap session on March 14 at the Harbor
Room. Priya, Tom, and Lena confirmed.
</message>
```

Mark Austin's book shows the same move ("list 3 ice cream flavors in JSON with name and
weirdness_score keys"), and it often works. But prompt-only JSON can fail in predictable ways:

- **Extra text**: "Sure! Here's the JSON:" before the object, or an explanation after it.
- **Markdown fences** around the JSON.
- **Invalid syntax**: trailing commas, single quotes, unescaped characters.
- **Shape drift**: missing keys, renamed keys, wrong types ("3" instead of 3).
- **Invented values**: a plausible date when the message didn't give one.

### JSON Schema: say exactly what's allowed

**JSON Schema** is a standard way to describe what valid JSON looks like. A small schema for the
event example:

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "date": { "type": ["string", "null"], "description": "ISO date YYYY-MM-DD, or null if not stated" },
    "location": { "type": ["string", "null"] },
    "attendees": { "type": "array", "items": { "type": "string" } },
    "category": { "type": "string", "enum": ["meeting", "social", "training", "other"] }
  },
  "required": ["title", "date", "location", "attendees", "category"],
  "additionalProperties": false
}
```

The key tools: **types** for each field, **required** so nothing goes missing, **enum** to lock a
field to a fixed set of labels, **null** (or an explicit "unknown" value) for information that may be
absent, and **additionalProperties: false** so the model can't add fields.

### Validate and retry in code

Even with a good prompt, validate everything a program will use. Pydantic (a popular Python
validation library) turns a schema into a class and checks JSON against it. This runnable sketch
uses the `call_llm` placeholder and retries once with the validation error:

```python
from typing import Literal, Optional
from pydantic import BaseModel, ValidationError

class Event(BaseModel):
    title: str
    date: Optional[str]          # ISO date or None
    location: Optional[str]
    attendees: list[str]
    category: Literal["meeting", "social", "training", "other"]

PROMPT = """Extract the event from the message. Reply with only a JSON object with keys
title, date (YYYY-MM-DD or null), location (or null), attendees (list of names), and
category (one of meeting, social, training, other). Use null when a value isn't stated.
<message>{message}</message>"""

def extract_event(message: str, retries: int = 1) -> Event:
    prompt = PROMPT.format(message=message)
    for attempt in range(retries + 1):
        raw = call_llm(prompt)
        try:
            return Event.model_validate_json(raw.strip())
        except ValidationError as err:
            if attempt == retries:
                raise
            prompt += (
                f"\n\nYour previous reply was invalid:\n{err}\n"
                "Reply again with only the corrected JSON object."
            )
```

Retrying with the specific error usually fixes formatting slips. If it still fails, log it and fall
back (flag for review, skip the record); never let invalid data flow on silently.

### Native structured outputs: let the API enforce the schema

Major APIs now offer **structured outputs**: you send a JSON Schema, and the API constrains
generation so the response is **guaranteed to match it**. Examples as of writing:

- **Anthropic:** `output_config={"format": {"type": "json_schema", "schema": {...}}}` on a Messages
  request, or the Python SDK's `client.messages.parse(..., output_format=PydanticModel)`, which
  returns a validated object in `response.parsed_output`.
- **OpenAI:** the Responses API's `text.format` with `{"type": "json_schema", ...}` enables
  Structured Outputs.
- **Tools:** function-calling definitions can also be made strict (for example, Anthropic's
  `strict: true` on a tool) so tool arguments always match their schema (Lesson 19).

With Anthropic's Python SDK and a Pydantic model, the extraction becomes:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.parse(
    model="claude-opus-5-5",
    max_tokens=2000,
    messages=[{"role": "user", "content": "Extract the event: Roadmap session March 14, Harbor Room. Priya and Tom confirmed."}],
    output_format=Event,  # the Pydantic class defined above
)
event = response.parsed_output  # an Event instance
print(event.title, event.date, event.attendees)
```

**What the guarantee covers, and what it doesn't:** native structured outputs guarantee the
**shape**: valid JSON, the right keys, the right types, enum values from your list. They do **not**
guarantee the **content** is true. A schema-valid date can still be the wrong date. Keep the
"use null if not stated" instruction, and verify values that matter.

### Prefill: a retired trick

An older technique for forcing JSON was **prefilling**: starting the model's reply yourself with
`{` so it had to continue as JSON. Anthropic's guide states that prefilled responses on the last
assistant turn are **not supported starting with Claude 4.6 models** (such requests return an
error), and recommends structured outputs or clear instructions instead. If you see prefill in an
old tutorial, translate it to a schema.

### Designing schemas the model can fill honestly

- **Give an honest exit**: make fields nullable or add an `"unknown"` enum value. If every field is
  required and non-null, the model is pushed to invent something.
- **Use enums for categories** instead of free text, so "Billing", "billing issue", and "BILLING"
  can't all appear.
- **Name fields descriptively** and add `description` text; the model reads them like instructions.
- **Keep it shallow**: deeply nested schemas are harder to fill and to debug.
- **Consider a short reasoning field** before the decision field (for example `"evidence"` before
  `"category"`), so the model writes its justification before committing. Test whether it helps
  your task; it costs tokens.

### When JSON isn't the right shape

For output that humans will read but programs need to split, **XML-style tags** (`<summary>`,
`<action_items>`) are often more forgiving than JSON: long prose inside a tag doesn't need escaping.
Use JSON when a program needs typed fields; use tags for semi-structured text.

# Key Terminology

- **JSON**: a text format for structured data (objects, arrays, strings, numbers, booleans, null).
- **JSON Schema**: a standard for describing which JSON documents are valid.
- **Enum**: a field restricted to a fixed list of allowed values.
- **additionalProperties: false**: a schema rule that forbids fields you didn't define.
- **Structured outputs**: an API feature that constrains generation to match a supplied schema.
- **Pydantic**: a Python library that validates data against typed models.
- **Prefill**: starting the model's reply yourself; not supported on current Claude models.

# Options and Trade-offs

| Approach | Format guarantee | Effort | Best for |
| --- | --- | --- | --- |
| Prompt-only JSON | None; usually works | Low | Prototypes, low-stakes scripts |
| Prompt plus validation and retry | Caught and corrected in code | Medium | Any provider, production-safe |
| Native structured outputs | Shape guaranteed by the API | Low once set up | Production extraction and classification |
| Strict tool definitions | Tool arguments match schema | Medium | Agents and function calling |
| XML-style tags | Loose | Low | Semi-structured text for humans and code |

# Worked Example

You're turning free-text job postings into database rows.

**v1 (prompt-only):** "Extract the job title, salary, and location as JSON." About one in ten
outputs is wrapped in a code fence, salaries appear as "$90k", "90,000", or "competitive", and remote
jobs get invented city names.

**v2 (schema and honest exits):**

```json
{
  "type": "object",
  "properties": {
    "job_title": { "type": "string" },
    "salary_min_usd": { "type": ["integer", "null"], "description": "Annual, in USD; null if not stated" },
    "salary_max_usd": { "type": ["integer", "null"] },
    "work_mode": { "type": "string", "enum": ["onsite", "hybrid", "remote", "unknown"] },
    "city": { "type": ["string", "null"], "description": "null for fully remote roles or if not stated" }
  },
  "required": ["job_title", "salary_min_usd", "salary_max_usd", "work_mode", "city"],
  "additionalProperties": false
}
```

**v3 (enforcement):** send the schema through your provider's structured-outputs feature (or
validate with Pydantic and retry), then add a business check in code: if `salary_min_usd` is
greater than `salary_max_usd`, flag the row.

Results: zero parse failures, salaries normalized to integers, "competitive" becomes `null` instead
of a guess, and remote roles no longer get fake cities.

# Real World Analogy

Prompt-only JSON is like **asking people to mail you their details in a letter**: most will include
everything, but some will forget their postcode and a few will write their life story. A schema is a
**printed form** with labeled boxes, checkboxes for fixed choices, and a box marked "N/A". Native
structured outputs are a form that physically won't let you skip a box or write in the margins. But
even a perfect form can't stop someone writing the wrong birthday in the right box, which is why you
still check what matters.

# Examples

## Example 1 — Basic: classification with an enum

```json
{
  "type": "object",
  "properties": {
    "sentiment": { "type": "string", "enum": ["positive", "negative", "neutral", "mixed"] },
    "reason": { "type": "string", "description": "One short sentence quoting the key phrase" }
  },
  "required": ["sentiment", "reason"],
  "additionalProperties": false
}
```

**Why this works:** the enum makes inconsistent labels impossible, and the reason field gives a
reviewer something to check.

## Example 2 — Real-world: extraction with validation and retry

A support system extracts `order_id`, `issue_type`, and `refund_requested` from emails using the
`extract_event`-style loop from this lesson. Invalid outputs trigger one retry with the Pydantic
error message; anything still invalid goes to a human queue with the raw email attached.

**Why this works:** the pipeline never stores unvalidated data, and failures are visible.

## Example 3 — Pitfall: no honest exit

```json
{
  "type": "object",
  "properties": { "phone_number": { "type": "string" } },
  "required": ["phone_number"],
  "additionalProperties": false
}
```

**What goes wrong:** when the text has no phone number, the schema still demands a string, so the
model may produce a plausible fake. **Fix:** allow `null` (`"type": ["string", "null"]`) and
instruct "use null if no phone number appears".

# Common Mistakes

- **Parsing model output without validation**, so one bad response breaks or corrupts the pipeline.
- **Free-text categories** instead of enums.
- **Schemas with no null or "unknown" option**, which invite invented values.
- **Believing schema-valid means correct.** The guarantee covers shape, not truth.
- **Using prefill** on models that no longer support it.

# Best Practices

- Use **native structured outputs** where available; otherwise **validate and retry** with the error.
- Design schemas with **enums, required fields, no extra properties, and honest exits**.
- Write **descriptive field names and descriptions**; they act as instructions.
- Add **business-rule checks** in code (ranges, cross-field consistency).
- **Log and route** failures to review instead of dropping or storing them silently.

# Summary

- Prompt-only JSON usually works but fails predictably: extra text, fences, bad syntax, drift,
  invented values.
- **JSON Schema** defines allowed shapes: types, required fields, enums, null, and no extra
  properties.
- **Validate and retry** in code; never let unvalidated output flow downstream.
- **Native structured outputs** guarantee the shape, not the truth; prefill is retired on current
  Claude models.
- Give the model **honest exits** (null, "unknown") so it doesn't have to invent.

# Flash Cards

Q: Name three ways prompt-only JSON commonly fails.
A: Extra text around the JSON, markdown fences or invalid syntax, and missing or renamed keys (plus invented values).

Q: What does "additionalProperties": false do in a JSON Schema?
A: It forbids any fields you didn't define.

Q: What do native structured outputs guarantee?
A: That the response matches your schema's shape (valid JSON, keys, types, enum values), not that the content is true.

Q: Why make a schema field nullable or add an "unknown" value?
A: So the model has an honest option when information is missing, instead of inventing a value.

Q: How should code handle a response that fails validation?
A: Retry with the specific validation error, and if it still fails, log it and route it to review or a fallback.

Q: What replaced prefilling for format control on current Claude models?
A: Structured outputs (a schema enforced by the API) or clear instructions, since prefill is no longer supported from Claude 4.6 models.

# Exercises

### Easy
Write a JSON Schema for a recipe (name, servings, ingredients with quantities, steps, and a
difficulty enum). Ask a model to fill it for a recipe you describe in plain words.

### Medium
Implement the validate-and-retry loop with Pydantic for an extraction task of your choice. Feed it
ten varied inputs, including two that are missing key information. Check that missing values come
back as null rather than invented.

### Challenging
Using your provider's native structured-outputs feature, build a classifier with an enum schema and
compare it against a prompt-only version on 30 inputs. Measure parse failures, label consistency, and
accuracy. Which problems did the schema fix, and which remained?

# Further Reading

- Anthropic — *Structured outputs*:
  <https://platform.claude.com/docs/en/build-with-claude/structured-outputs>
- Anthropic — *Prompting best practices* ("Migrating away from prefilled responses"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — *Structured Outputs* guide: <https://platform.openai.com/docs/guides/structured-outputs>
- JSON Schema — *Getting started*: <https://json-schema.org/learn/getting-started-step-by-step>
- Pydantic documentation: <https://docs.pydantic.dev/latest/>
- Mark Austin, *How to Become a Prompt God* (2025), section 6.2 (forcing formats).
