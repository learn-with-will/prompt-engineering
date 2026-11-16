---
slug: validating-with-pydantic
title: "Validating with Pydantic"
topic: apis-structured-outputs
kind: tool
summary: "Validate, coerce, and heal structured model completions using Pydantic schemas and automated retry loops."
tags: [pydantic, validation, error-handling, python]
related: [native-structured-outputs, prompting-for-json, schema-valid-vs-factually-true]
---
> **In one line:** Pydantic models validate types, enforce domain constraints, and generate precise error messages for automated LLM retry loops.

## The idea

While native structured outputs guarantee syntax, enterprise applications require deeper semantic data validation:
- Does the extracted date fall in the future?
- Is the extracted email a legitimate corporate domain?
- Does the numerical total equal the sum of itemized invoice lines?

**Pydantic** is the standard data validation library in modern Python. By defining expected data models as Pydantic classes, developers gain automated type coercion, field-level validators, and detailed error messages.

When validation fails, Pydantic produces clean, structured error lists (e.g. `"Field 'age': Input should be greater than 0"`). These error strings can be fed directly back into an automated LLM retry loop, informing the model of its exact mistake so it can heal the payload on the subsequent turn.

| Pydantic Feature | Application to LLM Outputs | Example |
|---|---|---|
| **Type Coercion** | Converts string `"42"` to int `42` | `id: int` |
| **Field Validators** | Enforces numerical ranges or regexes | `Field(ge=1, le=5)` |
| **Model Validators** | Validates cross-field consistency | Sum of line items == total |
| **ValidationError** | Provides feedback for prompt retries | `err.errors()` passed to model |

## See it

```python
from pydantic import BaseModel, Field, ValidationError

class Invoice(BaseModel):
    invoice_id: str
    amount: float = Field(gt=0, description="Amount must be positive")

def parse_and_heal(raw_json: str, prompt: str) -> Invoice:
    for attempt in range(2):
        try:
            return Invoice.model_validate_json(raw_json)
        except ValidationError as err:
            if attempt == 1: raise err
            repair_prompt = f"Fix JSON validation error:
{err.json()}
Request: {prompt}"
            raw_json = call_llm(repair_prompt)
```

## Go deeper

Pydantic models also serve as the source of truth for generating JSON Schemas. Calling `Invoice.model_json_schema()` produces a compliant JSON Schema specification that can be passed directly into OpenAI, Anthropic, or Gemini native structured output parameters. You write your schema once in Python, and it governs both API generation and client-side validation.

> **Tip:** Use Pydantic's `Field(description="...")` attribute; models use these field descriptions to understand the semantic intent of each key.

## Watch out

- Adding overly complex custom validators that fail on legitimate real-world edge cases.
- Infinite retry loops; always cap automated validation healing loops at 1–2 retries.

## Remember

- Pydantic validates types, ranges, and domain logic on structured model completions.
- Validation error traces can be injected back into prompt retries for automated self-healing.
- Pydantic models automatically generate the JSON Schemas required by native structured output APIs.
