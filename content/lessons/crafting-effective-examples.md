---
slug: crafting-effective-examples
title: "Crafting Effective Examples"
topic: personas-examples
kind: technique
summary: "Curate balanced, diverse, and representative few-shot exemplars that generalize accurately across inputs."
tags: [few-shot, examples, data-curation, best-practices]
related: [few-shot-prompting, demonstration-pitfalls, persona-pattern]
---
> **In one line:** High-performing few-shot prompts require diverse, balanced, and cleanly delimited exemplars that mirror real-world production inputs.

## The idea

The quality of a few-shot prompt depends entirely on the quality of its demonstrations. Simply pasting the first three successful examples you produced into your prompt introduces unseen biases that degrade performance on broader test sets.

Effective exemplar design adheres to four foundational principles:
1. **Label Balance**: In classification tasks, ensure every target class is represented equally among the demonstrations. Providing three `POSITIVE` examples and zero `NEGATIVE` examples creates severe class prediction bias.
2. **Structural Consistency**: Use identical formatting tags, delimiters, and key names across all examples. Any variation in example syntax confuses the model's in-context pattern recognition.
3. **Input Diversity**: Select examples that vary in length, vocabulary, and sentence structure. If every example in an entity-extraction prompt uses short 5-word sentences, the model will struggle when handed a 200-word paragraph.
4. **Edge Case Representation**: Dedicate at least one exemplar to a boundary condition, such as handling missing data, ambiguous queries, or negative assertions.

| Principle | Why It Matters | Implementation Tactic |
|---|---|---|
| **Balance** | Avoids class frequency bias | 1:1 ratio between major classification categories |
| **Consistency** | Standardizes in-context parsing | Wrap every demonstration in `<example>` tags |
| **Diversity** | Prevents surface feature overfitting | Mix short, long, formal, and informal inputs |
| **Handling Nulls** | Demonstrates safe fallback behavior | Include an example showing how to emit `{"found": false}` |

## See it

```python
# Structuring well-curated few-shot demonstrations with XML delimiters
def build_few_shot_extractor_prompt(raw_text: str) -> str:
    return f"""Extract product mentions and sentiment. Follow the demonstration format exactly.

<example>
Input: "The battery on the ZoomX lasts all day, but the screen is dim."
Output: [
  {{"product": "ZoomX", "aspect": "battery", "sentiment": "positive"}},
  {{"product": "ZoomX", "aspect": "screen", "sentiment": "negative"}}
]
</example>

<example>
Input: "I arrived at the venue around 4 PM."
Output: []
</example>

Input: "{raw_text}"
Output:"""
```

## Go deeper

Research by Min et al. (2022, *Rethinking the Role of Demonstrations*) revealed a surprising insight: few-shot examples help models primarily by defining the **input distribution**, the **format space**, and the **valid label set**—rather than teaching the exact ground-truth relationships. Keeping your formatting clean and consistent across demonstrations is therefore critical.

> **Tip:** Encapsulate each demonstration in explicit XML tags like `<example id="1">...</example>` to keep exemplars clearly demarcated from active queries.

## Watch out

- Presenting only simple, pristine examples while production inputs are messy and noisy.
- Permitting subtle spelling or syntax errors in your examples that the model will faithfully replicate.

## Remember

- Balance label distribution evenly across examples to avoid statistical prediction bias.
- Maintain strict structural and delimiter consistency across every demonstration pair.
- Include boundary cases demonstrating how the model should respond when data is missing.
