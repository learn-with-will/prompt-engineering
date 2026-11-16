---
slug: the-specify-framework
title: "The S.P.E.C.IFY Framework"
topic: formats-refinement
kind: technique
summary: "Apply the S.P.E.C.IFY framework (Style, Purpose, Examples, Constraints) to lock down rigorous prompt deliverables."
tags: [frameworks, specify-framework, methodology, constraints]
related: [the-create-framework, enforcing-constraints, specifying-output-formats]
---
> **In one line:** The S.P.E.C.IFY framework structures rigorous prompts across Style, Purpose, Examples, and Constraints.

## The idea

Introduced in advanced prompt design literature, **S.P.E.C.IFY** is a task-oriented framework designed for scenarios requiring strict conformity to corporate guidelines or programmatic requirements. While C.R.E.A.T.E. is oriented toward broad creative and communication tasks, S.P.E.C.IFY focuses on rigorous technical execution.

The four pillars of S.P.E.C.IFY are:
- **S - Style**: The voice, tone, vocabulary register, and formatting medium (e.g. academic journal, markdown table, executive memo).
- **P - Purpose**: The exact business objective, core deliverable, and intended recipient action.
- **E - Examples**: Input/output exemplar pairs establishing expected structural and stylistic boundaries.
- **C - Constraints**: Negative boundaries, word/length caps, forbidden terms, and strict factual boundaries.

| Pillar | Operational Definition | Practical Example |
|---|---|---|
| **Style** | Visual layout, tone, and register | "Formal legal memo; numbered paragraphs; citation footnotes" |
| **Purpose** | Underlying goal of the generation | "Brief corporate counsel on regulatory exposure from GDPR Article 17" |
| **Examples** | In-context demonstration | "Sample paragraph: 'Paragraph 1: Background and statutory scope...'" |
| **Constraints** | Non-negotiable boundaries | "Do not exceed 300 words; do not cite US state law; no conversational fluff" |

## See it

```python
# Implementing the S.P.E.C.IFY framework for technical documentation
def generate_specify_prompt(function_code: str) -> str:
    return f"""### Style: Sphinx-style docstring; plain technical English.
### Purpose: Document this Python utility for junior developers.
### Examples:
Input: def add(a: int, b: int) -> int: return a + b
Output:
"""Sum two integers.
:param a: First addend.
:param b: Second addend.
:return: Integer sum.
"""
### Constraints:
- Document every parameter with type and description.
- Maximum 80 characters per line.

Function to document:
{function_code}"""
```

## Go deeper

The strength of S.P.E.C.IFY lies in pairing **Purpose** directly with **Constraints**. When an LLM understands *why* a deliverable exists (Purpose), it applies constraints much more intelligently. If the purpose is an executive elevator pitch, the model naturally interprets a 50-word constraint as a mandate for high-level value propositions rather than compressed technical acronyms.

> **Tip:** Use S.P.E.C.IFY when authoring prompts for internal automation scripts, documentation linters, and code-generation pipelines.

## Watch out

- Omitting the Purpose section, forcing the model to infer context from Style and Constraints alone.
- Including conflicting constraints that prevent the Purpose from being achieved.

## Remember

- S.P.E.C.IFY provides a 4-part structure: Style, Purpose, Examples, and Constraints.
- It is especially suited for rigorous technical deliverables and formal business artifacts.
- Explicit purpose statements help the model navigate and balance competing constraints.
