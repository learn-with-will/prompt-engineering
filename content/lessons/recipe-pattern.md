---
slug: recipe-pattern
title: "The Recipe Pattern"
topic: prompt-patterns
kind: pattern
summary: "Guide step-by-step generative workflows using the Recipe pattern to produce complete, reproducible deliverables."
tags: [recipe-pattern, prompt-patterns, workflows, procedures]
related: [prompt-patterns-overview, outline-expansion-pattern, sequential-prompt-chaining]
---
> **In one line:** The Recipe pattern provides an ordered sequence of ingredient inputs and step-by-step instructions to produce a complete deliverable.

## The idea

When tasked with creating a complex deliverable—such as an end-to-end API specification, a migration plan, or an employee handbook section—models frequently skip intermediate steps or produce high-level summaries rather than exhaustive specifications.

The **Recipe Pattern** (White et al., 2023) frames the prompt as a structured recipe:
1. **Ingredients (Prerequisites)**: Explicitly enumerates the inputs, variables, resources, and dependencies required before beginning.
2. **Steps (Ordered Execution)**: Defines a numbered, sequential procedure where each phase builds deterministically on the preceding phase.
3. **Serving Suggestion (Final Deliverable)**: Outlines the exact criteria for what a completed, successful output looks like.

This pattern transforms an open-ended request like `"Deploy a microservice"` into an actionable, reproducible procedural plan where every dependency is validated before execution steps begin.

| Recipe Component | Architectural Purpose | Example Application |
|---|---|---|
| **Ingredients** | Define inputs and prerequisite state | Cloud provider, VPC CIDR, Docker image, DB credentials |
| **Phase Steps** | Sequential execution order | Step 1: Provision VPC; Step 2: Configure Subnets; Step 3: Deploy |
| **Verification Gate** | Validation criteria for completion | "Run curl against /healthz and verify 200 OK response" |

## See it

```text
I want to establish a database migration plan from PostgreSQL to ClickHouse.
Act as a Database Migration Specialist.

Provide a complete Recipe to accomplish this:
1. List all required Ingredients: required tools, access credentials, schema snapshots, and disk capacity.
2. Provide Step-by-Step Instructions grouped into:
   - Phase 1: Pre-migration schema mapping
   - Phase 2: Historical data backfill
   - Phase 3: Change Data Capture (CDC) replication
   - Phase 4: Cutover and verification
3. For each step, include the exact command or SQL snippet required.
4. Conclude with a Rollback Procedure if cutover validation fails.
```

## Go deeper

The Recipe pattern is particularly potent when combined with tool execution. By forcing the model to articulate prerequisites (ingredients) before action steps, the system can automatically verify that environment variables and required database connections exist before issuing write operations.

> **Tip:** Instruct the model: "If any required ingredient is missing from the prompt, stop and request it before generating the recipe steps."


In enterprise production environments, continuously benchmark and measure the operational trade-offs between response latency and formatting strictness. Complex nested structures require additional attention tokens, whereas concise, clearly bounded schemas minimize token overhead, reduce API billing expenses, and prevent downstream parsing exceptions across distributed microservices. Always document expected types and nullability rules explicitly.

## Watch out

- Omitting rollback or failure recovery steps from procedural technical recipes.
- Allowing the model to write placeholder steps like "Step 3: Migrate data as usual".

## Remember

- The Recipe pattern organizes generation into prerequisites (ingredients), steps, and deliverables.
- It prevents models from skipping critical preparatory steps in complex engineering workflows.
- Require concrete commands, verification checks, and rollback procedures in every technical recipe.
