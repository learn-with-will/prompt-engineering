---
slug: clarity-and-directness
title: "Clarity and Directness"
topic: prompt-craft
kind: technique
summary: "Eliminate conversational ambiguity and write explicit, goal-oriented instructions that guide the model."
tags: [clarity, instructions, prompt-craft, specificity]
related: [delimiters-and-structure, positive-instructions, anatomy-of-a-prompt]
---
> **In one line:** The most reliable prompt optimization is removing ambiguity by stating the exact task, context, and output criteria directly.

## The idea

Ambiguity is the single largest contributor to unsatisfactory LLM outputs. When a user provides a vague prompt such as `"Improve this code"` or `"Write a summary"`, the model must guess the user's intent. Should the summary be 50 words or 500? Is the code being optimized for execution speed, readability, or memory consumption?

The Golden Rule of prompt clarity—articulated by Anthropic's engineering guidelines—advises: *"Show your prompt to a colleague with minimal context. If they would have to ask clarifying questions before completing the task, the model will have to guess as well."*

Clear prompts replace vague adjectives with concrete specifications:
- Instead of `"make it concise"`, specify `"keep the response under 100 words"`.
- Instead of `"explain it simply"`, specify `"explain for a reader with no programming background"`.
- Instead of `"analyze this data"`, specify `"list the top 3 anomalies with percentage deviations"`.

| Vague Prompt | Ambiguity Source | Clear, Direct Alternative |
|---|---|---|
| `"Make this email better"` | Tone and goal unspecified | `"Rewrite this email to be professional and firm, declining the meeting."` |
| `"Summarize this article"` | Length and audience unknown | `"Write a 3-bullet summary focusing on financial implications for investors."` |
| `"Check my code"` | Scope of check undefined | `"Identify potential SQL injection vulnerabilities in this database query."` |

## See it

```python
# Before and after applying explicit clarity principles
# Before:
vague_prompt = "Tell me about microservices."

# After:
clear_prompt = """Compare microservices architecture to monolithic architecture.
Target Audience: Senior software engineering student.
Structure:
1. Define both approaches in 2 sentences each.
2. Provide a markdown table comparing them across 4 criteria: Deployment, Scalability, Debugging, and Operational Cost.
3. State 2 clear indicators for when a startup should choose monolith over microservices."""
```

## Go deeper

Directness does not require being terse or rude; it requires precision. Extra polite phrases like `"Please could you kindly take a look at..."` add noise tokens that dilute core instruction attention. Treat prompt writing like drafting engineering requirements or API contracts: direct, descriptive, and unambiguous.

> **Tip:** Quantify constraints whenever possible. Replace qualitative words like "short", "detailed", or "comprehensive" with word counts, bullet limits, or section headings.

## Watch out

- Using subjective adjectives like "engaging", "creative", or "smart" without defining concrete attributes.
- Combining two contradictory requests in a single sentence (e.g. "be extremely thorough yet very brief").

## Remember

- Ambiguous prompts force models to guess task intent, producing safe, generic outputs.
- Test clarity by asking whether a human colleague could fulfill the prompt without asking follow-up questions.
- Replace qualitative descriptions with quantified metrics, concrete audiences, and structural outlines.
