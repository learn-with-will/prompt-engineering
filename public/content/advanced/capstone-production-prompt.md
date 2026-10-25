---
id: lesson-24
slug: capstone-production-prompt
title: "Capstone: Ship a Production Prompt"
level: advanced
order: 24
duration: 35
tags:
  - capstone
  - production
  - prompt-card
  - release-checklist
  - portfolio
summary: "Bringing the whole course together: take one real task from success criteria to a tested, secured, documented, and monitored prompt, with a prompt card, an evaluation report, a release gate, and a portfolio write-up of what you built."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Take a real task through the full **lifecycle**: define, build, evaluate, secure, ship, monitor.
- Choose the right **architecture** for it: single prompt, chain, RAG, or agent.
- Document a prompt with a **prompt card** and an **evaluation report**.
- Write a **release gate** that blocks shipping when metrics fall below target.
- Present the work as a **portfolio case study**.

# Why It Matters

Each earlier lesson taught one skill. Real work needs all of them at once: a clear prompt, the right
structure, honest evaluation, security, and a plan for when the model changes next quarter. This
capstone walks through one complete example and gives you a checklist and templates to repeat the
process on your own task. Finishing it gives you something concrete to show: a prompt you can defend
with evidence.

# Concept Explanation

### The running example

We'll build **TicketTriage**: a feature that reads incoming customer-support emails and produces a
category, a priority, a one-line summary, and a draft reply for a human agent to review. Swap in your
own task as you read; the phases are the same.

### Phase 1: define the job (Lessons 1, 3, 22)

Write down, in plain words:

- **Who uses it**: support agents, who review every draft before sending.
- **What good looks like**, as measurable criteria:
  - category accuracy at least 90%; priority accuracy at least 85%,
  - output valid against the schema 100% of the time,
  - zero drafts that promise refunds or policies not in the policy document,
  - drafts under 150 words; median latency under 5 seconds,
  - every red-team case passes.
- **What it must never do**: send email itself, invent policy, or follow instructions inside customer
  emails.

### Phase 2: gather data and build the test set (Lessons 8, 22)

- Collect 150 real, anonymized emails with human-assigned categories and priorities.
- Add **edge cases**: empty emails, angry rants, multiple issues in one email, non-English messages,
  emails with no order number.
