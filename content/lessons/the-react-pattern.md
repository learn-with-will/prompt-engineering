---
slug: the-react-pattern
title: "The ReAct Pattern"
topic: rag-and-agents
kind: pattern
summary: "Interleave reasoning traces and tool actions in an autonomous Thought-Action-Observation loop."
tags: [react, agents, tools, reasoning-and-acting]
related: [defining-tool-specifications, agent-loops-and-stopping-rules, excessive-agency-and-guardrails]
---
> **In one line:** The ReAct pattern interleaves reasoning traces ('Thought') with tool executions ('Action') and environment feedback ('Observation').

## The idea

Prior to 2022, AI systems either engaged in pure reasoning (Chain-of-Thought) without the ability to act in external environments, or engaged in pure action selection (reinforcement learning) without transparent reasoning traces.

In their landmark paper (*ReAct: Synergizing Reasoning and Acting in Language Models*, arXiv:2210.03493), Shunyu Yao and colleagues introduced **ReAct**:
- **Thought**: The model reasons about the current state, identifies missing data, and plans its next move.
- **Action**: The model emits a structured command to call an external tool (e.g. search engine, calculator, SQL client).
- **Observation**: The external environment executes the tool and returns the result back into the prompt context.

This Thought $	o$ Action $	o$ Observation cycle repeats dynamically until the model deduces that it has sufficient data to emit a final answer.

| Benchmark Domain | Pure Act Baseline | ReAct (Reason + Act) | Gain |
|---|---|---|---|
| **HotpotQA** (Multi-hop QA with Wikipedia API) | 24.0% | **35.1%** | +11.1% absolute |
| **ALFWorld** (Interactive text game environment) | 45% | **71%** | +26% absolute success |
| **WebShop** (E-commerce web navigation) | 30.1% | **40.0%** | +9.9% absolute success |

## See it

```text
Question: What is the elevation difference between Mount Everest and Death Valley?

Thought 1: I need to find the elevation of Mount Everest above sea level.
Action 1: search["Mount Everest elevation"]
Observation 1: Mount Everest is Earth's highest mountain above sea level, with an elevation of 8,849 meters.

Thought 2: Now I need to find the elevation of Death Valley (specifically Badwater Basin).
Action 2: search["Death Valley lowest elevation"]
Observation 2: Badwater Basin in Death Valley is the lowest point in North America at -86 meters below sea level.

Thought 3: Now I calculate the difference: 8849 - (-86) = 8849 + 86 = 8935 meters.
Action 3: finish[8935 meters]
```

## Go deeper

The reasoning trace ('Thought') serves as the agent's internal compass. Without the thought step, models often repeat identical search queries in infinite loops when tool results are unexpected. The thought step allows the agent to diagnose unexpected tool observations (*"Search result returned disambiguation page; I should search for 'Paris, Texas' instead"*) and adjust its strategy.

> **Tip:** Prompt your ReAct agents to explain *why* they are choosing a specific tool before emitting the tool invocation syntax.


In enterprise production environments, continuously benchmark and measure the operational trade-offs between response latency and architectural strictness. Complex nested structures require additional attention tokens, whereas concise, clearly bounded schemas minimize token overhead, reduce API billing expenses, and prevent downstream parsing exceptions across distributed microservices. Always document expected types and nullability rules explicitly.

## Watch out

- Allowing agents to run in unconstrained while loops without an iteration cap (e.g. max 5 steps).
- Tool descriptions that fail to specify the exact parameters and expected return formats.

## Remember

- ReAct interleaves reasoning traces ('Thought') with tool calls ('Action') and results ('Observation').
- Yao et al. demonstrated massive task gains (HotpotQA +11%, ALFWorld +26%) over pure action models.
- Explicit thoughts enable agents to handle unexpected tool outputs and adjust strategies dynamically.
