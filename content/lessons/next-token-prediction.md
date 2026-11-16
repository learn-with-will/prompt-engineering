---
slug: next-token-prediction
title: "Next-Token Prediction & Attention"
topic: foundations
kind: concept
summary: "Explore how autoregressive next-token prediction and attention mechanisms turn prompts into structured completions."
tags: [transformers, attention, next-token, probabilities]
related: [tokens-and-tokenization, context-window-mechanics, what-is-a-prompt]
---
> **In one line:** Models generate text autoregressively by calculating a probability distribution over the vocabulary for each subsequent token.

## The idea

Under the hood, modern transformer-based language models are next-token predictors. Given a sequence of preceding tokens $x_1, x_2, \dots, x_t$, the model processes them through self-attention layers to compute a probability distribution over its entire vocabulary (often 50,000 to 200,000 possible tokens).

The self-attention mechanism computes how strongly each token in the context attends to every other token. When generating token $t+1$, the model considers the entire context simultaneously. Once the next token is sampled, it is appended to the sequence, and the forward pass repeats.

This autoregressive loop explains several foundational prompt engineering dynamics:
- **Instruction Following**: Instruction tuning aligns the probability distribution so that helpful task completions have higher probabilities than unconstrained continuations.
- **Hallucination**: The model does not check facts; it generates tokens that appear statistically coherent given the preceding context. If a plausible continuation contains false details, the model emits them with equal confidence.
- **Tone Mimicry**: Early tokens strongly bias subsequent attention weights. Professional vocabulary in the prompt promotes professional phrasing in the response.

| Mechanism | Description | Engineering Implication |
|---|---|---|
| **Self-Attention** | Weights relationships between all input tokens | Distant instructions can be diluted by irrelevant text |
| **Logits & Softmax** | Converts network outputs to token probabilities | Output distribution can be sampled deterministically or randomly |
| **Autoregressive Loop** | Appends output tokens back into input context | Early mistakes compound over the rest of the generation |

## See it

```python
# Conceptual representation of the autoregressive next-token loop
def generate_completion(prompt_tokens: list[int], max_steps: int = 5) -> list[int]:
    sequence = list(prompt_tokens)
    for _ in range(max_steps):
        # Model forward pass outputs logits across vocabulary
        next_token_probs = model_forward(sequence)
        # Choose the most probable token (greedy decoding)
        next_token = select_top_token(next_token_probs)
        if next_token == STOP_TOKEN_ID:
            break
        sequence.append(next_token)
    return sequence
```

## Go deeper

Because attention is computed across all tokens in the context, high-attention tokens (such as headings, distinct XML tags, or words placed at the very end of the prompt) exert disproportionate influence on the predicted output. Placing critical instructions immediately adjacent to the output trigger minimizes attention decay.

> **Tip:** Prime the generation by structuring the end of your prompt to lead naturally into the answer format you expect.

## Watch out

- Believing the model 'knows' when it is guessing versus quoting verified facts.
- Allowing erroneous statements in few-shot examples to mislead subsequent generation.

## Remember

- Models generate text iteratively by predicting one token at a time based on context.
- Self-attention assigns weights between all active tokens to compute next-token probabilities.
- Coherence is not verification: models generate plausible-sounding tokens regardless of truth.