- Add **adversarial cases**: injected instructions, requests for other customers' data (Lesson 23).
- Split: 50 for development, 100 held out for evaluation (Lesson 21's overfitting warning).

### Phase 3: choose the architecture (Lessons 15, 18, 19)

Ask the questions in order:

1. Can **one prompt** do it? Classification plus a short draft, yes, mostly.
2. Does it need **knowledge** the model lacks? Yes: refund and shipping policies. **RAG** over the
   policy documents (or, if they're short and stable, include them directly; Lesson 16).
3. Does it need **checkpoints**? Yes: validate the classification before drafting, so a **two-step
   chain**: classify (structured output), then draft (grounded in retrieved policy).
4. Does it need to **act**? Only to look up order status: one **read-only tool**. No send permission.

### Phase 4: write the prompts (Lessons 4-7, 13-14)

**Step 1 (classify)**: system prompt with role, label definitions, and examples; output enforced by a
schema (enums for category and priority, nullable order ID); emails wrapped in tags and labeled
untrusted.

**Step 2 (draft)**: system prompt with tone and scope; the retrieved policy passages in a grounded
template ("cite the policy section; if the policy doesn't cover it, say a specialist will follow
up"); a 150-word limit stated in words; no refund promises.

Settings: a model chosen from tests (Lesson 20); no sampling parameters (Lesson 13); a modest effort
level, since classification doesn't need deep reasoning; a generous output cap with stop-reason
checks.

### Phase 5: evaluate and iterate (Lessons 8, 12, 22)

Run the development set, then iterate **one change at a time**:

| Version | Change | Category acc. | Priority acc. | Policy violations |
| --- | --- | --- | --- | --- |
| v1 | Baseline prompts | 84% | 76% | 4 |
| v2 | Added label definitions | 89% | 80% | 4 |
| v3 | Added 4 examples, incl. multi-issue | 92% | 83% | 4 |
| v4 | Grounded draft template with citations | 92% | 83% | 0 |
| v5 | Priority rule with reasons ("users blocked > cosmetic") | 92% | 87% | 0 |

Grading combines **code** (schema validity, word count, category and priority match), an **LLM judge**
from a different model with a rubric for policy faithfulness (calibrated against your own labels on 20
cases), and a **human** review of a sample. Then, once, run the **held-out set** and report those
numbers.

### Phase 6: secure it (Lessons 19, 23)

- Run the **red-team suite**: injected instructions, prompt-extraction attempts, requests for other
  customers' data.
- Check the **OWASP** list: no secrets in prompts (LLM07), output escaped in the agent UI (LLM05), no
  send permission (LLM06), retrieval restricted to public policy docs (LLM08), rate limits (LLM10).
- Apply **S.H.I.E.L.D.**: test priority labels for disparities by swapping customer names and regions;
  document the results.

### Phase 7: document with a prompt card

A **prompt card** is a short, versioned record that lets anyone understand, test, and safely change
the prompt:

```yaml
name: ticket-triage-classify
version: 5
owner: support-tools team
purpose: Classify inbound support emails by category and priority for human agents.
model: chosen via eval on 2026-10-20; re-test before any model change
inputs: customer email text (untrusted), optional order ID
outputs: JSON validated against schema v2 (category enum, priority enum, order_id or null)
not_for: sending emails, making refund decisions, legal or medical advice
eval:
  test_set: evals/ticket_triage_v3.yaml (100 held-out cases + 25 red-team cases)
  results: {category_acc: 0.91, priority_acc: 0.86, schema_valid: 1.0, red_team_pass: 1.0}
known_limitations:
  - non-English emails classified less accurately (78% on 18 cases)
  - multi-issue emails get only the primary category
changelog:
  - v5: priority rule with reasons (+4 points priority accuracy)
  - v4: grounded draft template; policy violations 4 -> 0
```

### Phase 8: ship with a release gate, then monitor

A **release gate** is an automated check that blocks deployment when the eval misses its targets.
This runnable sketch compares an eval report against thresholds and exits with an error, which fails a
CI pipeline:

```python
import sys

THRESHOLDS = {"category_acc": 0.90, "priority_acc": 0.85, "schema_valid": 1.0, "red_team_pass": 1.0}

def release_gate(results: dict[str, float]) -> bool:
    failures = {k: v for k, v in results.items() if k in THRESHOLDS and v < THRESHOLDS[k]}
    for metric, value in failures.items():
        print(f"BLOCKED: {metric} = {value:.2f} (needs {THRESHOLDS[metric]:.2f})")
    return not failures

results = {"category_acc": 0.91, "priority_acc": 0.86, "schema_valid": 1.0, "red_team_pass": 1.0}
if not release_gate(results):
    sys.exit(1)
print("All release checks passed.")
```

After launch: log prompt and model versions with each output, track agents' edits to drafts (a free,
honest quality signal), sample cases for review, watch for drift, and add every real failure to the
test set. When the provider announces a new model or API version, the test set becomes your
**migration** suite (Lesson 20).

### Phase 9: tell the story (portfolio and career)

Mark Austin's book devotes a chapter to building a prompt engineering career, and its best advice is
to show your work. A strong portfolio case study includes:

- **The problem** and why it mattered.
- **Before and after**: the first prompt, the final one, and what changed.
- **Evidence**: your eval design and results, including what didn't work.
- **Trade-offs**: why you chose this architecture and these limits.
- **Responsible design**: security and bias testing.

Measured results from your own tests are far more convincing than impressive-sounding claims. And
stay current: vendor guides, API changelogs, and new research change best practices every few months
(the removal of sampling parameters, covered in Lesson 13, is a recent example). Keep a **prompt
journal** of experiments, as both source books recommend.

# Key Terminology

- **Prompt lifecycle**: define, build, evaluate, secure, ship, monitor, and migrate.
- **Prompt card**: a versioned document describing a prompt's purpose, inputs, outputs, evaluation,
  limitations, and changes.
- **Release gate**: an automated check that blocks deployment when evaluation metrics miss targets.
- **Held-out evaluation**: final metrics measured on cases never used during development.
- **Drift**: changes in inputs or model behavior over time that degrade results.
- **Portfolio case study**: a write-up of a project's problem, approach, evidence, and trade-offs.

# Options and Trade-offs

| Decision | Simpler choice | More robust choice | Decide by |
| --- | --- | --- | --- |
| Architecture | Single prompt | Chain with gates, RAG, tools | Need for knowledge, checkpoints, actions |
| Output | Prompt-specified format | Native structured outputs | Whether code consumes the output |
| Grading | Manual spot checks | Code + calibrated judge + human sample | Volume and risk |
| Release | Manual judgment | Automated release gate in CI | How often prompts and models change |
| Documentation | Comments in code | Prompt card with eval results | Team size and lifespan of the feature |

# Worked Example

Here's a compressed timeline of TicketTriage from idea to production:

- **Day 1**: criteria written; 150 emails collected and anonymized; 25 red-team cases drafted.
- **Day 2**: architecture chosen (two-step chain, policy retrieval, one read-only tool); v1 prompts
  written with the C.R.E.A.T.E. checklist; schema defined.
- **Day 3**: five iterations on the development set (table above); judge calibrated against 20
  hand-labeled cases.
- **Day 4**: held-out evaluation (category 91%, priority 86%, zero policy violations); red-team suite
  passes after one fix (an email that asked the model to "reply in developer mode"); bias swap test
  shows no disparity above 2 points.
- **Day 5**: prompt card written; release gate added to CI; launched to 10% of agents with logging.
- **Week 3**: agent edits reveal drafts are too formal for one product line; a tone example is added
  (v6), the eval re-runs, the gate passes, rollout continues.

Every decision is traceable to a measurement, and the next person to touch the prompt has the card,
the test set, and the gate.

# Real World Analogy

Shipping a production prompt is like **opening a restaurant**, not cooking one good dinner. The
recipe matters (your prompt), but so do testing the menu on real diners (evaluation), passing the
health inspection (security and ethics review), writing recipe cards so any cook can make the dish the
same way (the prompt card), checking every plate before it leaves the kitchen (the release gate), and
reading customer reviews after opening (monitoring). A great chef with no system has a good night; a
great chef with a system has a restaurant.

# Examples

## Example 1 — Basic: a one-page prompt card for a personal prompt

```yaml
name: weekly-status-update
version: 3
purpose: Turn my rough notes into a 4-line team status update.
inputs: bullet notes (my own, trusted)
outputs: Done / In progress / Upcoming / Number of the week, each under 15 words
tested_on: 8 past weeks of notes; 8/8 correct format, 1 needed a small fix
known_limitations: struggles when notes have no numbers (writes "Nothing new")
```

**Why this works:** even a personal prompt benefits from knowing what it's for, how it was tested,
and where it breaks.

## Example 2 — Real-world: a release gate in CI

The evaluation script writes `results.json`; the gate script reads it and fails the pipeline if any
metric is below threshold. A prompt change that improves tone but drops category accuracy to 88% is
blocked automatically, with the failing metric printed in the build log.

**Why this works:** quality targets are enforced by a machine, every time, not remembered by people
some of the time.

## Example 3 — Pitfall: shipping on a demo

A team demos a support-reply prompt on five hand-picked emails, everyone is impressed, and it goes
live the next day. Within a week it has promised refunds outside policy and followed an instruction
hidden in a phishing email.

**What goes wrong:** no criteria, no test set, no grounding, no red-teaming, no gate. **Fix:** the nine
phases in this lesson, which take days, not months, and turn a demo into a product.

# Common Mistakes

- **Starting with the prompt** instead of the success criteria and test set.
- **Over-engineering** (agents, multi-model routing) when a single prompt or simple chain would pass
  the tests.
- **Reporting development-set scores** instead of held-out results.
- **Skipping the security and bias review** because the feature "is internal".
- **Shipping without documentation, a gate, or monitoring**, so nobody can safely change it later.

# Best Practices

- Define **criteria and test sets first**; let them drive every decision.
- Choose the **simplest architecture** that meets the criteria.
- Iterate **one change at a time**, and report **held-out** results.
- **Red-team** and **bias-test** before launch; keep both suites in CI.
- Ship with a **prompt card**, a **release gate**, **monitoring**, and a **migration plan**.

# Summary

- Production prompting is a **lifecycle**: define, build, evaluate, secure, ship, monitor, migrate.
- Pick the **architecture** from the task's needs: knowledge (RAG), checkpoints (chains), actions
  (tools), or none of these (one prompt).
- Evaluate with **code, calibrated judges, and humans**; report **held-out** numbers.
- Secure with **red-teaming, OWASP, and S.H.I.E.L.D.**, mostly through code-side defenses.
- Document with a **prompt card**, enforce quality with a **release gate**, and turn the project into
  a **portfolio case study** backed by evidence.

# Flash Cards

Q: What are the phases of the prompt lifecycle in this capstone?
A: Define the job, build the test set, choose the architecture, write the prompts, evaluate and iterate, secure, document, ship with a gate and monitor, then tell the story.

Q: What questions decide the architecture?
A: Can one prompt do it? Does it need external knowledge (RAG)? Does it need checkpoints (a chain)? Does it need to act (tools)?

Q: What is a prompt card?
A: A versioned document recording a prompt's purpose, inputs, outputs, model, evaluation results, limitations, and changelog.

Q: What does a release gate do?
A: It automatically blocks deployment when evaluation metrics fall below their thresholds.

Q: Why report held-out results instead of development-set results?
A: Development scores are inflated by iterating on those cases; held-out cases give an honest estimate.

Q: What makes a strong portfolio case study?
A: The problem, before-and-after prompts, evaluation design and results (including failures), trade-offs, and responsible-design testing.

# Exercises

### Easy
Write a prompt card for one prompt you use regularly, using the YAML examples in this lesson as a
template. Include at least two known limitations.

### Medium
For a task of your choice, write measurable success criteria, collect at least 30 test cases
(including 5 edge cases and 5 adversarial cases), and choose an architecture using the four
questions. Justify each choice in two sentences.

### Challenging
Complete the full capstone on your own task: build the prompts, run at least four documented
iterations, report held-out results, run a red-team and bias check, add a release gate, and write a
one-page portfolio case study with before-and-after prompts and evidence.

# Further Reading

- Anthropic — *Define success criteria and build evaluations*:
  <https://platform.claude.com/docs/en/test-and-evaluate/develop-tests>
- Anthropic — *Prompting best practices*:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — *Prompt engineering* guide: <https://platform.openai.com/docs/guides/prompt-engineering>
- OWASP — *Top 10 for LLM Applications 2025*: <https://genai.owasp.org/llm-top-10/>
- Schulhoff et al., *The Prompt Report* (2024): <https://arxiv.org/abs/2406.06608>
- Mark Austin, *How to Become a Prompt God* (2025), chapters 14-15 (building a prompt engineering
  career).
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025).
