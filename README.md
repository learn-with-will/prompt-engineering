# Prompt Engineering Learning Portal

A **frontend-only** course on prompt engineering, from beginner to advanced. Read Markdown lessons,
take quizzes, and track your progress, all in the browser. No sign-up, no backend.

Live at **<https://learn-with-will.github.io/prompt-engineering/>**.

> An independent learning course, not affiliated with or endorsed by any AI company. Product names
> such as ChatGPT, Claude, and Gemini are trademarks of their owners.

## What this is

The portal shell is built with React 19, Vite, TypeScript, React Router, Tailwind CSS v4, `marked`,
and PrismJS. It renders a **24-lesson curriculum** that starts with how language models read a prompt
and the habits behind good prompts (clarity, structure, roles, examples, formats, iteration), moves
through the prompt pattern catalog and the core techniques (chain-of-thought, self-consistency,
sampling parameters, structured outputs, chaining, long-context management), and finishes with
production systems: tree- and graph-of-thought reasoning, RAG, tools and ReAct agents, multimodal and
cross-model prompting, meta-prompting, evaluation, security and ethics, and a capstone that ships a
tested prompt.

The curriculum was designed from two books, Mark Austin's *How to Become a Prompt God* (2025) and
Shivendra Srivastava and Naresh Vurukonda's *Prompt Engineering in Action* (Manning, MEAP 2025), and
then re-grounded in vendor documentation and the research papers behind each technique. Every lesson
is written in our own words; where a book's claim conflicts with a primary source, the lesson follows
the primary source and says so. Volatile facts are marked "as of writing (October 2026)."

The course is model-agnostic. Code examples call a `call_llm(prompt, system=None)` placeholder
(defined in Lesson 1) so they work with any provider; Lesson 13 shows one real SDK implementation.

Progress, bookmarks, and quiz scores live in `localStorage` under `prompt-engineering-learning-*`
keys, so nothing leaves your machine.

## Run it locally

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run manifest   # regenerate the course manifest from lesson front-matter
npm run validate   # check lessons, quizzes, manifest, sections, and schemas
```

## How the content works

The app is **data-driven**, so adding a lesson needs no code changes:

1. Write the lesson Markdown in `public/content/<level>/<slug>.md` with YAML front-matter
   (including a `summary`).
2. Add a quiz at `public/quizzes/lesson-NN.json`.
3. Run `npm run manifest` to regenerate `public/content/course-manifest.json` from the front-matter,
   then `npm run validate`.

> **Code fences** must declare one of the highlighted languages: `python` (templates, voting,
> chaining, retrieval, eval harnesses, SDK calls), `json` (schemas and API bodies), `bash`, `yaml`
> (eval cases and prompt cards), or `text` (the prompts themselves, transcripts, output); see
> `src/core/prism.ts`.

## Curriculum

**Beginner, foundations:** what is prompt engineering? · how language models read your prompt ·
clarity and specificity · the anatomy of a prompt · roles, personas, and audience · zero-, one-, and
few-shot examples · output formats and constraints · iterate, debug, and refine.

**Intermediate, patterns and techniques:** the prompt pattern catalog · interaction patterns ·
chain-of-thought reasoning · self-consistency and verification · sampling parameters and randomness ·
structured outputs and JSON · prompt chaining and decomposition · long context and conversation
management.

**Advanced, systems and production:** tree, graph, and step-back reasoning · retrieval-augmented
generation · tools, ReAct, and agents · multimodal and cross-model prompting · meta-prompting and
automatic prompt engineering · evaluating and testing prompts · prompt security, safety, and ethics ·
capstone: ship a production prompt.

## Accuracy: no hallucination

The authoring contract, including a checklist of easy-to-get-wrong facts verified on 2026-10-25 and
the list of corrections to the source books, lives in `prompts/prompt-engineering-authoring-prompt.md`.

**Sources:**

- **Anthropic**: *Prompting best practices*, evaluation guide, structured outputs, and the API
  version 2026-10-21 migration guide (<https://platform.claude.com/docs>)
- **OpenAI**: prompt engineering, reasoning, Structured Outputs, and evaluation guides, and the
  Responses API reference (<https://platform.openai.com/docs>)
- **Google**: *Prompt design strategies* for the Gemini API
  (<https://ai.google.dev/gemini-api/docs/prompting-strategies>)
- **OWASP**: *Top 10 for LLM Applications 2025* (<https://genai.owasp.org/llm-top-10/>)
- **Research papers** on chain-of-thought, self-consistency, ReAct, Tree and Graph of Thoughts,
  least-to-most, step-back, generated knowledge, Auto-CoT, APE, the prompt pattern catalog, RAG,
  lost-in-the-middle, LLM-as-a-judge, indirect prompt injection, and more (full list with arXiv IDs
  in the authoring contract)

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with `BASE_PATH=/<repo>/`
and publishes `dist/` to GitHub Pages.

---

React 19 · Vite · TypeScript · React Router · Tailwind CSS v4 · marked · PrismJS · localStorage.
