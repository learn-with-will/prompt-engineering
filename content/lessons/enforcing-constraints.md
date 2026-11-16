---
slug: enforcing-constraints
title: "Enforcing Hard and Soft Constraints"
topic: formats-refinement
kind: technique
summary: "Design enforceable constraints using measurable units, operational rationales, and fallback directives."
tags: [constraints, guardrails, prompt-craft, rules]
related: [specifying-output-formats, positive-instructions, the-specify-framework]
---
> **In one line:** Enforce constraints by framing them with concrete, measurable units and providing explicit fallback protocols.

## The idea

Prompt constraints prevent models from producing irrelevant, verbose, or non-compliant text. However, how you phrase constraints determines whether the model respects them or ignores them.

Constraints fall into two operational categories:
1. **Hard Constraints**: Non-negotiable boundaries that must be strictly maintained (e.g. *"Do not reveal internal employee IDs"*, *"Never exceed 3 bullet points"*, *"Use only data present in the context"*).
2. **Soft Constraints**: Stylistic or aspirational preferences (e.g. *"Prefer concise phrasing"*, *"Adopt an encouraging tone"*).

To make constraints stick:
- **Use Measurable Units**: Replace subjective bounds like `"keep it short"` with physical counts: `"between 80 and 120 words"`, `"exactly 3 bullets"`, or `"a maximum of 2 sentences"`.
- **Provide Rationales**: Research shows that explaining *why* a rule exists increases compliance. Stating *"Keep explanations under 50 words because output is displayed on an embedded smartwatch screen"* anchors the model's contextual reasoning.
- **Supply Fallback Rules**: Tell the model what to output when a constraint cannot be met (e.g. *"If the answer is unknown, output 'INSUFFICIENT_DATA'"*).

| Vague Constraint | Enforceable Replacement | Why It Works |
|---|---|---|
| `"Don't write too much"` | `"Limit summary to exactly 3 bullet points, max 20 words each"` | Countable and objective |
| `"Only use reliable facts"` | `"Rely strictly on provided text; do not extrapolate"` | Explicit source boundary |
| `"Be professional"` | `"Use standard business English; avoid slang, idioms, or exclamation marks"` | Concrete style definition |

## See it

```python
# Hard constraint enforcement pattern with fallback protocol
def prompt_with_enforced_constraints(customer_query: str, policy_text: str) -> str:
    return f"""You are a customer policy verification assistant.

Policy Context:
{policy_text}

Rules:
1. Answer the query using ONLY facts explicitly mentioned in Policy Context.
2. If the policy does not explicitly cover the situation, output:
   'POLICY_UNSPECIFIED: Requires human supervisor escalation.'
3. Length: Exactly one paragraph of 30 to 60 words.

Query: {customer_query}
Verified Answer:"""
```

## Go deeper

When models struggle with multiple complex constraints, they often suffer from constraint decay as generation proceeds. If a prompt includes 10 separate negative rules, the model may follow eight and violate two. For mission-critical constraints, decouple generation and verification: let the first prompt draft the content, and use a secondary critic prompt to validate compliance.

> **Tip:** Position the most critical constraints at the bottom of the prompt, immediately adjacent to the query input.

## Watch out

- Imposing impossible or contradictory constraints (e.g. "Explain quantum mechanics thoroughly in 10 words").
- Setting token limits in API parameters as a substitute for prompt length constraints.

## Remember

- Translate vague guidelines into countable units: word ranges, sentence caps, or bullet counts.
- Explain the operational reason behind a constraint to reinforce compliance attention.
- Provide explicit fallback protocols for scenarios where constraints cannot be satisfied.
