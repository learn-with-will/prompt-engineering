---
slug: schema-valid-vs-factually-true
title: "Schema-Valid vs Factually True"
topic: apis-structured-outputs
kind: pitfall
summary: "Never mistake syntactic schema conformity for semantic truthfulness or factual grounding."
tags: [validation, hallucination, truthfulness, pitfalls]
related: [native-structured-outputs, validating-with-pydantic, reflection-and-fact-checking]
---
> **In one line:** A response that perfectly satisfies a rigid JSON schema can still contain completely fabricated, hallucinated factual data.

## The idea

The introduction of Native Structured Outputs led many developers to believe that hallucination in extraction pipelines was solved. If an API call returns a 100% schema-valid JSON object with every required field populated, it is easy to assume the data must be trustworthy.

This conflates two completely separate dimensions of model evaluation:
1. **Syntactic Validity**: The output conforms to grammar rules, data types, key names, and schema constraints.
2. **Semantic Truthfulness**: The data reflects accurate, uncorrupted facts grounded in source reality.

Constrained decoding forces the model to emit tokens matching the schema grammar, but it exerts **zero influence on factual accuracy**. If you ask a model to extract `"CEO_name"` from an article that never mentions a CEO, a schema requiring a non-empty string forces the model to invent a plausible name to satisfy the schema grammar constraint.

| Output Dimension | What Governs It | Can Still Fail If... |
|---|---|---|
| **Syntactic Validity** | JSON parser, constrained decoding engine | Grammar breaks (eliminated by Structured Outputs) |
| **Semantic Truthfulness** | Context grounding, prompt instructions, facts | Source data is absent, ambiguous, or misread |

## See it

```python
# Demonstrating the dangerous illusion of schema-valid hallucinations
from pydantic import BaseModel

class CompanyProfile(BaseModel):
    company_name: str
    annual_revenue_usd: float
    ceo_name: str

# Source text does NOT mention revenue or CEO!
source_text = "Acme Widgets was founded in 2012 and manufactures brass fittings in Ohio."

# The model is forced to return CompanyProfile. It returns:
# {"company_name": "Acme Widgets", "annual_revenue_usd": 15000000.0, "ceo_name": "John Miller"}
# Syntactic Validity: 100% PASSED (valid float and strings)
# Semantic Truthfulness: 0% FAILED (revenue and CEO are 100% fabricated!)
```

## Go deeper

To prevent schemas from compelling models to hallucinate, design **nullable schemas with fallback options**:
- Allow fields to be `Optional[str] = None`.
- Include a boolean flag like `"is_mentioned_in_text": bool`.
- Add an explicit `"confidence_quote": Optional[str]` field requiring the model to extract verbatim source text supporting the value.

> **Watch out:** If a required schema field is not present in the input text, a strict schema *forces* the model to hallucinate to avoid breaking grammar.

## Watch out

- Declaring fields as strictly required without providing a `null` option for cases where source data is missing.
- Disabling downstream business logic verification simply because an output parsed cleanly in Pydantic.

## Remember

- Syntactic validity (valid JSON) is completely distinct from semantic truthfulness (accurate facts).
- Constrained decoding forces schema compliance but cannot prevent factual hallucinations.
- Make schema fields optional or nullable so models can indicate when data is absent from source text.
