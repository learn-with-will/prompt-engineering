---
slug: agent-loops-and-stopping-rules
title: "Agent Loops and Stopping Rules"
topic: rag-and-agents
kind: technique
summary: "Implement resilient autonomous agent loops with hard iteration limits, error recovery, and termination conditions."
tags: [agent-loops, stopping-rules, autonomy, guardrails]
related: [the-react-pattern, defining-tool-specifications, excessive-agency-and-guardrails]
---
> **In one line:** Agent execution loops must be bound by strict step limits, error-handling fallbacks, and explicit termination conditions.

## The idea

An autonomous agent is fundamentally an LLM running inside a `while` loop: the model emits a tool call, application code executes the tool, feeds the observation back, and requests the next step.

Without defensive stopping rules, agent loops easily spiral into catastrophic failure modes:
- **Infinite Tool Loops**: An agent gets an error from a search tool and repeats the exact same query 50 times, consuming thousands of dollars in tokens.
- **Goal Drift**: After 10 conversational turns, the agent forgets its original objective and begins pursuing tangential sub-tasks.
- **Unbounded Agency**: An agent attempts endless exploratory calls when a simple fallback refusal was appropriate.

Production agent harnesses enforce three non-negotiable architectural boundaries:
1. **Hard Step Limits (`max_iterations`)**: Caps the loop (e.g. maximum 6 steps). If the limit is reached, the loop halts and returns an escalation error.
2. **Token & Budget Caps**: Tracks cumulative tokens across all loop turns, killing execution if budget exceeds threshold.
3. **Explicit Termination Rules**: Instructs the agent on what constitutes completion: *"Emit final answer when data is found or after 2 failed search attempts."*

| Agent Safeguard | Function | Failure Mode Prevented |
|---|---|---|
| **Max Iterations** | Caps while loop iterations (e.g. `n <= 5`) | Infinite execution loops |
| **Cumulative Token Cap** | Tracks session token expenditure | Runaway API billing spikes |
| **Loop Error Handling** | Catches tool exceptions and formats as observations | Python crashes killing the agent process |

## See it

```python
# Resilient agent execution harness with stopping rules and step caps
def run_agent_loop(initial_goal: str, tools: list[dict], max_steps: int = 5) -> str:
    messages = [{"role": "user", "content": initial_goal}]
    
    for step in range(max_steps):
        response = call_llm_with_tools(messages, tools)
        
        # Termination Condition 1: Model finished and emitted text answer
        if not response.tool_calls:
            return response.text_content
            
        # Execute tool calls
        for tool_call in response.tool_calls:
            try:
                result = execute_tool(tool_call.name, tool_call.args)
            except Exception as err:
                result = f"Tool Error: {str(err)}. Try an alternative approach."
                
            messages.append({"role": "assistant", "tool_calls": [tool_call]})
            messages.append({"role": "tool", "content": str(result)})
            
    # Termination Condition 2: Step limit exhausted
    return "Error: Agent reached maximum step limit without resolving the goal."
```

## Go deeper

When an agent encounters a tool error, do not crash the Python process. Catch the exception and feed the error string back into the prompt as the `tool` observation (*"Observation: Connection timed out"*). A well-prompted agent will inspect the error observation, formulate an alternative plan, or inform the user that the service is unavailable.

> **Tip:** Log the entire ReAct trace (every thought, tool call, and observation) to an observability platform like Langfuse to inspect agent failures in production.

## Watch out

- Writing while loops with condition `while True:` without a strict numeric iteration counter.
- Permitting agents to execute destructive write actions without user confirmation gates.

## Remember

- Autonomous agents require strict loop boundaries: max iteration caps and token budgets.
- Feed tool exceptions back into the context as observations so the agent can self-correct.
- Terminate cleanly when the model emits a final answer or exceeds the step ceiling.
