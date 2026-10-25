---
id: lesson-15
slug: prompt-chaining
title: "Prompt Chaining and Decomposition"
level: intermediate
order: 15
duration: 26
tags:
  - prompt-chaining
  - decomposition
  - least-to-most
  - pipelines
  - map-reduce
summary: "Breaking a big task into a sequence of smaller prompts: sequential chains with checks between steps, routing, parallel map-and-combine, least-to-most decomposition, when built-in reasoning makes chains unnecessary, and how to stop errors from propagating."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Break a complex task into a **chain** of focused prompts.
- Add **validation and transformation** steps between links to stop errors spreading.
- Use the main chain shapes: **sequential**, **router**, **parallel map-and-combine**, and **loop**.
- Apply **least-to-most** decomposition to problems harder than your examples.
- Decide when a single prompt (or a reasoning model) is enough and when a chain earns its cost.

# Why It Matters

A single prompt that tries to research, analyze, write, format, and check all at once usually does
each part a little worse, and when something goes wrong you can't see where. Splitting the work into
steps gives each step the model's full attention, lets you inspect and fix intermediate results, and
lets code enforce rules between steps. Chaining is also the bridge from prompts to applications:
most LLM features in real products are chains.

# Concept Explanation

### What a chain is

**Prompt chaining** means breaking a task into subtasks, prompting the model for each, and feeding
each output into the next prompt. *Prompt Engineering in Action* stresses the part people skip: you
can **transform, validate, or verify** each output before passing it on. That's where much of the
reliability comes from.

```text
Step 1  Extract   Pull the key facts from the customer's complaint      -> JSON facts
        [check]   Validate the JSON; stop if the order ID is missing
Step 2  Decide    Choose the resolution allowed by policy for these facts -> decision
        [check]   Code confirms the decision is in the allowed list
Step 3  Write     Draft a reply that explains the decision                -> email text
        [check]   Length and tone check; no promises outside policy
```

Mark Austin's book makes the same point for everyday use ("teach AI to follow breadcrumbs"):
instead of "Plan a vacation", ask for three candidate cities, then an itinerary for the one you pick,
then a packing list for that itinerary.

### Benefits

- **Focus**: each prompt does one job well.
- **Inspectability**: you can read every intermediate result and see exactly where things went
  wrong.
- **Control**: code can enforce rules between steps (validation, business logic, approvals).
- **Mix and match**: different steps can use different prompts, patterns, or even models (a cheap,
  fast model to extract; a stronger one to reason).

### Chain shapes

- **Sequential**: A → B → C, each step using the previous output.
- **Router**: a first step **classifies** the input, and code sends it to a specialized prompt
  ("billing question → billing prompt"). *Prompt Engineering in Action* describes this as a main
  agent routing to sub-agents, which avoids diluting one prompt with every possible case.
- **Parallel map-and-combine**: split a large input into parts, process each part independently
  (often in parallel), then combine the results. Google's Gemini guide calls this aggregating.
- **Loop**: repeat a step until a check passes, such as draft → critique → revise (Lesson 12),
  with a maximum number of rounds.

### Least-to-most: solve the easy parts first

Chain-of-thought struggles when a problem is harder than the examples it was shown. Denny Zhou and
colleagues (2022) proposed **least-to-most prompting**: first ask the model to **decompose** the
problem into simpler subproblems, then **solve them in order**, each answer feeding the next. On
the compositional benchmark SCAN, a model using least-to-most reached at least **99%** accuracy
with 14 exemplars, versus **16%** with chain-of-thought.

```text
Stage 1:  To answer the question below, what simpler sub-questions must be
          answered first? List them in the order they should be solved.
          Question: <problem>

Stage 2:  (for each sub-question, in order)
          Previously solved: <sub-questions and answers so far>
          Now answer: <next sub-question>
```

The idea generalizes far beyond math: "Before writing the migration plan, list the questions we must
answer about the current system, answer each, then write the plan."

### Does a reasoning model make chains unnecessary?

Partly. Anthropic's guide notes that with built-in thinking and subagent orchestration, its models
handle most multi-step reasoning internally, and explicit chaining is **still useful when you need to
inspect intermediate outputs or enforce a specific pipeline structure**. A good rule:

- **One prompt** (possibly with thinking) when the task is mainly *reasoning* and you only care about
  the final answer.
- **A chain** when you need **checkpoints**: validation between steps, human approval, different
  models per step, audit logs, or a fixed business process.

### Error propagation and other limits

The book lists the main weaknesses of chains, all worth planning for:

