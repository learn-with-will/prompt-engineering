---
slug: prompting-for-json
title: "Prompting for JSON"
topic: apis-structured-outputs
kind: technique
summary: "Elicit valid JSON from base chat models using explicit schemas, delimiters, and assistant priming."
tags: [json, structured-data, parsing, formatting]
related: [native-structured-outputs, validating-with-pydantic, specifying-output-formats]
---
> **In one line:** Prompting for JSON requires an explicit schema, trailing syntax triggers, and negative constraints against markdown wrappers.

## The idea

Before native structured output APIs existed, extracting structured data from language models required careful prompt engineering. Even today, when working with open-weight models, local inference endpoints (e.g. Ollama, vLLM), or older API tiers, developers must rely on prompt-level JSON elicitation.

Base chat models naturally want to be conversational. When asked for JSON, a naive model often outputs:
`Here is the JSON you requested:
```json
{"status": "ok"}
```
Let me know if you need anything else!`
This markdown code fence and conversational wrapping causes standard `json.loads()` parsers to crash with JSONDecodeErrors.

To reliably extract JSON via prompting:
1. **Provide the Exact Schema**: Include a JSON Schema or skeleton template showing exact keys and types.
2. **Explicit Constraint**: Instruct: *"Output valid, raw JSON only. Do not include markdown code fences (```), commentary, or explanations."*
3. **Trailing Trigger**: Conclude the prompt with an opening curly brace `{` or `JSON:` to prime immediate syntax generation.

| Technique | Purpose | Implementation |
|---|---|---|
| **Skeleton Schema** | Establishes exact key names | `{"name": string, "age": int}` |
| **No-Markdown Rule** | Prevents code fence wrapping | `"Do not wrap output in ```json"` |
| **Response Priming** | Directs model into syntax | Conclude prompt with `JSON:` or prefill `{` |

## See it

```python
import json

def prompt_extract_json(text: str) -> dict:
    prompt = f"""Extract user data as valid JSON.
Schema: {{"name": "str", "email": "str|null", "tier": "FREE|PRO"}}
Rules: Raw JSON only. No markdown fences. No commentary.

Input: {text}
JSON:"""

    raw = call_llm(prompt).strip()
    # Strip lingering markdown fences defensively
    cleaned = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(cleaned)
```

## Go deeper

When prompt-based JSON parsing fails, the error is almost always caused by: unescaped double quotes inside strings, trailing commas after the final array element, or conversational preamble before the opening `{`. Writing defensive post-processing utilities that extract text between the first `{` and last `}` makes prompt-based JSON pipelines far more resilient.

> **Tip:** Where available, prefer native Structured Outputs APIs, which enforce valid JSON deterministically at the decoding level.

## Watch out

- Trusting prompt-only JSON for mission-critical parsing without wrapping `json.loads` in a try/except retry block.
- Forgetting to specify how missing data should be represented (e.g. `null` vs empty string).

## Remember

- Prompting for JSON requires an explicit schema, anti-markdown rules, and a syntax trigger.
- Defensively strip markdown code fences before calling JSON deserializers in application code.
- Provide explicit rules for handling null values and optional fields in your schema prompt.
