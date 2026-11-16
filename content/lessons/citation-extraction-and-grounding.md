---
slug: citation-extraction-and-grounding
title: "Citation Extraction and Grounding"
topic: rag-and-agents
kind: technique
summary: "Force models to quote exact verbatim sentences before answering to guarantee auditability and mitigate hallucination."
tags: [citations, grounding, quote-extraction, auditability]
related: [rag-pipeline-architecture, rag-prompt-templates, reflection-and-fact-checking]
---
> **In one line:** Mandate extracting verbatim quotes from source text into `<quotes>` tags before synthesizing the final answer.

## The idea

In high-stakes enterprise applications (legal research, medical compliance, financial underwriting), merely asking a model to provide citations like `[Doc 1]` is insufficient. Models can hallucinate citation tags, appending `[Doc 1]` to sentences that Doc 1 never stated.

The **Quote-First Grounding Pattern** eliminates this vulnerability:
1. **Extraction First**: The prompt instructs the model to locate and copy the exact, verbatim sentences from the source document that support the answer, placing them inside `<quotes>` tags.
2. **Synthesis Second**: The model drafts its synthesized explanation inside `<answer>` tags, restricted to using only information present in the extracted quotes.
3. **Programmatic Verification**: A fast, deterministic Python function validates that every string inside `<quotes>` exists verbatim within the original source text. If a quote is fabricated, the response is rejected immediately.

| Grounding Technique | How It Works | Vulnerability |
|---|---|---|
| **Simple Citation Tags** | Model appends `[1]` after statements | Model can hallucinate false citation tags |
| **Quote-First Grounding** | Model copies verbatim text into `<quotes>` | Deterministically verifiable via Python `in` string check |

## See it

```python
# Implementing Quote-First Grounding with automated verification
def answer_with_verified_quotes(source_text: str, question: str) -> dict:
    prompt = f"""Source Document:
<document>
{source_text}
</document>

Instructions:
1. In <quotes>, extract verbatim sentences from <document> that answer the question.
2. In <answer>, write your concise response using ONLY facts from <quotes>.

Question: {question}"""

    raw_response = call_llm(prompt)
    quotes = extract_tag_content(raw_response, "quotes")
    answer = extract_tag_content(raw_response, "answer")
    
    # Deterministic verification: check that quotes actually exist in source
    is_grounded = all(q.strip() in source_text for q in quotes if len(q.strip()) > 10)
    return {"answer": answer, "quotes": quotes, "verified_grounded": is_grounded}
```

## Go deeper

Generating the quote first directly leverages self-attention mechanics. By writing the exact verbatim quote into the active context window *before* generating the answer, the relevant tokens become immediately available in the model's recent attention history. This virtually eliminates factual hallucination during the subsequent answer synthesis.

> **Tip:** Instruct the model: "If no relevant sentence can be quoted verbatim from the document, output `<quotes>NONE</quotes>`."

## Watch out

- Allowing the model to paraphrase inside the `<quotes>` tags, which breaks automated string verification.
- Demanding quotes that are too long, consuming excessive output token budget.

## Remember

- Citation tags can be hallucinated; require verbatim quote extraction for auditability.
- Quote-first generation primes the attention mechanism with verified source tokens.
- Deterministic Python checks can verify that extracted quotes exist verbatim in source text.
