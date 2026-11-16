---
slug: prompt-patterns-overview
title: "The Prompt Pattern Catalog"
topic: prompt-patterns
kind: concept
summary: "Understand the software design pattern catalog adapted for generative AI by White et al."
tags: [prompt-patterns, design-patterns, architecture, catalog]
related: [meta-language-pattern, recipe-pattern, flipped-interaction-pattern]
---
> **In one line:** Prompt patterns are reusable, named architectural solutions to recurring problems in generative AI interactions.

## The idea

In 1994, the Gang of Four formalized software design patterns to give engineers a shared vocabulary for recurring architectural problems. In 2023, Jules White and colleagues published *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (arXiv:2302.11382), adapting this foundational discipline to prompt engineering.

A **prompt pattern** is not a clever phrase or trick; it is a structured, reusable template that addresses a specific interaction failure mode or output requirement. The catalog organizes 16 fundamental patterns into six functional categories:

1. **Input Semantics**: How the model interprets incoming tokens (Meta Language).
2. **Output Customization**: How the model shapes and scopes results (Persona, Output Verifier, Template).
3. **Error Identification**: How the model surfaces its own mistakes (Fact Check List, Reflection).
4. **Prompt Improvement**: How prompts are refined iteratively (Question Refinement, Alternative Approaches).
5. **Interaction**: How human-AI conversational dynamics unfold (Flipped Interaction, Game Play).
6. **Context Control**: How context boundaries and working state are governed (Context Manager).

| Pattern Category | Core Objective | Key Catalog Patterns |
|---|---|---|
| **Input Semantics** | Define custom grammar and symbols | Meta Language Creation |
| **Output Customization** | Control format, voice, and perspective | Persona, Audience Persona, Template |
| **Error Identification** | Catch hallucinations and factual gaps | Fact Check List, Reflection |
| **Interaction** | Invert or orchestrate conversational flow | Flipped Interaction, Cognitive Verifier |
| **Context Control** | Manage conversational state and memory | Context Manager |

## See it

```python
# Composing multiple patterns from the catalog into a single coherent prompt
def compose_pattern_prompt(task_data: str) -> str:
    return f"""# Persona Pattern
You are a Staff Cloud Infrastructure Architect.

# Context Manager Pattern
Ignore all previous assumptions regarding on-premises hardware.
Focus strictly on AWS serverless primitives.

# Output Verifier Pattern
Before outputting your final recommendation, verify that every service
mentioned is HIPAA compliant and available in us-east-1.

Task:
Design an event-driven data ingestion pipeline for:
{task_data}
"""
```

## Go deeper

The power of the pattern catalog is composability. Complex enterprise prompt systems are rarely built from a single technique; they combine patterns systematically. An advanced prompt might combine the **Flipped Interaction Pattern** (interviewing the user) with the **Cognitive Verifier Pattern** (decomposing the query) and the **Fact Check List Pattern** (verifying output claims).

> **Tip:** Learn pattern names to improve engineering communication across your team: saying "Let's apply Flipped Interaction here" communicates a full architectural flow in four words.

## Watch out

- Stacking too many patterns into a single prompt, which dilutes attention and increases latency.
- Applying complex interaction patterns to simple deterministic tasks that only need basic few-shot examples.

## Remember

- The prompt pattern catalog adapts software design patterns to generative AI prompt engineering.
- Patterns provide proven, named solutions across input semantics, error checking, and interaction.
- Patterns can be composed together to construct sophisticated enterprise AI workflows.
