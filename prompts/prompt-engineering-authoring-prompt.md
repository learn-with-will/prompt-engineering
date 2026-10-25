# Prompt Engineering Course: Authoring Contract

This file is the contract every lesson and quiz in this course follows. It records the voice, the
sources, the facts that are easy to get wrong, and the lesson and quiz format. Vendor facts below
were checked against the vendors' own documentation on **2026-10-25**, and research claims against
the papers' arXiv abstracts. Vendor APIs change fast (sampling parameters are a live example), so
re-verify any volatile fact before editing a lesson that uses it.

## Where the course comes from

The curriculum was designed from two books, then re-grounded in primary sources:

1. **Mark Austin, *How to Become a Prompt God: Mastering Advanced Prompt Engineering for AI*
   (2025).** A light, practical book. It contributes the beginner arc (clarity, specificity,
   structure, personas, constraints, iteration), the named frameworks **C.R.E.A.T.E.** (Context,
   Role, Examples, Action, Tone, Experiment), **S.P.E.C.IFY** (Style, Purpose, Examples,
   Constraints), and **S.H.I.E.L.D.** (Scrutinize, Human-centric, Inclusive, Evaluate, Legal,
   Document), plus meta-prompting, cross-model work, automation, and career advice.
2. **Shivendra Srivastava and Naresh Vurukonda, *Prompt Engineering in Action* (Manning, MEAP v4,
   2025), chapters 1-6.** A technical book. (As of 2026-10-25 the old Manning URL for this title
   returns 404, so cite it without a link.) It contributes the elements of a prompt pattern, the
   pattern catalog (Persona, Audience Persona, Question Refinement, Game Play, Template, Meta
   Language Creation, Recipe, Alternative Approaches, Outline Expansion, Semantic Filter, Refusal
   Breaker, Cognitive Verifier, Flipped Interaction, Infinite Generation, Context Manager,
   Reflection, Fact Check List), the techniques (zero/one/few-shot, CoT, self-consistency, ReAct,
   chaining, Auto-CoT, ToT, GoT, generated knowledge, APE, multimodal), and RAG.

**Copyright rule:** write every lesson in our own words with our own examples. Never copy the
books' prose, case studies, or example prompts. Name a framework or pattern and credit its source;
don't reproduce the book's text about it. The books appear in *Further Reading* where a lesson
draws on them.

**Correctness rule:** where a book's claim conflicts with a primary source, the primary source wins
and the lesson says so plainly (see the corrections list below). The books' case-study metrics
("sales up 25%") are illustrative, not evidence; never repeat them as facts.

## Audience and scope

- **Who it's for:** anyone who writes prompts, from a first-time chat user to a developer shipping
  LLM features. The beginner tier needs no coding. The intermediate tier adds a little Python. The
  advanced tier builds systems (RAG, agents, evals) with Python.
- **Model-agnostic:** teach techniques that work across vendors. Name vendors only to cite their
  docs or to show where they differ. Don't rank models. Don't name model versions except in a dated,
  sourced statement.
- **Sibling courses:** the portal's *Claude* course covers one vendor's product family in depth, and
  *AI Agents* goes deeper on agent architecture (memory systems, multi-agent design). Link to them
  rather than duplicating them.

## Voice

- Plain, welcoming English. Define every term the first time it appears. One analogy per lesson
  (the *Real World Analogy* section).
- Practical first: every concept is followed by a prompt or code you can try.
- Honest about limits: say when a technique has costs, when it stopped helping on newer models, and
  when the evidence is mixed.
- Say "as of writing (October 2026)" for anything volatile, and link the page that stays current.
- Prompts go in `text` fences. Code is minimal and runnable; where a call to a model is needed, use
  the `call_llm(prompt, system=None)` stub defined in Lesson 1 so the code works with any provider.
  Lesson 13 shows one real SDK implementation of it.

## Sources (cite these; invent nothing)

**Vendor guides**
- Anthropic, *Prompting best practices*:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
  and the prompt engineering overview:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview>
