---
slug: hybrid-retrieval-strategies
title: "Hybrid Retrieval Strategies"
topic: rag-and-agents
kind: technique
summary: "Combine dense vector semantic search with sparse keyword search and reranking for peak retrieval accuracy."
tags: [hybrid-search, bm25, vector-search, reranking]
related: [rag-pipeline-architecture, rag-prompt-templates, citation-extraction-and-grounding]
---
> **In one line:** Hybrid retrieval fuses dense vector similarity with sparse keyword matching (BM25) and cross-encoder reranking.

## The idea

Dense vector search (using embeddings) is exceptional at matching semantic concepts: a query for `"auto repair"` easily matches documents mentioning `"vehicle mechanic"`. 

However, dense embeddings frequently fail on exact keyword lookups: SKU numbers (e.g. `Part #X49-B`), specific function names (`on_auth_state_change`), legal statutory codes, or rare acronyms. For exact tokens, traditional sparse keyword search (like BM25 or full-text inverted indexes) is vastly superior.

**Hybrid Retrieval** combines both search paradigms into an optimal two-stage pipeline:
1. **Stage 1 (Dual Retrieval)**: Query is executed against both a dense vector index (semantic similarity) and a BM25 sparse index (exact keyword matches), returning candidate sets from each.
2. **Stage 2 (Fusion & Reranking)**: Reciprocal Rank Fusion (RRF) merges the candidates. A cross-encoder **Reranker model** (such as Cohere Rerank or BGE-Reranker) scores each candidate's exact relevance to the query, passing only the top 3–5 highest-scoring chunks to the prompt.

| Retrieval Method | Strength | Fatal Weakness |
|---|---|---|
| **Dense Vector Only** | Semantic nuance, conceptual synonyms | Misses exact product codes and rare IDs |
| **Sparse BM25 Only** | Exact keyword precision, acronyms | Fails when vocabulary differs from query |
| **Hybrid + Reranking** | Best of both worlds; peak precision | Adds small compute latency (~100ms) |

## See it

```python
# Implementing Reciprocal Rank Fusion (RRF) to merge sparse and dense results
def reciprocal_rank_fusion(dense_results: list[str], sparse_results: list[str], k: int = 60) -> list[str]:
    scores = {}
    for rank, doc in enumerate(dense_results):
        scores[doc] = scores.get(doc, 0.0) + (1.0 / (k + rank + 1))
    for rank, doc in enumerate(sparse_results):
        scores[doc] = scores.get(doc, 0.0) + (1.0 / (k + rank + 1))
        
    # Sort merged documents by reciprocal rank score
    merged = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return [doc for doc, score in merged[:5]]
```

## Go deeper

Adding a cross-encoder reranker after hybrid search is often the single most effective intervention for reducing RAG hallucination. While vector search evaluates vectors independently, a cross-encoder evaluates the query and chunk simultaneously using full cross-attention, surfacing the most relevant chunk to the top of the context.

> **Tip:** Use hybrid search whenever your knowledge base contains technical part numbers, legal citations, or alphanumeric product codes.


In enterprise production environments, continuously benchmark and measure the operational trade-offs between response latency and architectural strictness. Complex nested structures require additional attention tokens, whereas concise, clearly bounded schemas minimize token overhead, reduce API billing expenses, and prevent downstream parsing exceptions across distributed microservices. Always document expected types and nullability rules explicitly.

## Watch out

- Passing 30 chunks directly into the prompt without reranking, triggering the lost-in-the-middle degradation.
- Relying exclusively on dense embeddings for code search, where exact variable names are critical.

## Remember

- Dense vectors capture semantic meaning, while sparse BM25 matches exact keywords and IDs.
- Hybrid search retrieves candidates from both methods and merges them via Reciprocal Rank Fusion.
- Cross-encoder rerankers filter candidates, delivering only peak-relevance chunks to the prompt.
