---
slug: tokens-and-tokenization
title: "Tokens and Tokenization"
topic: foundations
kind: concept
summary: "Understand how byte-pair encoding chunks text into tokens, affects context limits, and influences costs and arithmetic."
tags: [tokens, tokenization, mechanics, bpe]
related: [next-token-prediction, context-window-mechanics, what-is-a-prompt]
---
> **In one line:** Language models process text as sub-word tokens rather than characters or words, defining memory limits, inference costs, and reasoning quirks.

## The idea

LLMs cannot process raw Unicode strings directly. Before text enters the neural network, a tokenizer transforms the character stream into a sequence of integer IDs called tokens. Most frontier models use Byte-Pair Encoding (BPE), which iteratively merges frequent character pairs into sub-word tokens.

Because tokenization operates on statistical frequencies, common English words (like `"apple"` or `"system"`) often map to a single token, whereas rare terms, complex code identifiers, non-English scripts, and numbers are fragmented across multiple tokens.

Understanding tokenization is essential for three practical reasons:
1. **Context Budgets**: Context window boundaries and rate limits count tokens, not words or characters. As a rough rule of thumb, 1 token is approximately 4 characters or 0.75 words in English.
2. **Cost Calculation**: API providers charge per million input and output tokens.
3. **Model Limitations**: Digit tokenization explains why models often make arithmetic errors or struggle with character-counting queries (e.g. "How many letters in strawberry?").

| Input String | Approximate Token Count | Tokenization Breakdown Example |
|---|---|---|
| `"Prompt engineering"` | 2 tokens | `["Prompt", " engineering"]` |
| `"unbelievably"` | 3 tokens | `["un", "believ", "ably"]` |
| `" 12849 "` | 2-3 tokens | `[" 12", "849"]` (varies by tokenizer) |
| Non-Latin text (e.g. Vietnamese) | 1.5–3x English tokens | Fragmented byte representations |

## See it

```python
# Estimating token overhead in Python
def estimate_token_metrics(text: str) -> dict:
    word_count = len(text.split())
    # Standard English heuristic: ~1.33 tokens per word
    estimated_tokens = int(word_count * 1.33)
    return {
        "words": word_count,
        "estimated_tokens": estimated_tokens,
        "est_cost_input_cents": (estimated_tokens / 1_000_000) * 300  # $3/M rate
    }
```

## Go deeper

Because numbers are split unpredictably depending on leading whitespace and digit combinations, a calculation like `348 + 927` may present the model with tokens representing `["34", "8"]` and `["9", "27"]`. This is why asking LLMs to perform multi-digit mental arithmetic frequently fails, while delegating the calculation to a Python code tool succeeds every time.

> **Watch out:** Never enforce character limits by passing `max_tokens`. Setting `max_tokens=280` does not produce a concise 280-character post; it truncates generation abruptly at 280 tokens (~1,100 characters).

## Watch out

- Confusing character counts with token limits in API parameters.
- Expecting models to count letters accurately without tools or step-by-step spelling breakdown.

## Remember

- Models read and emit tokens (sub-words), with 1,000 English tokens equaling roughly 750 words.
- Number and symbol tokenization causes arithmetic errors; use code execution for exact calculations.
- Context windows and API billing are strictly calculated using token counts.
