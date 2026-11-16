# Prompt Engineering Learn

The content of the Prompt Engineering course at <https://learn-with-will.github.io/prompt-engineering/>: 91 short lessons ("bites") in 12 topics, each teaching one idea in 3–5 minutes, plus a bank of 148 quiz questions. It covers foundations (prompt anatomy, tokenization, parameters, cutoffs, prompt vs fine-tuning vs RAG), prompt craft (clarity, specificity, delimiters, CREATE and SPECIFY frameworks, instructions vs demonstrations), personas and few-shot exemplars, output formats (JSON, YAML, Markdown, Pydantic validation, repair patterns), conversational and behavioral patterns (flipped interaction, cognitive verifier, alternative approaches, meta-language), reasoning and verification (Chain-of-Thought, Zero-Shot CoT, Self-Consistency, Least-to-Most, verification hierarchies), APIs and structured outputs (tool calling, JSON schema mode, function calling schemas, response healing), context optimization and chaining (task decomposition, routing, handoffs, prompt caching mechanics), advanced reasoning architectures (Tree of Thoughts, Graph of Thoughts, Step-Back Prompting, reasoning models like o1/o3 and Claude 3.7 Sonnet), RAG and autonomous agents (retrieval pipelines, hybrid search, grounding, ReAct pattern, tool specs, stopping rules, safety boundaries), multimodal and meta-prompting (vision prompting, cross-model portability, migration strategies, meta-prompting, Automatic Prompt Engineer, overfitting prevention), and evals, security, and production operations (rubrics, test sets, LLM-as-a-judge, regression testing, injection defense, system prompt protection, SHIELD ethical framework, prompt cards, release gates, drift monitoring).

This repository holds **content only**. The site itself (lesson reader, quizzes, progress, optional sign-in) is the shared [course shell](https://github.com/learn-with-will/course-shell), which every course uses.

```text
course.json              name, brand colours, home page copy, code languages
content/topics.json      the 12 topics
content/lessons/*.md     one bite per file
content/legacy.json      old long-lesson URLs → the bites that replaced them
quiz/questions.json      the question bank
```

## Working on the course

Clone the shell next to this folder, then run its commands with this folder as the argument:

```bash
git clone https://github.com/learn-with-will/course-shell.git ../course-shell
cd ../course-shell
npm ci
npm run dev -- ../prompt-engineering                 # live preview at http://localhost:4200
npm run validate -- ../prompt-engineering --strict   # the check the deploy runs
```

Node 22.18 or later is required.

## Adding a lesson

1. Create `content/lessons/<slug>.md` with front-matter (`slug`, `title`, `topic`, `kind`, `summary`, `tags`, `related`) and the standard sections.
2. Add questions for it to `quiz/questions.json` with `"topic"` and `"lesson"`.
3. Run `npm run validate -- ../prompt-engineering --strict` from the shell folder.

The rules (length limits, which visual fits which kind of information, the diagram syntax) are in the shell's [CONTENT_GUIDE.md](https://github.com/learn-with-will/course-shell/blob/main/CONTENT_GUIDE.md).

## Accuracy

Facts and techniques are synthesized from academic literature (Wei et al., Zhou et al., Yao et al., Besta et al., Wang et al.), official provider documentation (Anthropic, OpenAI, Google DeepMind), and production industry standards.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which calls the shell's reusable workflow: it validates this course in strict mode, builds it with the latest shell and publishes it to GitHub Pages. To pick up a shell change without a content change, run the workflow by hand from the Actions tab.