- **Error propagation**: a wrong output in step 1 poisons every later step. Validate early.
- **Complexity**: more steps mean more to debug and maintain.
- **Cost and latency**: every link is another call. Parallelize independent steps and **cache**
  intermediate results so reruns don't start from scratch.
- **Vague links**: a fuzzy prompt in the middle pollutes everything downstream.

### A chain in code

This runnable sketch (with `call_llm` from Lesson 1) shows a three-step chain with checks between
steps:

```python
import json

POLICY_ACTIONS = {"refund", "replacement", "store_credit", "escalate"}

def handle_complaint(email: str) -> str:
    # Step 1: extract facts as JSON
    facts_raw = call_llm(
        "Extract from the email: order_id (or null), problem (short phrase), "
        "days_since_delivery (integer or null). Reply with only JSON.\n"
        f"<email>{email}</email>"
    )
    facts = json.loads(facts_raw)
    if not facts.get("order_id"):
        return "ASK_CUSTOMER_FOR_ORDER_ID"          # gate: stop early

    # Step 2: decide, constrained to policy
    decision = call_llm(
        f"Facts: {json.dumps(facts)}\n"
        "Policy: refund if under 30 days and item defective; replacement if "
        "damaged in shipping; store_credit otherwise; escalate if unclear.\n"
        "Reply with exactly one word: refund, replacement, store_credit, or escalate."
    ).strip().lower()
    if decision not in POLICY_ACTIONS:
        decision = "escalate"                        # code enforces the allowed set

    # Step 3: write the reply
    return call_llm(
        f"Write a warm, brief reply (under 120 words) to the customer explaining "
        f"that we will proceed with: {decision}. Facts: {json.dumps(facts)}. "
        "Do not promise anything else."
    )
```

In production you'd use structured outputs for step 1 (Lesson 14), log each step, and add a retry
around the parse.

### Map-and-combine for long inputs

When a document is too long or too important to handle in one pass, summarize sections
independently and then combine:

```python
def summarize_long(sections: list[str]) -> str:
    partials = [
        call_llm(f"Summarize this section in 3 bullet points:\n<section>{s}</section>")
        for s in sections  # independent calls: easy to run in parallel
    ]
    joined = "\n\n".join(partials)
    return call_llm(
        "Combine these section summaries into one 150-word executive summary. "
        f"Remove repetition and keep the most important points.\n{joined}"
    )
```

# Key Terminology

- **Prompt chaining**: feeding the output of one prompt into the next, with checks in between.
- **Decomposition**: breaking a problem into smaller subproblems.
- **Least-to-most prompting**: decompose into simpler subproblems, then solve them in order.
- **Router**: a step that classifies input and sends it to a specialized prompt.
- **Map-and-combine (aggregate)**: process parts independently, then merge the results.
- **Gate**: a check between steps that can stop the chain or change its path.
- **Error propagation**: a mistake in an early step spreading through later steps.

# Options and Trade-offs

| Approach | Strength | Weakness | Use when |
| --- | --- | --- | --- |
| Single prompt | Simple, cheap, fast | Hard to debug; one weak part drags all | Short tasks; reasoning-only tasks |
| Single prompt with built-in thinking | Strong multi-step reasoning | No checkpoints for code or people | Hard reasoning, final answer only |
| Sequential chain with gates | Inspectable, controllable | More calls, more code | Business processes, extraction → action |
| Router | Specialized prompts per case | Misroutes if classification fails | Many distinct request types |
| Map-and-combine | Handles long inputs; parallel | Combine step may lose detail | Long documents, many items |
| Loop with critique | Meets explicit criteria | Cost; needs a round limit | Quality-sensitive writing or code |

# Worked Example

Your team wants weekly competitive briefs from a folder of news articles.

**Single prompt attempt:** paste 15 articles and ask for "a competitive brief". The result is
uneven: some competitors are missing, claims aren't attributed, and you can't tell which article a
point came from.

**Chain:**

1. **Map**: for each article, extract `{company, event, date, source_title, one_sentence_summary}` as
   JSON (validated).
2. **Code step**: group the extracted records by company, drop duplicates, sort by date.
3. **Per-company prompt**: "Using only these records, write 2-3 sentences on what this competitor did
   this week and why it might matter to us. Mention the source titles."
4. **Combine**: "Assemble these sections into a one-page brief with a three-bullet executive summary
   at the top."
5. **Check**: code verifies every company in the records appears in the brief.

Each step is small and inspectable. When a summary is wrong, you can trace it to one article's
extraction and fix just that step.

