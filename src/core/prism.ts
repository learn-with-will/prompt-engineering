// Prism core + the languages the prompt-engineering lessons use. `python`
// covers the programmatic examples (prompt templates, few-shot assembly,
// self-consistency voting, chaining, a toy RAG retriever, eval harnesses, and
// SDK calls). `json` covers structured outputs, JSON Schemas, and API bodies.
// `bash` covers installs and environment setup; `yaml` covers eval and CI
// config files. Plain `text` fences (the prompts themselves, transcripts, and
// model output) are left unhighlighted on purpose: a prompt is prose.
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';

export default Prism;
