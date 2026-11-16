---
slug: building-a-model-client
title: "Building a Model-Agnostic Client"
topic: apis-structured-outputs
kind: technique
summary: "Construct a clean, resilient Python wrapper to invoke OpenAI, Anthropic, and Gemini models interchangeably."
tags: [client, python, architecture, wrapper]
related: [temperature-and-top-p, stop-sequences-and-limits, cross-model-prompt-portability]
---
> **In one line:** A model-agnostic client wraps vendor SDK differences behind a unified `call_llm` interface with consistent retries and error handling.

## The idea

Vendor SDKs churn constantly. OpenAI uses `client.chat.completions.create()`, Anthropic uses `client.messages.create()`, and Google uses `genai.Client()`. If application code calls vendor-specific SDK methods directly inside business logic, switching models or running multi-model evaluation requires massive code rewrites.

Building a lightweight, model-agnostic wrapper standardizes the invocation interface across providers:
- **Unified Signature**: A single callable `call_llm(prompt, system=None, model="default")`.
- **Normalized Responses**: Returns clean string completions regardless of whether the vendor packages text in `choices[0].message.content` or `content[0].text`.
- **Integrated Retries**: Implements exponential backoff for transient rate limits (`429`) and server errors (`500`, `503`).
- **Telemetry & Logging**: Records token consumption, latency, and model versions centrally in one place.

| Feature | Direct Vendor SDK Call | Unified Client Wrapper |
|---|---|---|
| **Code Coupling** | Tight lock-in to one provider | Decoupled; swap models via config flag |
| **Retry Logic** | Must be reimplemented at every call site | Centralized exponential backoff |
| **Token Logging** | Scattered across codebase | Centralized observability hook |

## See it

```python
import os
import time

def call_llm(prompt: str, system: str = None, model: str = "claude") -> str:
    """Unified provider-agnostic interface with exponential backoff."""
    for attempt in range(3):
        try:
            if model.startswith("claude"):
                import anthropic
                client = anthropic.Anthropic()
                resp = client.messages.create(
                    model="claude-3-7-sonnet-20250219", max_tokens=1024,
                    system=system or "", messages=[{"role": "user", "content": prompt}]
                )
                return resp.content[0].text
            else:
                import openai
                client = openai.OpenAI()
                msgs = [{"role": "system", "content": system}] if system else []
                msgs.append({"role": "user", "content": prompt})
                resp = client.chat.completions.create(model="gpt-4o", messages=msgs)
                return resp.choices[0].message.content
        except Exception as err:
            if attempt == 2: raise err
            time.sleep(2 ** attempt)
```

## Go deeper

In production, enhance this client wrapper by integrating OpenTelemetry traces and tracking prompt tokens versus completion tokens. Storing the exact prompt string alongside the returned completion and model version allows your data science team to curate golden regression datasets from live production traffic.

> **Tip:** Use environment variables (e.g. `LLM_PROVIDER=anthropic`) to switch between development models and production models without code changes.

## Watch out

- Silently swallowing exceptions in retry loops, obscuring authentication or billing errors.
- Hardcoding API keys inside client wrapper files instead of reading environment variables.

## Remember

- Wrap vendor SDKs behind a unified client interface like `call_llm(prompt, system)`.
- Standardize response extraction, error handling, and exponential backoff in one module.
- Decoupling API calls enables seamless model switching and cross-provider benchmarking.