# Real World Analogy

A prompt chain is like an **assembly line with quality inspectors between stations**. One worker
trying to build an entire car alone would be slow and error-prone. On a line, each station does one
job, and an inspector between stations catches a faulty part before it's bolted into everything
downstream. Without inspectors, a line just builds defects faster, which is why the checks between
links matter as much as the links themselves.

# Examples

## Example 1 — Basic: a manual chain in chat

```text
Prompt 1:  Suggest 3 themes for a 10-minute talk to new employees about our
           company values. One line each.
Prompt 2:  Expand theme 2 into an outline with an opening story, 3 points, and
           a closing call to action.
Prompt 3:  Write the opening story from the outline in under 150 words.
```

**Why this works:** each step is easy to judge and redirect before you invest in the next.

## Example 2 — Real-world: a router

```text
Step 1 (router):  Classify this message as BILLING, TECHNICAL, SALES, or OTHER.
                  Reply with the label only.
Step 2 (code):    Send the message to the prompt written for that label, each
                  with its own policies, tone, and examples.
```

**Why this works:** each specialized prompt stays short and focused instead of one giant prompt
covering every department.

## Example 3 — Pitfall: no gate after extraction

A chain extracts a dollar amount from an invoice, then drafts a payment approval. The extraction
misreads "1,250.00" as "125000", and step 2 cheerfully drafts an approval for $125,000.

**What goes wrong:** no validation between steps, so the error propagated. **Fix:** validate the
extracted amount (type, range, cross-check with the invoice total line) before step 2, and require
human approval above a threshold.

# Common Mistakes

- **No checks between steps**, so early errors spread silently.
- **Chaining when one prompt would do**, adding cost and latency for no gain.
- **Vague intermediate formats**, which make the next step guess what it received.
- **Rerunning the whole chain** after a late failure instead of caching earlier results.
- **Loops without a round limit**.

# Best Practices

- Give each link **one job** and a **well-defined output format** (ideally structured).
- Put **gates** after any step whose errors would be costly downstream.
- Use **routers** to keep specialized prompts small, and **map-and-combine** for long inputs.
- **Log** every intermediate result and **cache** them for reruns.
- Prefer a **single reasoning prompt** when you only need the final answer and no checkpoints.

# Summary

- **Prompt chaining** splits a task into focused steps, with **transformations and checks** between
  them.
- Main shapes: **sequential, router, parallel map-and-combine, and loop**.
- **Least-to-most** decomposes a problem into simpler subproblems and solves them in order.
- Reasoning models handle much multi-step thinking internally; use chains when you need
  **checkpoints, control, or different models per step**.
- Guard against **error propagation**, cost, and complexity with gates, caching, and clear formats.

# Flash Cards

Q: What is prompt chaining?
A: Breaking a task into subtasks, prompting for each, and feeding each output into the next, with checks or transformations in between.

Q: What is a router in a chain?
A: A step that classifies the input so code can send it to a specialized prompt.

Q: How does least-to-most prompting work?
A: First decompose the problem into simpler subproblems, then solve them in order, using earlier answers for later ones.

Q: When is a chain better than one prompt with built-in thinking?
A: When you need checkpoints: validation, human approval, audit logs, different models per step, or a fixed business process.

Q: What is error propagation?
A: A mistake in an early step spreading into every later step that relies on it.

Q: How do you control cost and rerun time in a chain?
A: Run independent steps in parallel and cache intermediate results.

# Exercises

### Easy
Take a task you'd normally do in one prompt (for example, writing a blog post) and do it as a
three-prompt chain in chat: ideas, outline, draft. Compare the result with a single-prompt version.

### Medium
Design a router for five kinds of incoming messages you deal with. Write the classification prompt
and one short specialized prompt per category. Test with ten messages, including two ambiguous ones.

### Challenging
Implement a sequential chain in Python with at least one structured extraction step, one gate that
can stop the chain, and logging of every intermediate output. Introduce a deliberate error into one
input and confirm the gate catches it before the final step.

# Further Reading

- Zhou et al., *Least-to-Most Prompting Enables Complex Reasoning in Large Language Models* (2022):
  <https://arxiv.org/abs/2205.10625>
- Anthropic — *Prompting best practices* ("Chain complex prompts"):
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- Google — *Prompt design strategies* (break down prompts, chain prompts, aggregate):
  <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  sections 2.3 and 4.6 (multi-agent routing, prompt chaining).
- Mark Austin, *How to Become a Prompt God* (2025), section 3.4 (step-by-step instructions).
