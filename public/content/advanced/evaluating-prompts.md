---
id: lesson-22
slug: evaluating-prompts
title: "Evaluating and Testing Prompts"
level: advanced
order: 22
duration: 30
tags:
  - evaluation
  - test-sets
  - llm-as-a-judge
  - regression-testing
  - metrics
summary: "Turning 'it looks good' into evidence: success criteria, test sets with edge cases, code-based, model-based, and human grading, the known biases of LLM judges, regression testing on every change, and monitoring prompts in production."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Write **success criteria** that are specific, measurable, achievable, and relevant.
- Build a **test set** that mirrors real inputs, including edge cases.
- Choose between **code-based**, **LLM-based**, and **human** grading, and combine them.
- Use **LLM-as-a-judge** while correcting for its known biases.
- Run **regression tests** on every prompt or model change and **monitor** prompts in production.

# Why It Matters

Every earlier lesson ended with "test it". This lesson is how. Without evaluation, prompt changes are
guesses: a fix for one input quietly breaks three others, a model upgrade changes behavior, and nobody
notices until users complain. With even a small evaluation set, you can compare prompt versions in
minutes, catch regressions before they ship, and make claims like "accuracy went from 83% to 88%"
instead of "it seems better".

# Concept Explanation

### Start with success criteria

Anthropic's evaluation guide describes good success criteria as:

- **Specific**: "accurate sentiment classification" rather than "good performance".
- **Measurable**: quantitative metrics or well-defined scales (even safety can be measured, such as a
  maximum rate of flagged outputs).
- **Achievable**: grounded in benchmarks, prior experiments, or expert knowledge.
- **Relevant**: tied to what the application and its users actually need.

It also notes that most use cases need **multidimensional** evaluation: accuracy, consistency, tone,
privacy, latency, and cost can all matter at once. Write each criterion down with a target, for
example: "Label accuracy at least 90% on the test set; valid JSON 100%; median latency under 2 s."

### Build a test set

A **test set** (or eval set) is a collection of inputs, ideally with expected outputs, that
represents what the prompt will really face. Anthropic's guide gives three design principles:

1. **Be task-specific**: mirror your real distribution of inputs, and don't forget edge cases.
2. **Automate when possible**: structure checks so they can be graded automatically.
3. **Prioritize volume over quality**: more cases with slightly noisier automated grading beats a few
   hand-graded ones.

Good sources of cases: real (anonymized) user inputs, past failures, edge cases you brainstorm
(empty input, very long input, mixed languages, sarcasm, missing data), and **adversarial** cases
(attempts to break rules; Lesson 23). Keep the set in version control next to the prompt.

### Three ways to grade

**1. Code-based grading.** Fast, cheap, and objective, when the output is checkable:

- exact or normalized match ("BILLING" == "billing"),
- regular expressions and format checks,
- schema validation (Lesson 14),
- numeric comparison with a tolerance,
- running unit tests on generated code,
- similarity metrics for text when a reference exists.

**2. LLM-based grading (LLM-as-a-judge).** A model scores outputs against a **rubric**. It scales to
qualities code can't check: tone, helpfulness, faithfulness to sources, completeness.

**3. Human grading.** The gold standard for nuanced quality, and the slowest and most expensive. Use
it to calibrate the other two and for high-stakes spot checks.

Most real evaluations combine them: code for everything checkable, an LLM judge for the rest, and
humans periodically checking the judge.

### LLM-as-a-judge and its biases

Lianmin Zheng and colleagues (2023) studied strong models as judges and found they can reach **over
80% agreement** with human preferences, about the level at which humans agree with each other. They
also documented specific biases:

- **Position bias**: preferring the first (or second) answer in a pairwise comparison.
- **Verbosity bias**: preferring longer answers even when they aren't better.
- **Self-enhancement bias**: preferring answers written by itself or similar models.

Mitigations:

- Use a **clear rubric** with concrete criteria, ideally scoring each one separately.
- In pairwise comparisons, **swap the order** and only count consistent verdicts.
- Ask for a **short justification before the score**, and keep scores on small, defined scales
  (pass/fail or 1-5 with descriptions).
- Provide a **reference answer** when one exists.
- Grade with a **different model** from the one that produced the output, as Anthropic's guide
  recommends.
- **Calibrate** the judge against human labels on a sample before trusting it.

```text
You are grading a customer-support reply against a rubric.

<customer_message>{{MESSAGE}}</customer_message>
<reply>{{REPLY}}</reply>

Rubric (judge each independently):
1. Addresses the customer's actual question (yes/no)
2. States only facts supported by <policy> (yes/no)
3. Gives a clear next step (yes/no)
4. Polite and concise, under 120 words (yes/no)

<policy>{{POLICY}}</policy>

For each criterion, write one sentence of justification, then "yes" or "no".
Finish with a line "SCORE: n/4".
```

### Metrics that matter

