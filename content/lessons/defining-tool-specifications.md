---
slug: defining-tool-specifications
title: "Defining Tool Specifications"
topic: rag-and-agents
kind: api
summary: "Author clear tool descriptions, JSON schemas, and parameter constraints for reliable function calling."
tags: [tool-use, function-calling, json-schema, agent-apis]
related: [the-react-pattern, agent-loops-and-stopping-rules, excessive-agency-and-guardrails]
---
> **In one line:** Tool specifications are prompts: clear names, descriptive parameter schemas, and edge-case instructions dictate calling accuracy.

## The idea

Modern frontier models support native **Function Calling / Tool Use** (OpenAI, Anthropic, Gemini). When tools are provided in an API request, the model evaluates user intent and can choose to emit a structured tool call rather than a text completion.

A common developer mistake is treating tool definitions as dry API schemas. In reality, **a tool specification is a prompt**. The model reads tool names, descriptions, and parameter descriptions to decide:
- *When* to call a tool versus answering directly.
- *Which* tool to choose when multiple tools overlap.
- *How* to format and validate parameter arguments.

A vague tool description like `"query_db(sql)"` invites the model to guess table names or emit invalid SQL syntax. A well-engineered tool specification describes the exact trigger conditions, parameter formats, and limitations.

| Specification Element | What the Model Inspects | Quality Example |
|---|---|---|
| **Name** | Semantic intent identifier | `get_weather_forecast` (good) vs `tool_3` (unclear) |
| **Description** | When to use and when NOT to use | "Fetches 5-day weather forecast. Use ONLY for future forecasts, not historical." |
| **Parameter Types** | JSON Schema validation bounds | `{"type": "string", "enum": ["celsius", "fahrenheit"]}` |
| **Parameter Descriptions**| Format hints and default values | "ISO-8601 date string, e.g. 2026-11-16. Defaults to current date." |

## See it

```python
# Production tool specification conforming to OpenAI/Anthropic schemas
calculator_tool = {
    "name": "calculate_mortgage_payment",
    "description": "Calculates monthly mortgage payments based on principal, annual interest rate, and term. Use this whenever the user asks for loan payments; never calculate compound interest mentally.",
    "parameters": {
        "type": "object",
        "properties": {
            "principal_usd": {
                "type": "number",
                "description": "The loan amount in USD, e.g. 350000. Must be positive."
            },
            "annual_interest_rate": {
                "type": "number",
                "description": "Annual interest percentage as a float, e.g. 6.5 for 6.5%."
            },
            "term_years": {
                "type": "integer",
                "enum": [15, 30],
                "description": "Loan term in years. Must be 15 or 30."
            }
        },
        "required": ["principal_usd", "annual_interest_rate", "term_years"]
    }
}
```

## Go deeper

Anthropic's documentation notes that providing explicit negative constraints within tool descriptions (*"Do not call this tool if the user only provided a zip code without a city name"*) dramatically reduces false tool invocations. Treat the `description` field as your primary behavioral guardrail for that function.

> **Tip:** Limit the number of active tools passed to an agent to 5–10; presenting 50+ tools causes parameter confusion and degrades tool selection accuracy.

## Watch out

- Using cryptic variable names like `p` or `arg1` in parameter definitions without descriptions.
- Declaring tools that duplicate identical functionality under different names, confusing the router.

## Remember

- Tool specifications are prompts: names and descriptions directly govern model invocation accuracy.
- Describe both when to call the tool and explicit conditions when the tool should be avoided.
- Use explicit parameter descriptions and enum constraints to guarantee valid arguments.
