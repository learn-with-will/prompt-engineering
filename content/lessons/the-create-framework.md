---
slug: the-create-framework
title: "The C.R.E.A.T.E. Framework"
topic: prompt-craft
kind: technique
summary: "Apply the C.R.E.A.T.E. mnemonic (Context, Role, Examples, Action, Tone, Experiment) to draft comprehensive prompts."
tags: [frameworks, create-framework, prompt-craft, methodology]
related: [anatomy-of-a-prompt, prompt-ordering-strategy, the-specify-framework]
---
> **In one line:** The C.R.E.A.T.E. framework provides a reliable 6-part checklist to ensure no critical prompt element is overlooked during drafting.

## The idea

Introduced in practical prompt engineering literature, the **C.R.E.A.T.E.** framework provides a memorable mental checklist for authors drafting prompts for complex business or technical tasks. It guarantees that the author supplies both strategic orientation (role and context) and tactical execution constraints (action, examples, and tone).

The six pillars of C.R.E.A.T.E. are:
- **C - Context**: What is the situation, domain, target audience, or background circumstance?
- **R - Role**: Who is the model acting as (e.g. mentor, security auditor, copywriter)?
- **E - Examples**: Can you provide 1–2 concrete input/output demonstrations?
- **A - Action**: What specific, unambiguous verb defines the core task (summarize, classify, extract)?
- **T - Tone**: What emotional or stylistic register should the response adopt (formal, concise, empathetic)?
- **E - Experiment**: Test the draft on multiple inputs and iterate based on observed outputs.

| Pillar | Focus Question | Drafting Example |
|---|---|---|
| **Context** | What scenario surrounds this request? | "Our SaaS billing service had a 30-minute outage." |
| **Role** | What domain lens should the model apply? | "Act as a Customer Success Director." |
| **Examples** | What does a great answer look like? | "Example: 'Incident: Payment gateway timeout...'" |
| **Action** | What exact task must be performed? | "Draft an incident email notification to affected users." |
| **Tone** | What voice and attitude are required? | "Transparent, accountable, calm, and reassuring." |
| **Experiment** | How do we validate and refine? | "Test across standard accounts and enterprise tiers." |

## See it

```python
# Assembling a prompt systematically using the C.R.E.A.T.E. elements
def generate_create_prompt(incident_details: str) -> str:
    return f"""# Context
Our fintech payment processing service suffered a 20-minute latency spike affecting checkout flows.

# Role
You are the Head of Customer Communication at a tier-1 fintech firm.

# Action
Draft a post-incident update email to merchant store owners explaining the root cause and resolution.

# Tone
Professional, accountable, concise, and reassuring. Avoid technical excuses.

# Examples
Good update:
"Subject: Resolved: Checkout latency update for Nov 14. We identified an upstream provider delay and stabilized connections at 14:20 UTC."

# Incident Details
{incident_details}
"""
```

## Go deeper

Frameworks like C.R.E.A.T.E. are valuable scaffolding during initial prompt creation, preventing common omissions like forgetting to define the audience or tone. Once you establish a working prompt, you can prune any redundant narrative elements to optimize context window space.

> **Tip:** Use C.R.E.A.T.E. when writing multi-paragraph prompts or onboarding team members to standard prompt design conventions.

## Watch out

- Treating the framework as rigid dogma; simple one-line transformations do not require all six parts.
- Neglecting the final 'E' (Experiment) by shipping prompts without empirical verification across test cases.

## Remember

- C.R.E.A.T.E. covers Context, Role, Examples, Action, Tone, and Experimentation.
- The framework prevents missing critical guidance such as tone calibration or audience context.
- Always run empirical experiments across diverse test inputs before finalizing prompt wording.
