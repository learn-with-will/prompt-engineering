---
slug: rag-pipeline-architecture
title: "RAG Pipeline Architecture"
topic: rag-and-agents
kind: concept
summary: "Understand the end-to-end RAG architecture: document chunking, embeddings, indexing, retrieval, and generation."
tags: [rag, retrieval, embeddings, vector-search]
related: [hybrid-retrieval-strategies, rag-prompt-templates, citation-extraction-and-grounding]
---
> **In one line:** Retrieval-Augmented Generation injects relevant external document chunks into the prompt context at query time.

## The idea

Foundation models possess vast parametric knowledge, but their internal weights are frozen at their knowledge cutoff and cannot access private enterprise data. 

Pioneered by Patrick Lewis and colleagues at Meta AI (2020, *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, arXiv:2005.11401), **RAG** couples a non-parametric retrieval index with a parametric generator model:
1. **Chunking**: Source documents are split into manageable token segments (e.g. 300–500 tokens).
2. **Embedding**: An embedding model converts chunks into dense vector representations.
3. **Indexing**: Vectors are stored in a database (e.g. pgvector, Pinecone, Qdrant) alongside original text.
4. **Retrieval**: At runtime, the user's query is embedded, and the vector index returns the top-$k$ most similar chunks.
5. **Generation**: A prompt synthesizes the user query with the retrieved chunks to generate a grounded answer.

| RAG Component | Operational Function | Key Performance Metric |
|---|---|---|
| **Chunker** | Breaks documents into semantic segments | Chunk overlap and semantic boundary preservation |
| **Embedding Model** | Maps text into high-dimensional vector space | Top-k recall and Cosine similarity separation |
| **Vector Index** | Performs fast approximate nearest-neighbor search | Retrieval latency (sub-50ms) |
| **Generator Prompt** | Grounds output and synthesizes answer | Factual faithfulness and hallucination rate |

## See it

```python
# Minimal end-to-end RAG retrieval and synthesis loop
def rag_query(user_question: str, vector_store) -> str:
    # 1. Embed query and retrieve top-3 most similar chunks
    query_vec = get_embedding(user_question)
    top_chunks = vector_store.search(query_vec, top_k=3)
    
    # 2. Format context block with document boundaries
    context = "

".join(f"<chunk id='{c.id}'>{c.text}</chunk>" for c in top_chunks)
    
    # 3. Prompt generator with strict grounding instructions
    prompt = f"""You are a grounded factual assistant.
Answer the question below using strictly the reference chunks in <context>.
If the answer cannot be found in <context>, state: 'I do not have verified data.'

<context>
{context}
</context>

Question: {user_question}
Answer:"""
    return call_llm(prompt)
```

## Go deeper

RAG shifts the burden of factual accuracy from the model's stochastic weights to deterministic retrieval. When business facts change (e.g. pricing updates or policy changes), updating the vector database updates the model's responses instantly without expensive model fine-tuning or retraining.

> **Tip:** Keep chunk sizes aligned with your expected answer size; overly large chunks dilute vector similarity, while overly small chunks fragment semantic context.

## Watch out

- Injecting retrieved chunks into the prompt without instructing the model to refuse when the answer is absent.
- Splitting code or JSON documents on naive character counts that break syntax trees.

## Remember

- RAG combines external document retrieval with in-context generative synthesis.
- Enables models to reference private, real-time, and domain-specific knowledge bases.
- Updating vector databases updates model knowledge instantly without weight retraining.
