---
slug: native-structured-outputs
title: "Native Structured Outputs"
topic: apis-structured-outputs
kind: api
summary: "Guarantee 100% schema-valid JSON completions using native API constraints and constrained decoding."
tags: [structured-outputs, json-schema, constrained-decoding, apis]
related: [prompting-for-json, validating-with-pydantic, schema-valid-vs-factually-true]
---
> **In one line:** Native Structured Outputs use constrained decoding to mathematically guarantee that completions adhere 100% to a specified JSON Schema.

## The idea

Prompting for JSON (relying on the model to follow formatting instructions) is probabilistic; even the best models occasionally emit a trailing comma or unescaped quote, causing parsing crashes. 

**Native Structured Outputs** (introduced by OpenAI, Anthropic, and Google) solve this fundamentally through **constrained decoding**. During token generation, the API engine masks the vocabulary at every single step, allowing the model to sample only tokens that legally advance the state machine of the provided JSON Schema.

If the schema requires a boolean, the model is physically prevented from sampling anything other than `"true"` or `"false"`. The result is a **100% mathematical guarantee** that the output is syntactically valid JSON conforming to your exact schema.

| Feature | Prompted JSON | Native Structured Outputs |
|---|---|---|
| **Syntactic Guarantee** | Probabilistic (~95-99%) | Mathematical (100% valid schema) |
| **Markdown Fences** | Often present; requires stripping | Never emitted |
| **API Parameter** | None (standard prompt text) | `response_format` or `output_config` |
| **Schema Strictness** | Soft guidance | Rigid (all object properties required) |

## See it

```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class CustomerTicket(BaseModel):
    ticket_id: int
    sentiment: str  # e.g. "positive", "neutral", "negative"
    resolved: bool
    urgency_score: int  # 1 to 5

# Using OpenAI Native Structured Outputs with Pydantic
completion = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract ticket triage data."},
        {"role": "user", "content": "Ticket 841: Customer is furious about double charge! Unresolved."}
    ],
    response_format=CustomerTicket,
)

ticket: CustomerTicket = completion.choices[0].message.parsed
print(ticket.sentiment, ticket.urgency_score)  # Fully typed, guaranteed valid
```

## Go deeper

In Anthropic's Messages API, structured outputs are enabled using the `output_config` parameter with `type: "json_schema"`, or via `client.messages.parse()`. Under strict schema mode, JSON Schemas must specify `"additionalProperties": false` and mark all declared object properties in the `"required"` array to ensure the constrained decoding engine can validate grammar boundaries.

> **Tip:** When migrating from older APIs, replace complex prompt formatting rules with a clean Pydantic model passed to native structured outputs.

## Watch out

- Confusing "JSON Mode" (which only guarantees valid JSON, not schema compliance) with true "Structured Outputs".
- Assuming that because JSON is schema-valid, the extracted data is factually accurate.

## Remember

- Native Structured Outputs constrain vocabulary decoding to guarantee 100% schema validity.
- Eliminates syntax errors, missing keys, trailing commas, and markdown fence wrapping.
- Supported via native API parameters (`response_format`, `output_config`) and Pydantic integration.
