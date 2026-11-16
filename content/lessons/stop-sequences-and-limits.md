---
slug: stop-sequences-and-limits
title: "Stop Sequences and Token Limits"
topic: apis-structured-outputs
kind: api
summary: "Control completion termination using stop sequences and manage max_tokens safety caps."
tags: [stop-sequences, token-limits, max-tokens, api-design]
related: [temperature-and-top-p, building-a-model-client, prompting-for-json]
---
> **In one line:** Stop sequences halt generation when specific delimiter tokens appear, while max_tokens serves as an upper safety budget.

## The idea

By default, an autoregressive language model continues generating tokens until it emits an internal End-of-Sequence (`<EOS>`) token or hits the hard token boundary specified by `max_tokens`. 

In software systems, allowing the model to meander until EOS increases latency, wastes token budget, and introduces conversational noise. Two core API parameters govern termination:
1. **Stop Sequences (`stop`)**: An array of 1–4 string patterns. The instant the model generates any sequence matching one of these strings, generation immediately terminates, and the model returns. The matched stop sequence is excluded from the returned completion.
2. **Maximum Output Tokens (`max_tokens`)**: The upper bound on generated tokens. Crucially, `max_tokens` is a safety cap against runaway generation or infinite loops—it does *not* instruct the model to write concisely. Setting a tight `max_tokens` simply truncates the sentence mid-word when the limit is reached.

| Parameter | Function | Consequence of Misuse |
|---|---|---|
| **Stop Sequence** | Halts generation upon emitting specific delimiter | Missing stop sequence allows model to generate next conversational turn |
| **Max Tokens** | Hard upper ceiling on generated output tokens | Setting too low cuts off valid JSON before closing braces `}` |
| **Finish Reason** | API return field (`stop`, `length`, `content_filter`) | Failing to check finish_reason masks truncated responses |

## See it

```python
# Utilizing stop sequences in few-shot generation to prevent conversational drift
def extract_single_field(field_name: str, raw_text: str) -> str:
    prompt = f"""Extract {field_name} from input.
Input: Order #1042 was placed by Marcus Vance on Oct 12.
Customer: Marcus Vance

Input: User report filed by Sarah Jenkins regarding billing.
Customer: Sarah Jenkins

Input: {raw_text}
Customer:"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        # Stop immediately when the model attempts to start a new line or next input
        stop=["
", "Input:"],
        max_tokens=25
    )
    return response.choices[0].message.content.strip()
```

## Go deeper

Always inspect the API's `finish_reason` (or `stop_reason` in Anthropic's SDK). If `finish_reason == "length"` (or `"max_tokens"`), your response was forcibly truncated before the model finished its thought. In JSON pipelines, this produces invalid, unparseable syntax errors. If truncation occurs, increase `max_tokens` or instruct the prompt to be more concise.

> **Tip:** Use stop sequences like `["</response>", "---", "

"]` to cleanly capture single-turn outputs without trailing hallucinations.

## Watch out

- Using `max_tokens` to force conciseness; it truncates text rather than summarizing.
- Ignoring `finish_reason` in production, allowing malformed truncated outputs to pass silently.

## Remember

- Stop sequences halt generation immediately when a specified delimiter string is generated.
- Max tokens acts as an emergency budget ceiling, not an instruction for brevity.
- Always check the API finish reason to detect when responses were truncated mid-generation.
