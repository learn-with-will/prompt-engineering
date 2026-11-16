---
slug: what-is-a-prompt
title: "What Is a Prompt?"
topic: foundations
kind: concept
summary: "Understand what prompts are, how language models process inputs, and why explicit instructions eliminate guesswork."
tags: [prompts, llm-basics, foundations]
related: [iterative-prompt-design, prompt-vs-finetuning-vs-rag, tokens-and-tokenization]
---
> **In one line:** A prompt is the full text input provided to a language model to guide its next-token generation toward a desired output.

## The idea

A prompt is everything you transmit to a large language model (LLM) in a single API call or chat interaction. It is not merely a conversational query or search keyword; it is the complete operational context that steers the model's probabilistic generation. 

When you send a request, modern language models do not look up static answers in an indexed database. Instead, they condition their internal attention mechanism on every token provided in the prompt to compute the probability distribution of subsequent tokens. A vague prompt forces the model to average over thousands of possible interpretations, yielding generic responses. An engineered prompt supplies task boundaries, persona context, input material, and output constraints, focusing the probability distribution directly onto the exact answer you need.

| Prompt Component | Function in the Request | Practical Example |
|---|---|---|
| **Instruction** | The primary task or transformation | "Summarize the customer complaint" |
| **Context** | Background information and domain setting | "The reader is a Tier 3 support engineer" |
| **Input Data** | The specific text or data to process | "Ticket #4102: Gateway timeout on checkout" |
| **Output Indicator** | The required schema or visual shape | "Provide a markdown table with 3 columns" |

## See it

In code, constructing a structured prompt means composing instructions and input data cleanly before making an inference call:

```python
def build_prompt(customer_ticket: str) -> str:
    return f"""You are an expert technical support triage assistant.
Summarize the following customer issue in two sentences.
Identify the affected system component and severity level.

Ticket text:
{customer_ticket}

Format your response as:
Component: <system name>
Severity: <Low | Medium | High | Critical>
Summary: <two sentence description>
"""
```

## Go deeper

Language models are fundamentally autoregressive: each generated token is appended to the prompt context, serving as input for generating the subsequent token. If the initial prompt is incomplete or contradictory, errors cascade through subsequent generated sentences. By being explicit about requirements early, you prevent runaway hallucination before generation begins.

> **Tip:** Treat prompt engineering like writing a functional specification for a junior engineer who executes instructions literally but lacks organizational background knowledge.

## Watch out

- Writing conversational greetings or filler text that consumes token capacity without adding context.
- Assuming the model remembers details from conversations outside the active context window.

## Remember

- A prompt is the full contextual payload that steers next-token probabilities.
- Models do not search static databases; they generate text conditioned on your inputs.
- Clear components—instruction, context, input data, and format—eliminate model guesswork.
