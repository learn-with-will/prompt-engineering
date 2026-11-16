---
slug: demonstration-pitfalls
title: "Demonstration Pitfalls"
topic: personas-examples
kind: pitfall
summary: "Identify and counteract order bias, label bias, and surface leakage in few-shot demonstrations."
tags: [few-shot, pitfalls, biases, research]
related: [few-shot-prompting, crafting-effective-examples, defining-evaluation-criteria]
---
> **In one line:** Few-shot prompting introduces subtle failure modes including recency bias, majority label attraction, and spurious surface leakage.

## The idea

While few-shot prompting is powerful, empirical AI research has exposed several hidden failure modes that cause models to behave erratically despite seemingly clear examples.

Prompt engineers must actively defend against three primary demonstration pitfalls:
1. **Recency / Order Bias** (Zhao et al., 2021, *Calibrate Before Use*): Language models exhibit a pronounced tendency to repeat the label or answer format of the *very last example* provided. Shuffling the order of identical demonstrations can swing classification accuracy on test sets by up to 30 percentage points.
2. **Majority Label Bias**: If four out of five examples in your prompt belong to the `REFUND` category, the model's baseline probability distribution shifts heavily toward predicting `REFUND`, even when presented with unrelated inquiries.
3. **Surface Feature Leakage**: Models frequently lock onto superficial, accidental correlations rather than true task semantics. If all positive examples in your prompt happen to mention the name `"Alice"`, the model may begin associating the name `"Alice"` directly with positive sentiment.

| Pitfall Mode | Manifestation | Mitigation Strategy |
|---|---|---|
| **Recency Bias** | Model over-predicts the label of the final demonstration | Randomize example ordering; calibrate class distributions |
| **Majority Bias** | Model favors the most frequently shown class | Enforce strict class balance across examples |
| **Surface Leakage** | Model correlates irrelevant formatting quirks with answers | Diversify phrasing, named entities, and lengths across exemplars |

## See it

```python
# Demonstrating the mitigation of recency bias through example permutation
import random

def assemble_calibrated_few_shot(examples: list[dict], query: str) -> str:
    # Shuffle examples to prevent static order bias in production
    shuffled_examples = list(examples)
    random.shuffle(shuffled_examples)
    
    formatted = []
    for ex in shuffled_examples:
        formatted.append(f"<example>
Input: {ex['input']}
Label: {ex['label']}
</example>")
    
    return "

".join(formatted) + f"

Input: {query}
Label:"
```

## Go deeper

Research by Zhao et al. demonstrated that models suffer from inherent prior biases toward common English words (such as favoring `"hate"` over `"love"` in sentiment analysis, or favoring words that appear frequently in pre-training data). Testing your few-shot prompt with empty or gibberish inputs (e.g. `Input: "N/A"`) can reveal whether your prompt has a default label bias before deploying to production.

> **Watch out:** Never place all positive examples together followed by all negative examples. Interleave classes evenly to break spurious ordering patterns.

## Watch out

- Constructing demonstrations where one label appears 3x more often than other labels.
- Assuming a prompt that works with one fixed example order will perform equally well when evaluated broadly.

## Remember

- The order of few-shot examples significantly impacts predictions; models bias toward the final example.
- Keep label distributions strictly balanced to avoid statistical class bias.
- Guard against surface feature leakage by varying entities, lengths, and sentence structures.
