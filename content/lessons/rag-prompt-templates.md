---
slug: rag-prompt-templates
title: "RAG Prompt Templates"
topic: rag-and-agents
kind: pattern
summary: "Design strict grounding prompt templates with XML boundaries, quotation mandates, and refusal protocols."
tags: [rag-prompts, templates, grounding, citations]
related: [rag-pipeline-architecture, hybrid-retrieval-strategies, citation-extraction-and-grounding]
---
> **In one line:** RAG prompt templates enforce strict factual grounding, explicit citation rules, and refusal protocols for missing data.

## The idea

Even if a RAG pipeline retrieves the perfect document chunk, generation will fail if the prompt template allows the model to mix retrieved facts with its own internal training assumptions. An ungrounded prompt invites the model to extrapolate beyond the text.

A production-grade RAG prompt template incorporates four defensive mechanisms:
1. **Delimited Source Blocks**: Wraps each retrieved chunk in an XML tag with unique IDs (e.g. `<chunk id="doc_12">`).
2. **Closed-Domain Constraint**: Explicitly restricts the model's knowledge base to the provided chunks, barring reliance on external pre-training memories.
3. **Refusal Protocol**: Provides an exact fallback phrase (e.g. *"The provided documents do not contain information regarding X"*) to prevent guessing.
4. **Citation Mandate**: Requires the model to cite the chunk ID for every substantive assertion.

| Template Section | Purpose | Example Directive |
|---|---|---|
| **Role & Boundary** | Establish closed-domain operational rule | "Answer questions using strictly the context inside <documents>." |
| **Refusal Rule** | Prevent hallucinated extrapolation | "If the answer is not explicitly stated in the text, output 'NOT_FOUND'." |
| **Citation Schema** | Enable auditability and verification | "Append [Doc ID] after every sentence stating a factual claim." |

## See it

```python
# Production RAG prompt template with strict grounding rules
RAG_TEMPLATE = """You are an enterprise knowledge assistant.
Your task is to answer the user inquiry using strictly the verified excerpts in <documents>.

Rules:
1. Base your answer solely on facts explicitly stated in <documents>.
2. Do not assume, extrapolate, or bring in external knowledge.
3. For every claim you make, append the document tag: [doc_id].
4. If <documents> lacks sufficient data to answer fully, state:
   "I cannot answer this based on the provided documents."

<documents>
{context_chunks}
</documents>

User Question: {query}
Grounded Answer:"""
```

## Go deeper

Research demonstrates that models adhere to grounding constraints much more reliably when the refusal directive is framed as a positive professional instruction rather than a reprimand. Stating *"Acknowledge when facts are absent to preserve compliance integrity"* yields higher adherence than *"DO NOT GUESS."*

> **Tip:** Prepend document metadata (e.g. author, publish date, department) inside the chunk tag to allow the model to answer temporal queries like "What is the latest policy?"

## Watch out

- Giving ambiguous fallback instructions like "answer as best as you can if data is missing".
- Omitting unique chunk identifiers, making downstream citation verification impossible.

## Remember

- RAG prompts must establish a closed-domain boundary that forbids external extrapolation.
- Provide an explicit refusal sentence for scenarios where retrieved chunks lack the answer.
- Mandate chunk ID citations after every factual assertion to ensure auditability.
