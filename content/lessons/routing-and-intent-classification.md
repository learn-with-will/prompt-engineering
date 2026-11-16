---
slug: routing-and-intent-classification
title: "Routing and Intent Classification"
topic: chaining-context
kind: pattern
summary: "Classify incoming user requests to route them dynamically to specialized domain prompts or tools."
tags: [routing, intent-classification, architecture, dispatch]
related: [sequential-prompt-chaining, parallel-chains-and-map-reduce, defining-tool-specifications]
---
> **In one line:** A prompt router classifies user intent into distinct categories, dispatching the request to a dedicated specialist prompt.

## The idea

A common architectural flaw in conversational systems is creating a single, gargantuan system prompt that attempts to handle every possible user intent: billing disputes, technical debugging, product sales, and cancellation refunds. As instructions accumulate, the prompt becomes fragile, instruction attention degrades, and token costs escalate.

The **Routing Pattern** decouples intent detection from execution:
1. **The Classifier (Router)**: A lightweight, low-latency prompt classifies the incoming user message into a predefined intent category (e.g. `BILLING`, `TECHNICAL`, `SALES`, `CHITCHAT`).
2. **The Dispatcher**: Application logic inspects the classification result and dispatches the request to a dedicated, highly specialized prompt template tuned exclusively for that domain.

By narrowing the scope of each specialist prompt, instructions remain concise, guardrails stay sharp, and latency drops.

| Architecture | System Prompt Size | Instruction Attention | Maintenance Complexity |
|---|---|---|---|
| **Monolithic Bot** | 3,000+ words covering all domains | Diluted; frequent instruction violations | High (modifying billing breaks sales) |
| **Routed System** | Lightweight router + 300-word specialists | Sharp, focused, domain-specific | Low (teams own modular prompt files) |

## See it

```python
# Implementing a two-tier intent router in Python
def handle_customer_message(user_message: str) -> str:
    # Tier 1: Lightweight Intent Classifier
    router_prompt = f"""Classify the user intent into exactly one category:
[BILLING, TECH_SUPPORT, GENERAL]
User Message: {user_message}
Category:"""
    
    intent = call_llm(router_prompt, model="gpt-4o-mini").strip()
    
    # Tier 2: Dispatch to specialized prompt
    if intent == "BILLING":
        return call_llm(f"You are a Billing Specialist. Resolve invoice issue: {user_message}")
    elif intent == "TECH_SUPPORT":
        return call_llm(f"You are a Senior Network Engineer. Diagnose issue: {user_message}")
    else:
        return call_llm(f"You are a helpful customer concierge. Assist: {user_message}")
```

## Go deeper

In production systems, intent routers often combine LLM classification with fast deterministic checks (such as keyword matching or regex filters for standard account IDs). If a query matches a known pattern, dispatch occurs in zero milliseconds without an LLM call; ambiguous queries fall back to the classification model.

> **Tip:** Ensure your router includes an explicit `UNKNOWN` or `GENERAL` fallback category so unexpected queries do not get misrouted into strict domain prompts.

## Watch out

- Using an expensive, slow reasoning model for simple intent routing that a lightweight model can solve in 100ms.
- Over-fragmenting intents into 30+ tiny categories that blur together and confuse the classifier.

## Remember

- The routing pattern classifies user intent upfront and delegates to specialized prompts.
- Keeps individual system prompts compact, focused, and resilient against instruction drift.
- Use fast, low-cost model tiers for the routing stage to minimize total pipeline latency.
