---
slug: the-prompt-card-specification
title: "The Prompt Card Specification"
topic: evals-security-production
kind: tool
summary: "Author standardized Prompt Cards documenting prompt intent, model versions, parameters, inputs, and failure modes."
tags: [prompt-card, documentation, governance, mlops]
related: [the-shield-ethical-framework, production-release-gates, maintaining-a-prompt-library]
---
> **In one line:** A Prompt Card is a standardized specification document recording a prompt's intent, parameters, schemas, and known limitations.

## The idea

Modeled on Margaret Mitchell et al.'s foundational *Model Cards for Model Reporting* (2019), a **Prompt Card** is a standardized documentation artifact that accompanies a prompt template into production.

When prompt engineering is undocumented, institutional knowledge evaporates:
- Why was this strange negative rule added six months ago?
- Which model version was this prompt tuned for?
- What are the known failure modes where this prompt should never be used?

A Prompt Card answers these questions definitively, serving as the bridge between engineering, product management, and compliance auditors.

| Prompt Card Section | Content Documented |
|---|---|
| **Overview** | Unique prompt ID, semantic version, author, and primary business objective |
| **Model & Parameters** | Target model family (e.g. `gpt-4o`), temperature, top-p, max tokens |
| **Interface Contract** | Required dynamic input variables and guaranteed output JSON schema |
| **Benchmark Performance**| Accuracy, P95 latency, and token cost measured on held-out test sets |
| **Known Failure Modes** | Scenarios where the prompt underperforms or must not be used |

## See it

```yaml
# Prompt Card Specification (prompts/claims_extractor_card.yaml)
prompt_id: medical-claim-extractor
version: 1.4.0
intended_use: Extract ICD-10 codes and dates from scanned medical bills.

target_model:
  provider: anthropic
  model_id: claude-3-7-sonnet-20250219
  temperature: 0.0

inputs:
  - name: scanned_bill_text
    type: string
    description: Raw OCR text of invoice

output_contract:
  type: json
  schema_file: schemas/claim_v1.json

benchmark_metrics:
  held_out_accuracy: 96.2%
  p95_latency_ms: 1850

known_limitations:
  - Fails on handwritten notes; routes to manual review.
```

## Go deeper

Store Prompt Cards directly in your code repository alongside prompt template files (e.g. `prompts/triage.yaml` paired with `prompts/triage.card.yaml`). This ensures that whenever a pull request modifies prompt logic, the engineer is held accountable for updating the documented benchmark metrics and limitations.

> **Tip:** Include Prompt Cards in internal developer portals to help other teams discover, understand, and reuse existing verified prompts.

## Watch out

- Writing a Prompt Card once and failing to update it when the prompt template or target model changes.
- Omitting the 'Known Limitations' section, which is the most critical section for risk management.

## Remember

- Prompt Cards standardize documentation for production prompts, modeled on Model Cards.
- Records business intent, model parameters, interface contracts, and benchmark metrics.
- Explicitly document known failure modes and boundary conditions to prevent misuse.