- Anthropic, *Migrating to API version 2026-10-21*:
  <https://platform.claude.com/docs/en/api/migration-2026-10-21>
- Anthropic, structured outputs: <https://platform.claude.com/docs/en/build-with-claude/structured-outputs>
- OpenAI, prompt engineering guide: <https://platform.openai.com/docs/guides/prompt-engineering>,
  reasoning guide: <https://platform.openai.com/docs/guides/reasoning>, Structured Outputs:
  <https://platform.openai.com/docs/guides/structured-outputs>, and the Responses API reference.
- Google, *Prompt design strategies* (Gemini API):
  <https://ai.google.dev/gemini-api/docs/prompting-strategies>
- OWASP, *Top 10 for LLM Applications 2025*: <https://genai.owasp.org/llm-top-10/>

**Research papers** (arXiv IDs verified)
- Vaswani et al. 2017, *Attention Is All You Need* (1706.03762)
- Brown et al. 2020, *Language Models are Few-Shot Learners* (2005.14165)
- Lewis et al. 2020, *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (2005.11401)
- Zhao et al. 2021, *Calibrate Before Use* (2102.09690)
- Liu et al. 2021, *Generated Knowledge Prompting for Commonsense Reasoning* (2110.08387)
- Wei et al. 2022, *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* (2201.11903)
- Min et al. 2022, *Rethinking the Role of Demonstrations* (2202.12837)
- Wang et al. 2022, *Self-Consistency Improves Chain of Thought Reasoning* (2203.11171)
- Zhou et al. 2022, *Least-to-Most Prompting* (2205.10625)
- Kojima et al. 2022, *Large Language Models are Zero-Shot Reasoners* (2205.11916)
- Yao et al. 2022, *ReAct: Synergizing Reasoning and Acting in Language Models* (2210.03629)
- Zhang et al. 2022, *Automatic Chain of Thought Prompting* (2210.03493)
- Zhou et al. 2022, *Large Language Models Are Human-Level Prompt Engineers* (APE, 2211.01910)
- White et al. 2023, *A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT* (2302.11382).
  The paper defines **16** patterns in six categories (Input Semantics, Output Customization, Error
  Identification, Prompt Improvement, Interaction, Context Control). Audience Persona, Outline
  Expansion, and Semantic Filter are **not** in the paper; attribute them to the book.
- Greshake et al. 2023, *Indirect Prompt Injection* (2302.12173)
- Madaan et al. 2023, *Self-Refine* (2303.17651)
- Turpin et al. 2023, *Language Models Don't Always Say What They Think* (2305.04388)
- Yao et al. 2023, *Tree of Thoughts* (2305.10601)
- Zheng et al. 2023, *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* (2306.05685)
- Liu et al. 2023, *Lost in the Middle* (2307.03172)
- Besta et al. 2023, *Graph of Thoughts* (2308.09687)
- Zheng et al. 2023, *Take a Step Back* (step-back prompting, 2310.06117)
- Zheng et al. 2023, *When "A Helpful Assistant" Is Not Really Helpful* (personas in system prompts,
  2311.10054): 162 roles, 2,410 factual questions, no accuracy gain from personas
- Schulhoff et al. 2024, *The Prompt Report* (2406.06608): taxonomy of 58 LLM prompting techniques
- Anthropic, *Define success criteria and build evaluations*:
  <https://platform.claude.com/docs/en/test-and-evaluate/develop-tests> (criteria: specific,
  measurable, achievable, relevant; evals: task-specific, automate, volume over quality; grade with a
  different model)
- OpenAI Help Center, *What are tokens and how to count them?* (one token is about 4 characters or
  3/4 of a word in English)

If a claim isn't backed by one of these, qualify it or leave it out. No invented numbers,
benchmarks, or "best/fastest" claims.

## High-risk facts checklist (verified 2026-10-25)

### Research numbers you may quote (from the abstracts)
- Zero-shot CoT ("Let's think step by step"): MultiArith **17.7% → 78.7%** and GSM8K **10.4% →
  40.7%** with InstructGPT (text-davinci-002).
