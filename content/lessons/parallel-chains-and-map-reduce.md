---
slug: parallel-chains-and-map-reduce
title: "Parallel Chains and Map-Reduce"
topic: chaining-context
kind: pattern
summary: "Fan out independent processing across parallel prompt calls and aggregate results with Map-Reduce."
tags: [parallel-processing, map-reduce, fan-out, scaling]
related: [sequential-prompt-chaining, routing-and-intent-classification, document-placement-in-context]
---
> **In one line:** Parallel chains process independent text chunks concurrently (Map) and combine their outputs into a unified synthesis (Reduce).

## The idea

When an analysis task involves massive amounts of text—such as analyzing 50 customer interview transcripts, auditing 20 microservice logs, or reviewing a 100-page regulatory filing—processing the entire corpus in a single sequential prompt is either impossible (exceeding context limits) or painfully slow.

The **Map-Reduce Pattern** brings distributed computing principles to prompt engineering:
1. **Chunk / Partition**: Split the large document or dataset into $N$ self-contained chunks.
2. **Map (Parallel Fan-Out)**: Execute $N$ concurrent prompt calls in parallel (using `asyncio` or thread pools). Each worker prompt processes its single chunk to extract key findings or sub-summaries.
3. **Reduce (Aggregation)**: Collect the $N$ intermediate summaries and feed them into a final synthesis prompt that reconciles contradictions, eliminates duplicates, and crafts the unified report.

| Dimension | Sequential Processing | Parallel Map-Reduce |
|---|---|---|
| **Execution Time** | $N 	imes 	ext{latency}$ (e.g. 50 calls = 100s) | $1 	imes 	ext{latency}$ (e.g. ~2-3s wall-clock time) |
| **Context Window Pressure** | Massive; high risk of lost-in-the-middle | Minimal; each call handles small, focused text |
| **Failure Blast Radius** | Single timeout fails the entire job | Failed chunks can be retried independently |

## See it

```python
import asyncio

async def map_chunk(chunk: str, chunk_id: int) -> str:
    prompt = f"Extract all security vulnerabilities mentioned in this excerpt:
{chunk}"
    return await async_call_llm(prompt)

async def map_reduce_audit(all_log_chunks: list[str]) -> str:
    # Map Phase: Concurrent execution across all chunks
    tasks = [map_chunk(c, i) for i, c in enumerate(all_log_chunks)]
    partial_findings = await asyncio.gather(*tasks)
    
    # Reduce Phase: Aggregate and synthesize
    combined_findings = "

".join(f"--- Chunk {i} ---
{f}" for i, f in enumerate(partial_findings))
    reduce_prompt = f"""Synthesize these partial security findings into an executive report.
Eliminate duplicate CVEs and prioritize by CVSS severity score:
{combined_findings}"""
    
    return await async_call_llm(reduce_prompt)
```

## Go deeper

When designing the Map prompt, ensure it outputs structured data (like JSON or bulleted key-value pairs). Standardizing the output format of the Map workers makes the Reduce prompt's aggregation job significantly easier and prevents the aggregator from hallucinating details that were missing from intermediate findings.

> **Tip:** Keep chunks slightly overlapping (e.g. 10% token overlap) to ensure that sentences or concepts split across chunk boundaries are not lost.

## Watch out

- Forgetting API rate limits; fanning out 100 concurrent calls simultaneously can trigger `429 Too Many Requests` errors.
- Using Map-Reduce for narrative fiction or stories where chronological global plot context is essential.

## Remember

- Map-Reduce fans out concurrent extraction prompts across chunks, then aggregates results.
- Slashes wall-clock processing latency on large document collections through parallelism.
- Standardize intermediate output formats from the Map stage to streamline the final Reduce synthesis.
