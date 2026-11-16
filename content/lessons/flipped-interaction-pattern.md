---
slug: flipped-interaction-pattern
title: "The Flipped Interaction Pattern"
topic: prompt-patterns
kind: pattern
summary: "Invert conversational control by having the model interview the user one question at a time to gather requirements."
tags: [flipped-interaction, prompt-patterns, interview, discovery]
related: [prompt-patterns-overview, cognitive-verifier-pattern, game-play-pattern]
---
> **In one line:** The Flipped Interaction pattern directs the model to ask the user questions sequentially until it gathers sufficient context to act.

## The idea

In standard human-AI interaction, the human asks questions and the model provides answers. However, on complex diagnostic or generative tasks (such as scoping a bespoke software architecture, drafting a legal contract, or troubleshooting a network failure), the human rarely knows all the parameters the model needs to produce an optimal answer.

The **Flipped Interaction Pattern** (White et al., 2023) completely inverts this dynamic. The human specifies the ultimate goal and instructs the model:
1. Do not generate the solution yet.
2. Ask me questions one at a time to gather all necessary requirements and constraints.
3. Once you have collected sufficient information, state that you are ready and present the complete solution.

This pattern transforms the LLM into an expert interviewer, guiding the user systematically through domain requirements they might otherwise have overlooked.

| Standard Interaction | Flipped Interaction |
|---|---|
| User guesses what details the model needs | Model systematically queries user for exact parameters |
| User writes a massive, potentially incomplete prompt | User answers short, focused questions turn-by-turn |
| Model delivers generic, ungrounded solution | Model delivers tailored solution grounded in verified user facts |

## See it

```text
I want to design a microservices disaster recovery strategy for our fintech platform.
Act as an Enterprise Reliability Architect.

From now on, I want you to interview me to gather the necessary specifications.
Follow these rules strictly:
1. Ask me exactly ONE question at a time.
2. Wait for my answer before asking the next question.
3. Continue asking questions until you have determined our Recovery Time Objective (RTO),
   Recovery Point Objective (RPO), regulatory jurisdiction, cloud provider, and budget constraints.
4. When you have all necessary details, tell me you are ready and output the complete Disaster Recovery Plan.

Ask your first question.
```

## Go deeper

A critical instruction in the Flipped Interaction pattern is: *"Ask me exactly ONE question at a time."* Without this constraint, models have a strong tendency to emit an overwhelming list of 10 complex questions in the first turn, causing user fatigue and incomplete responses. Enforcing turn-by-turn pacing produces a natural, engaging consultation flow.

> **Tip:** Include a rule allowing the user to say "Skip" or "Proceed with standard defaults" if they do not know the answer to a specific question.

To prevent open-ended questioning loops that exhaust user patience, provide the model with a bounded inquiry budget (for example, *'Ask at most 3 targeted questions before proposing your initial architectural draft'*). Alternatively, require the model to supply sensible default answers that the user can accept with a single confirmation.

## Watch out

- Forgetting to provide a stopping rule, causing the model to ask endless questions without ever generating the plan.
- Allowing the model to ask multi-part compound questions that confuse the user.

## Remember

- Flipped Interaction inverts conversational control so the model interviews the user.
- Enforce asking exactly one question at a time to prevent cognitive overload.
- Always declare an explicit stopping condition for when the model should switch to solution mode.
