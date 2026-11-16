---
slug: context-window-mechanics
title: "Context Window Mechanics"
topic: foundations
kind: concept
summary: "Understand context window limits, the lost-in-the-middle effect, and how token layout influences model recall."
tags: [context-window, attention, recall, long-context]
related: [tokens-and-tokenization, next-token-prediction, document-placement-in-context]
---
> **In one line:** The context window is the maximum sequence of tokens a model can observe at once, with information at the beginning and end retrieved most reliably.

## The idea

The context window defines the working memory of an LLM. Everything the model considers—system rules, conversational history, uploaded reference documents, few-shot examples, and the output generated so far—must fit within this fixed token envelope. Modern context windows range from 8,000 tokens in small local models to 1,000,000+ tokens in frontier models.

However, having a 1-million-token context window does not imply uniform recall across all 1 million tokens. Research by Liu et al. (*Lost in the Middle*, 2023) demonstrated that model performance follows a U-shaped curve:
- **Primacy Effect**: Information placed at the very beginning of the context (system prompt, top-level guidelines) is attended to with high fidelity.
- **Recency Effect**: Information placed at the very end of the context (the immediate user query, output formatting triggers) is recalled with peak accuracy.
- **Middle Degradation**: Facts, constraints, or documents placed in the middle of long contexts suffer noticeable degradation in attention and recall.

| Context Region | Attention Strength | Recommended Content |
|---|---|---|
| **Beginning** (First 15%) | High | Standing system instructions, critical personas, safety boundaries |
| **Middle** (Core 70%) | Moderate / Degraded | Large reference texts, raw documents, bulk background data |
| **End** (Final 15%) | Peak | Specific question, formatting directives, response primers |

## See it

```python
# Optimal context layout countering 'Lost in the Middle'
def structure_long_context_prompt(system_rules: str, docs: list[str], question: str) -> str:
    combined_docs = "

".join(f"<doc id='{i}'>{d}</doc>" for i, d in enumerate(docs))
    return f"""{system_rules}

Reference Documents:
{combined_docs}

Task Instructions:
Answer the question below using only the reference documents provided above.
Always quote the source document ID before stating your answer.

Question: {question}
Answer:"""
```

## Go deeper

When context windows fill up during long multi-turn chats, applications must truncate or compress older messages. If conversational history exceeds the context budget, the API returns a validation error or silent truncation occurs, resulting in sudden amnesia regarding past agreements.

> **Tip:** When prompting over long documents, place the source material in the middle and repeat the core instruction and format requirement at the very end.

## Watch out

- Hiding critical constraints in the middle of a 20-page document transcript.
- Assuming infinite context eliminates the need to filter out irrelevant background material.

## Remember

- The context window bounds the combined total of instructions, documents, and generated output.
- Recall follows a U-curve: data at the start and end receives the strongest attention.
- Place large reference documents first and restate specific queries and constraints at the end.