- CoT (Wei et al.): a 540B-parameter model with **eight** CoT exemplars reached state of the art on
  GSM8K; the paper says reasoning ability "emerges" in sufficiently large models.
- Self-consistency: samples diverse reasoning paths and picks the most consistent final answer;
  GSM8K **+17.9%**, SVAMP +11.0%, AQuA +12.2%, StrategyQA +6.4%, ARC-challenge +3.9%.
- ReAct: interleaves reasoning traces and actions; on HotpotQA and FEVER it used a simple
  Wikipedia API; ALFWorld/WebShop gains of **34% and 10%** absolute success rate with one or two
  in-context examples.
- Tree of Thoughts: Game of 24, GPT-4 with CoT solved **4%**, ToT **74%**.
- Graph of Thoughts: sorting quality **+62%** over ToT while cutting cost **>31%**.
- Least-to-most: SCAN at least **99%** with 14 exemplars vs **16%** with CoT (code-davinci-002).
- Step-back prompting: PaLM-2L MMLU Physics +7%, Chemistry +11%, TimeQA +27%, MuSiQue +7%.
- APE: generated instructions matched or beat human-written ones on **19 of 24** tasks.
- Self-Refine: about **20%** absolute average improvement across 7 tasks.
- LLM-as-a-judge: strong judges reached **over 80%** agreement with humans (the level humans agree
  with each other), with **position, verbosity, and self-enhancement** biases.
- Min et al.: randomly replacing labels in demonstrations "barely hurts"; the label space, input
  distribution, and format matter.
- Zhao et al.: few-shot accuracy can swing from near chance to near state of the art with the
  format, examples, and their **order**; biases toward recent and common answers.
- Lost in the middle: performance is often highest when relevant information is at the
  **beginning or end** of the context.
- Turpin et al.: CoT explanations can **misrepresent** the real reason for an answer.
- GPT-3 had **175 billion** parameters (Brown et al.). GPT-3's context window was 2,048 tokens.

