---
slug: prompt-ordering-strategy
title: "Prompt Ordering Strategy"
topic: prompt-craft
kind: pattern
summary: "Optimize the layout of prompt components to exploit attention mechanisms and prevent instruction drift."
tags: [ordering, attention, layout, prompt-craft]
related: [context-window-mechanics, anatomy-of-a-prompt, delimiters-and-structure]
---
> **In one line:** Position background documents first and place primary instructions, queries, and format triggers at the very end of the prompt.

## The idea

The physical order in which you arrange components inside a prompt significantly impacts generation quality. In naive prompt designs, authors frequently place their instructions at the very beginning, followed by pages of reference documents or customer transcripts, ending with no trailing direction.

Because autoregressive models generate the next token immediately following the end of your prompt, the tokens closest to that generation point exert the strongest immediate attention influence. Placing 5,000 words of background text after your instructions allows the model's attention to drift away from the core rules.

Anthropic and OpenAI documentation both emphasize the **Document-First, Query-Last** pattern:
1. **System Persona & Standing Rules**: Top of the context (established first).
2. **Reference Documents & Long Text**: Middle of the context (read as input payload).
3. **Specific Instruction & Query**: Near the bottom (focused immediately before output).
4. **Output Format & Prefix Primer**: Final line (triggers the immediate response format).

| Section Position | Content Type | Attention Priority |
|---|---|---|
| **Top** (Header) | Role, high-level task framing, rules | Sets overarching behavioral bounds |
| **Middle** (Payload) | Context documents, transcripts, data tables | Absorbed into memory as dynamic data |
| **Bottom** (Footer) | Specific question, active instructions | Prime focus immediately preceding generation |
| **Tail** (Trigger) | Output delimiter (e.g. ```` ```json
{ ````) | Directs the model straight into desired syntax |

## See it

```python
# Implementing the Document-First, Query-Last ordering strategy
def build_ordered_prompt(user_query: str, reference_docs: str) -> str:
    # Notice: documents are placed BEFORE the query and final instructions
    return f"""You are a technical support analyst.
Refer strictly to the reference materials provided in <docs>.

<docs>
{reference_docs}
</docs>

Task:
Answer the customer's question below. Quote relevant line numbers from <docs>.
If the answer cannot be determined from the text, state 'Not covered in docs'.

Customer Question: {user_query}
Helpful Answer:"""
```

## Go deeper

Tests conducted by Anthropic revealed that shifting the user query from the top of the prompt to the bottom—after reference documents—improved response quality and factual recall by up to **30 percent**. This single structural change eliminates the need for redundant warnings like *"remember the instructions above"*.

> **Tip:** End your prompt with a trailing prompt primer, such as `"Answer:"` or ```` ```json ````, to guide the model directly into emitting the expected output shape.

## Watch out

- Dumping a massive document at the bottom of the prompt with no follow-up instruction.
- Scattering instructions above and below reference text randomly without deliberate hierarchy.

## Remember

- Component placement directly influences token attention and response fidelity.
- Place long reference documents in the middle, and position the active query and instructions at the end.
- Conclude prompts with an output primer to lead the model directly into the required format.