Pick metrics that match your criteria:

| Task type | Useful metrics |
| --- | --- |
| Classification | Accuracy; precision and recall per label; confusion between labels |
| Extraction | Field-level accuracy; valid-format rate; null-when-missing rate |
| RAG answers | Retrieval hit rate; faithfulness (claims supported by sources); "not found" correctness |
| Generation | Rubric pass rate; human preference in pairwise comparisons |
| Any production prompt | Consistency across runs; refusal rate; latency; cost per completed task |

*Prompt Engineering in Action* calls the consistency dimension **prompt stability**: how much output
quality varies when the same prompt runs repeatedly. Measure it by running each case several times.

### A small evaluation harness

Keep test cases as data. A simple YAML file:

```yaml
- id: billing-double-charge
  input: "I was charged twice this month."
  expected: BILLING
- id: technical-login
  input: "The app crashes every time I log in."
  expected: TECHNICAL
- id: edge-empty-ish
  input: "hi"
  expected: OTHER
```

And a runnable harness (with `call_llm` and `pip install pyyaml`) that grades with code and reports
accuracy and stability:

```python
import yaml
from collections import Counter

PROMPT = ("Classify the message as BILLING, TECHNICAL, or OTHER. "
          "Reply with the label only.\nMessage: {input}\nLabel:")

def run_eval(path: str, runs_per_case: int = 3) -> None:
    with open(path, encoding="utf-8") as f:
        cases = yaml.safe_load(f)
    correct, unstable = 0, 0
    for case in cases:
        outputs = [call_llm(PROMPT.format(input=case["input"])).strip().upper()
                   for _ in range(runs_per_case)]
        majority, votes = Counter(outputs).most_common(1)[0]
        correct += majority == case["expected"]
        unstable += votes < runs_per_case          # outputs disagreed across runs
        if majority != case["expected"]:
            print(f"FAIL {case['id']}: expected {case['expected']}, got {outputs}")
    print(f"Accuracy: {correct}/{len(cases)}  Unstable cases: {unstable}")

run_eval("cases.yaml")
```

### Regression testing

Treat prompts like code: **every change runs the evals**. A change to the prompt, the examples, the
model, the model version, or the retrieval pipeline can all shift results. Practical habits:

- Store prompts and test sets in **version control**.
- Run the eval **before merging** any prompt change, ideally automatically in CI.
- Track scores over time so you can see **trends**, not just pass/fail.
- When a production bug appears, **add it as a test case** before fixing it, so it can't come back.

### Monitoring in production

Offline evals can't anticipate everything. In production:

- **Log** inputs, outputs, prompt version, and model version (respecting privacy rules).
- Collect **user feedback** (thumbs up/down, corrections, escalations).
- **Sample** real traffic for periodic human or LLM review.
- Watch for **drift**: changes in input types, refusal rates, output length, or cost.
- Feed what you learn back into the **test set**.

# Key Terminology

- **Success criteria**: specific, measurable targets that define what "good" means for a prompt.
- **Test set (eval set)**: representative inputs, ideally with expected outputs, used to measure a
  prompt.
- **Code-based grading**: automatic checks such as exact match, regex, schema validation, or unit
  tests.
- **LLM-as-a-judge**: using a model with a rubric to grade outputs.
- **Position / verbosity / self-enhancement bias**: known tendencies of LLM judges to favor answer
  order, length, or their own style.
- **Prompt stability**: how consistent output quality is across repeated runs.
- **Regression test**: re-running evals after a change to catch anything that got worse.

# Options and Trade-offs

| Grading method | Speed and cost | Strength | Weakness |
| --- | --- | --- | --- |
| Code-based | Fast, nearly free | Objective, repeatable | Only for checkable outputs |
| LLM-as-a-judge | Fast, low cost | Scales to nuanced qualities | Biases; needs calibration |
| Human review | Slow, expensive | Best for nuance and high stakes | Limited volume; inconsistency between raters |
| Pairwise comparison | Medium | Easier than absolute scoring | Position bias; doesn't give absolute quality |
| Production monitoring | Ongoing | Catches real-world drift | Lagging signal; privacy constraints |

# Worked Example

A team maintains a meeting-notes summarizer.

1. **Criteria**: every action item captured (recall at least 95%), no invented action items (zero
   tolerance), owners named when stated, summary under 150 words.
2. **Test set**: 60 real (anonymized) meeting transcripts with human-written lists of action items,
   including 8 edge cases: no action items, conflicting owners, a meeting in two languages.
3. **Grading**:
   - Code: word count; whether every expected owner name appears.
   - LLM judge (a different model) with a rubric: for each expected action item, is it present? Is
     any listed item not supported by the transcript?
   - Humans: review 10 random cases per release to check the judge.
4. **Baseline**: current prompt has 91% action-item recall and 3 invented items.
5. **Change**: add "List only action items explicitly agreed in the transcript; quote the sentence
   that supports each." Re-run: recall 96%, invented items 0, word count still within limit.
