---
slug: sequential-prompt-chaining
title: "Sequential Prompt Chaining"
topic: chaining-context
kind: pattern
summary: "Decompose complex multi-step tasks into a pipeline of focused prompts with validation gates."
tags: [prompt-chaining, pipelines, architecture, decomposition]
related: [routing-and-intent-classification, parallel-chains-and-map-reduce, least-to-most-prompting]
---
> **In one line:** Sequential prompt chaining passes the output of one focused prompt as the input to the next, with validation gates between steps.

## The idea

Attempting to accomplish a massive, heterogeneous workflow in a single monolithic prompt (e.g. *"Read this raw transcript, extract key dates, calculate fiscal quarters, write an executive summary, translate it into Spanish, and format as HTML"*) frequently fails. The model loses focus, violates later constraints, and produces shallow analysis across all tasks.

**Sequential Prompt Chaining** breaks the workflow into a series of smaller, specialized prompts:
1. **Step 1 (Extract)**: Prompt 1 focuses exclusively on parsing raw data into structured facts.
2. **Step 2 (Transform / Calculate)**: Deterministic code or Prompt 2 operates on the clean facts to compute metrics.
3. **Step 3 (Synthesize)**: Prompt 3 drafts the final narrative deliverable.

Between each step, programmatic **validation gates** inspect the data, guaranteeing that errors in Step 1 are caught before propagating down the pipeline.

| Workflow Dimension | Monolithic Prompt | Sequential Prompt Chain |
|---|---|---|
| **Cognitive Load per Call** | High (must balance 5+ tasks) | Low (single focused objective) |
| **Error Isolation** | Failures break entire output | Gate catches failure at specific step |
| **Debugging** | Must tweak complex multi-part prompt | Isolate and refine only the failing step |
| **Model Selection** | Must run expensive model for everything | Use cheap/fast models for extraction, frontier for synthesis |

## See it

```python
# Sequential prompt chain with intermediate validation gate
def execute_document_pipeline(raw_contract: str) -> dict:
    # Step 1: Focused entity extraction using fast model
    prompt_extract = f"Extract all party names, dates, and liability caps: {raw_contract}"
    entities = call_llm(prompt_extract, model="gpt-4o-mini")
    
    # Validation Gate: Ensure critical fields exist
    if "liability" not in entities.lower():
        raise ValueError("Pipeline Gate Failed: Liability cap missing from extraction")
        
    # Step 2: Risk analysis using advanced frontier model
    prompt_analyze = f"Identify high-risk clauses based on extracted entities: {entities}"
    risk_analysis = call_llm(prompt_analyze, model="claude-3-7-sonnet-20250219")
    
    # Step 3: Executive briefing formatting
    prompt_brief = f"Format this risk assessment for the Board of Directors: {risk_analysis}"
    return {"entities": entities, "briefing": call_llm(prompt_brief)}
```

## Go deeper

Chaining enables heterogeneous model architectures. In a 3-step chain, Step 1 (entity extraction) and Step 3 (formatting) can run on lightweight, sub-second models (like Claude 3.5 Haiku or GPT-4o-mini), reserving expensive frontier reasoning models exclusively for the complex analysis in Step 2. This cuts overall pipeline costs by up to 70%.

> **Tip:** Pass only the relevant output from Step 1 into Step 2, stripping unneeded conversational text to keep downstream contexts clean.

## Watch out

- Creating excessively long chains (8+ steps) where cumulative latency makes user-facing features sluggish.
- Failing to build validation gates between steps, allowing hallucinated data to compound down the chain.

## Remember

- Sequential chaining breaks large workflows into discrete, single-objective prompts.
- Insert validation gates between steps to prevent error propagation.
- Optimize cost and latency by routing routine extraction steps to lighter, faster models.
