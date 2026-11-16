---
slug: document-placement-in-context
title: "Document Placement in Context"
topic: chaining-context
kind: technique
summary: "Counteract the lost-in-the-middle effect by structuring long-context prompts with data first and queries last."
tags: [document-placement, long-context, attention, lost-in-the-middle]
related: [context-window-mechanics, prompt-ordering-strategy, prompt-caching-mechanics]
---
> **In one line:** Place long reference documents ahead of the active instructions and queries to counter attention decay in large context windows.

## The idea

With modern context windows expanding to hundreds of thousands or millions of tokens, developers routinely feed entire technical manuals, code repositories, and annual financial filings into a single prompt.

However, research by Liu et al. (*Lost in the Middle: How Language Models Use Long Contexts*, 2023) demonstrated that model retrieval performance drops dramatically when relevant information is buried in the middle 70% of the context window.

To maximize retrieval fidelity across long documents:
1. **Context First, Query Last**: Place reference documents near the top/middle of the prompt, and place the specific user query, instructions, and output format at the very bottom.
2. **Quote Before Answering**: Force the model to quote relevant excerpts from the document inside `<quotes>` tags before drafting its answer. Generating the quote brings the relevant tokens into the active generation horizon.
3. **Structured Document Delimiters**: Enclose each document in unique XML tags with metadata attributes (e.g. `<document id="doc_3" title="API Spec">`).

| Context Layout Strategy | Attention on Query | Retrieval Accuracy |
|---|---|---|
| **Query First, Documents Last** | Low (query is distant from output point) | Moderate / Degraded on long docs |
| **Documents First, Query Last** | High (query is adjacent to generation point) | Up to **30% higher** factual accuracy |
| **Document + Quote Mandate** | Peak (model reproduces evidence before synthesis) | Maximum grounding and auditability |

## See it

```python
# Optimal long-context layout with document tagging and quote extraction
def build_long_doc_prompt(documents: list[dict], user_question: str) -> str:
    formatted_docs = []
    for doc in documents:
        formatted_docs.append(f"<document id='{doc['id']}'>
{doc['text']}
</document>")
    
    docs_block = "

".join(formatted_docs)
    
    # Query, instructions, and quote mandate placed AFTER the documents
    return f"""You are a research analyst. Refer strictly to the documents below.

{docs_block}

Instructions:
1. Find the relevant sections in the documents above.
2. Extract the exact supporting quotes inside <quotes> tags.
3. Formulate your answer based strictly on those quotes inside <answer> tags.

Question: {user_question}
"""
```

## Go deeper

Official documentation from Anthropic notes that positioning reference material before the question can improve response quality by up to 30 percent in long-context evaluations. This simple structural reorganization costs zero tokens and requires no model retraining, yet directly exploits how self-attention weights prioritize recent tokens.

> **Tip:** If the user query is long or contains multiple sub-questions, repeat the core question at the very end of the prompt immediately preceding the response primer.

## Watch out

- Placing instructions at the top, followed by 50 pages of text, with no closing prompt directions.
- Splitting a document across arbitrary token boundaries without preserving structural paragraphs.

## Remember

- Model attention degrades significantly when critical facts are buried in the middle of long contexts.
- Structure prompts with reference documents first, followed by active instructions and queries last.
- Mandate quote extraction before answer synthesis to pull relevant tokens into the generation horizon.
