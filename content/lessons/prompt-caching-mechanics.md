---
slug: prompt-caching-mechanics
title: "Prompt Caching Mechanics"
topic: chaining-context
kind: api
summary: "Slash API costs by up to 90% and cut time-to-first-token latency using provider prompt caching."
tags: [prompt-caching, optimization, latency, cost-reduction]
related: [context-window-mechanics, document-placement-in-context, conversation-memory-strategies]
---
> **In one line:** Prompt caching reuses pre-computed attention states across identical prompt prefixes, cutting latency and input costs by up to 90%.

## The idea

In many enterprise workflows, large portions of the prompt context remain static across multiple queries: system instructions, legal disclaimers, large reference codebases, or few-shot demonstration banks. Without caching, the provider's GPU cluster must re-compute self-attention over these thousands of identical tokens on every single API call.

**Prompt Caching** (supported by Anthropic, OpenAI, and Google) stores the KV-cache (Key-Value attention state) of stable prompt prefixes in high-speed GPU memory. When a subsequent request begins with the identical sequence of tokens, the model skips pre-filling those tokens, reading the attention state directly from cache.

The benefits are dramatic:
- **Cost Reduction**: Cached input tokens receive a massive discount (typically **75% to 90% cheaper** than standard input tokens).
- **Latency Acceleration**: Time-to-first-token (TTFT) drops from seconds to milliseconds, because the model bypasses the forward pass on cached tokens.
- **Cache Invalidation**: Caches are exact prefix matches. Modifying a single character at the start of a prompt invalidates the entire cache for all subsequent tokens.

| Metric | Without Prompt Caching | With Prompt Caching (Hit) | Typical Savings |
|---|---|---|---|
| **Input Token Cost** | 100% full price | 10% to 25% of standard price | **75% – 90% cost savings** |
| **Time-to-First-Token** | 3.5 seconds (over 50k tokens) | ~300 milliseconds | **80%+ latency reduction** |
| **Minimum Prefix Threshold** | N/A | Typically 1,024 tokens | Must exceed minimum token block |

## See it

```python
import anthropic

client = anthropic.Anthropic()

# Anthropic prompt caching on a static 20k token document
response = client.messages.create(
    model="claude-3-7-sonnet-20250219", max_tokens=1024,
    system=[
        {"type": "text", "text": "You are a code assistant."},
        {"type": "text", "text": LARGE_DOCS, "cache_control": {"type": "ephemeral"}}
    ],
    messages=[{"role": "user", "content": "How do I authenticate?"}]
)
print(f"Cached tokens read: {response.usage.cache_read_input_tokens}")
```

## Go deeper

Because caching relies on **prefix matching**, you must strictly separate invariant static data from variant dynamic data:
- **Place First (Cached)**: Static system prompts, company policies, large reference documentation, few-shot examples.
- **Place Last (Uncached)**: Current timestamp, dynamic user query, ephemeral session IDs.
If you inject the current timestamp into line 1 of your system prompt, you invalidate the cache on every single call!

> **Tip:** Keep your cached prefix identical down to the exact whitespace, casing, and delimiter tags to maximize cache hit rates.

## Watch out

- Inserting timestamps, random seeds, or dynamic user IDs at the beginning of the prompt, breaking cache hits.
- Attempting to cache tiny prompts; most providers require a minimum prefix length (e.g. 1,024 tokens) to trigger caching.

## Remember

- Prompt caching reuses pre-computed attention states for identical prompt prefixes.
- Slashes input token costs by up to 90% and dramatically cuts time-to-first-token latency.
- Place all static documents at the beginning and position dynamic variables strictly at the end.
