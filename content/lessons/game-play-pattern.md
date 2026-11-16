---
slug: game-play-pattern
title: "The Game Play Pattern"
topic: prompt-patterns
kind: pattern
summary: "Create interactive simulations, training sandboxes, and rule-bounded role-playing environments."
tags: [game-play, prompt-patterns, simulation, training]
related: [flipped-interaction-pattern, prompt-patterns-overview, persona-pattern]
---
> **In one line:** The Game Play pattern configures the model to act as a simulation engine with explicit rules, state tracking, and win/loss conditions.

## The idea

Beyond standard chat assistance, language models can execute rich interactive simulations. The **Game Play Pattern** (White et al., 2023) establishes a rule-governed sandbox where the model acts as the game master, simulator, or roleplay counterpart.

This pattern is widely utilized in professional training environments:
- **Security Incident Drills**: Simulating an active ransomware attack or DDoS incident for DevOps teams.
- **Negotiation Training**: Roleplaying an enterprise contract renewal against a skeptical client.
- **Medical Triage Training**: Presenting realistic patient symptoms that evolve based on medical student interventions.

A successful Game Play prompt must define five structural elements:
1. **Game World / Scenario**: The realistic scenario, baseline context, and starting state.
2. **Player Role & Model Role**: Who the user is and who the model plays (e.g. system hacker vs defense analyst).
3. **Turn Rules**: The actions the player is permitted to take each round.
4. **State Tracking**: Variables that update each turn (e.g. system uptime, budget, trust score).
5. **Termination Conditions**: Explicit conditions determining victory, defeat, or exercise completion.

| Simulation Element | Definition | Incident Simulation Example |
|---|---|---|
| **Scenario** | Starting domain state | "Production API latency spikes to 12,000ms at 2 AM" |
| **Model Role** | The environment simulator | Infrastructure monitoring console and simulated systems |
| **State Metrics** | Quantitative tracking variables | Health: 40%, Data Loss: 0GB, Time Elapsed: 15 mins |
| **Win Condition** | Victory criteria | Service restored under 30 minutes with 0 data corruption |

## See it

```text
Let's play an interactive Incident Commander simulation game.
Rules:
1. You act as the Infrastructure Simulation Engine.
2. I act as the on-call Site Reliability Engineer.
3. Scenario: It is 3:00 AM on Black Friday. Our primary payment processing database is locking up.
4. Each turn:
   - Report the current system metrics: [CPU: %, Active Connections: N, Error Rate: %].
   - Describe what the system logs show.
   - Wait for my command (I can run diagnosis commands, restart pods, or failover).
5. Calculate the consequences of my command realistically based on PostgreSQL internals.
6. The simulation ends when Error Rate drops to 0% (Victory) or exceeds 15 minutes of downtime (Defeat).

Initialize the game and present turn 1.
```

## Go deeper

Because chat models are stateless between API calls, maintaining complex game state requires embedding a state block at the conclusion of each turn. Instruct the model: *"At the end of every turn, output a markdown table titled `Current State` tracking all simulation variables."* This forces the model to attend to its own state history when calculating the next turn's consequences.

> **Tip:** Define clear bounds on user powers to prevent the player from typing "I wave a magic wand and fix everything."

## Watch out

- Allowing the model to solve the problem for the player instead of waiting for player commands.
- Forgetting to bound the number of turns or time limits, leading to aimless meandering simulations.

## Remember

- The Game Play pattern establishes rule-governed simulations for training and incident response.
- Explicitly define scenario state, player actions, turn rules, and victory conditions.
- Output a structured state tracking block each round to maintain simulation continuity.