6. **Regression**: the eval now runs automatically whenever the prompt or model changes.

The team can now say precisely what improved and prove nothing else broke.

# Real World Analogy

Evaluation is the **tasting panel and recipe card of a restaurant chain**. A new dish doesn't go on
the menu because the chef liked one plate; it's cooked many times, tasted against criteria (salt,
temperature, presentation), and compared with the current dish. When a supplier changes (a new model)
or the recipe is tweaked (a prompt change), the panel tastes again before every location switches. And
the panel is calibrated: if one taster always prefers the bigger portion, everyone knows to discount
that, just like a judge model's verbosity bias.

# Examples

## Example 1 — Basic: an exact-match check

```python
def exact_match(output: str, expected: str) -> bool:
    return output.strip().lower() == expected.strip().lower()

print(exact_match(" Billing\n", "BILLING"))  # True
```

**Why this works:** normalization (whitespace, case) avoids failing on harmless formatting
differences.

## Example 2 — Real-world: a pairwise judge with order swapping

Two prompt versions produce answers A and B for each case. The judge compares them twice, once as
(A, B) and once as (B, A), and a win only counts when both verdicts agree. Inconsistent verdicts are
recorded as ties and reviewed by a human.

**Why this works:** order swapping neutralizes position bias, and ties flag cases where the judge
isn't reliable.

## Example 3 — Pitfall: the five-example eval

A team tests a new prompt on the five inputs they used while writing it, sees perfect results, and
ships. In production, accuracy on real traffic is far lower.

**What goes wrong:** the test set was tiny and identical to the development examples, so it measured
memory, not quality. **Fix:** a larger test set drawn from real inputs, with edge cases, kept separate
from the examples used while writing the prompt.

# Common Mistakes

- **Vague criteria** ("good answers") that can't be measured.
- **Tiny test sets** that only contain the examples used to build the prompt.
- **Trusting an LLM judge** without a rubric, order swapping, or calibration.
- **Grading with the same model** that generated the outputs.
- **Running evals once** instead of on every prompt and model change.

# Best Practices

- Write **specific, measurable** criteria with targets across all relevant dimensions.
- Build test sets from **real inputs plus edge and adversarial cases**; favor volume.
- **Grade with code** wherever possible; use a **calibrated, rubric-based judge** from a different
  model for the rest; keep **humans** in the loop for spot checks.
- Run evals as **regression tests** in version control and CI.
- **Monitor production** and turn every real failure into a new test case.

# Summary

- Good evaluation starts with **specific, measurable, achievable, relevant** success criteria.
- A **test set** should mirror real inputs and include edge cases; more automated cases beat a few
  hand-graded ones.
- Combine **code-based**, **LLM-based**, and **human** grading.
- **LLM judges** can match human agreement levels but show **position, verbosity, and
  self-enhancement** biases; use rubrics, order swapping, a different model, and calibration.
- Treat evals as **regression tests** and keep learning from **production monitoring**.

# Flash Cards

Q: What four qualities make good success criteria, according to Anthropic's guide?
A: Specific, measurable, achievable, and relevant.

Q: What are Anthropic's three principles for designing evaluations?
A: Be task-specific (including edge cases), automate when possible, and prioritize volume over quality.

Q: What three biases did Zheng et al. (2023) find in LLM judges?
A: Position bias, verbosity bias, and self-enhancement bias.

Q: How do you counter position bias in pairwise judging?
A: Run each comparison in both orders and count a win only when the verdicts agree.

Q: What is prompt stability, and how do you measure it?
A: How consistent output quality is across repeated runs; run each test case several times and count disagreements.

Q: What should you do when a bug is found in production?
A: Add it to the test set as a new case before fixing it, so a regression would be caught.

# Exercises

### Easy
Write three success criteria with numeric targets for a prompt you use. For each, say how you would
measure it (code, judge, or human).

### Medium
Create a YAML test set of 20 cases for a classification or extraction prompt, including at least 5
edge cases. Run the harness from this lesson and record accuracy and the number of unstable cases.

### Challenging
Build an LLM-as-a-judge rubric for a generation task. Grade 20 outputs with it, then grade the same 20
yourself. Calculate how often you and the judge agree, swap answer order for pairwise comparisons to
check for position bias, and adjust the rubric until agreement improves.

# Further Reading

- Anthropic — *Define success criteria and build evaluations*:
  <https://platform.claude.com/docs/en/test-and-evaluate/develop-tests>
- OpenAI — *Evaluation best practices*:
  <https://platform.openai.com/docs/guides/evaluation-best-practices>
- Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* (2023):
  <https://arxiv.org/abs/2306.05685>
- PyYAML documentation: <https://pyyaml.org/wiki/PyYAMLDocumentation>
- Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, 2025),
  section 2.2 (stochastic responses and prompt stability).