### Vendor facts
- **Anthropic:** golden rule ("Show your prompt to a colleague with minimal context..."), the
  "brilliant but new employee" framing, **3–5 examples** in `<example>` tags, XML tags, roles in
  the system prompt, long documents **at the top** and the query **at the end** ("can improve
  response quality by up to 30 percent in tests"), quote extraction first, "tell Claude what to do
  instead of what not to do", "prefer general instructions over prescriptive steps" for thinking,
  manual CoT with `<answer>` tags only as a fallback when thinking is off, soften "CRITICAL: You
  MUST" language for newer models.
- **Prefill:** prefilled assistant responses are **not supported starting with Claude 4.6 models**
  (400 error). Use structured outputs or instructions instead.
- **Claude sampling parameters:** on API version **2026-10-21**, a Messages request that sends
  `temperature`, `top_p`, or `top_k` returns a **400 error on every model**, even at the default.
  Requests sample with the defaults (temperature 1.0). Claude 4.7 and later already accepted only
  the defaults. On `2023-06-01`, older models still accept other values.
- **Gemini:** the Gemini prompting guide recommends **always including few-shot examples**, warns
  that too many can overfit, says earlier Gemini 3 models should keep temperature/top_p/top_k at
  defaults "to avoid degraded reasoning performance", and that Gemini 3.6+ and Gemini 4 **ignore**
  custom values. It recommends putting context first and the question at the end.
- **OpenAI:** the Responses API documents `temperature` **between 0 and 2** and `top_p`, and says
  "We generally recommend altering this or `top_p` but not both." `max_output_tokens` is an upper
  bound that includes reasoning tokens. `instructions` inserts a system/developer message.
  `text.format` with `json_schema` enables Structured Outputs. Reasoning models are steered with
  `reasoning.effort` (values vary by model).
- **Anthropic API shapes (Python SDK):** `client.messages.create(model=..., max_tokens=...,
  system=..., messages=[...])`; structured outputs via `output_config={"format": {"type":
  "json_schema", "schema": {...}}}` or `client.messages.parse(..., output_format=PydanticModel)`
  then `response.parsed_output`; tools have `name`, `description`, `input_schema` (and optional
  `strict: true`); `stop_reason` values include `end_turn`, `max_tokens`, `stop_sequence`,
  `tool_use`, `pause_turn`, `refusal`. Forced `tool_choice` (`any`/`tool`) returns 400 on the
  newest models; use `auto` plus an instruction.
- **OWASP Top 10 for LLM Applications 2025:** LLM01 Prompt Injection, LLM02 Sensitive Information
  Disclosure, LLM03 Supply Chain, LLM04 Data and Model Poisoning, LLM05 Improper Output Handling,
  LLM06 Excessive Agency, LLM07 System Prompt Leakage, LLM08 Vector and Embedding Weaknesses, LLM09
  Misinformation, LLM10 Unbounded Consumption.

### Corrections to the source books (teach the correct version)
- **Tokens are not words or characters.** "max_tokens=280 for a tweet" confuses characters with
  tokens. Use `count_tokens`-style tools or rough rules of thumb, and ask for length in words or
  sentences.
- **A max-token limit truncates; it doesn't make the model concise.** Ask for brevity in the prompt;
  use the limit as a safety cap and check the stop reason.
- **Sampling parameters are fading on frontier models.** Change temperature *or* top_p, not both
  (OpenAI's advice), and expect newer models and APIs to ignore or reject them.
- **Asking for sources is not verification.** A model without retrieval can produce plausible but
  fabricated citations, and its stated reasoning may not be why it answered (Turpin et al.).
- **"Reset the context" in a chat doesn't delete earlier messages.** They're still in the context
  window. Start a new conversation, or (in the API, which is stateless) remove them from the
  messages you send.
- **Self-consistency needs diverse samples and a vote on extracted final answers**, not on the
  full text of each response, and not at temperature 0.
- **A language model is not a random-number generator.** Don't use it for passwords or secrets; use
  a cryptographic generator such as Python's `secrets` module. A chat model also can't "secretly
  hold" a number between turns unless it's written into the conversation.
- **Few-shot examples leak surface features.** The model may copy names, units, or structure from an
  example into an unrelated answer.
- **A persona changes style and focus, not knowledge.** It can't make the model know facts it
  doesn't know, and it can make wrong answers sound more confident.
- **Privacy depends on the provider and plan.** Say "check your provider's data-use settings";
  don't claim every input becomes training data.
- **Exact arithmetic belongs in code or tools.** Models can make arithmetic slips; have them write
  or call code for exact results.
- **Framework APIs churn.** Don't teach a specific agent framework's API (several of the book's
  LangChain calls are deprecated); teach the loop and let readers map it onto any framework.

## Lesson format

Front-matter: `id` (lesson-NN), `slug`, `title`, `level`, `order` (1-24), `duration`, `tags`
(exactly 5), `summary` (one sentence). Then these H1 sections, in order:

Learning Objectives · Why It Matters · Concept Explanation (### subsections) · Key Terminology ·
Options and Trade-offs (a table) · Worked Example · Real World Analogy · Examples (## Example 1/2/3 =
basic, real-world, pitfall) · Common Mistakes · Best Practices · Summary · Flash Cards (6 Q:/A:) ·
Exercises (### Easy/Medium/Challenging) · Further Reading.

Code fences: only `python`, `json`, `bash`, `yaml`, `text`.

## Quiz format

`public/quizzes/lesson-NN.json`: `id` quiz-lesson-NN, `lessonId` lesson-NN, `title`, `passingScore`
60, 5-6 questions that cover all five types (single-choice, multiple-choice, fill-blank, ordering,
match-pair). Each question has an `explanation`, every answer must be traceable to the lesson, and
match-pair `left`/`right` values must be unique within a question.

## Validation

Run `npm run manifest` then `npm run validate` (24↔24↔manifest, sections, tags, flash cards, fences,
quiz schemas), then `npm run build`.
