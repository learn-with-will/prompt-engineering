---
slug: auto-cot-mechanics
title: "Automatic Chain of Thought (Auto-CoT)"
topic: advanced-reasoning
kind: technique
summary: "Automate few-shot exemplar creation by clustering dataset queries and generating demonstrations with zero-shot CoT."
tags: [auto-cot, clustering, automation, few-shot]
related: [chain-of-thought-prompting, zero-shot-cot, automatic-prompt-engineer]
---
> **In one line:** Auto-CoT clusters dataset queries and uses Zero-Shot CoT to generate diverse, high-quality reasoning demonstrations automatically.

## The idea

Manual Few-Shot Chain-of-Thought prompting requires human experts to hand-craft multiple reasoning demonstrations, which is slow, expensive, and prone to human author bias. Conversely, Zero-Shot CoT (`"Let's think step by step"`) is effortless but consistently scores lower accuracy than well-curated few-shot exemplars.

In 2022, Zhuosheng Zhang and colleagues (*Automatic Chain of Thought Prompting in Large Language Models*, arXiv:2210.03493) introduced **Auto-CoT** to bridge this gap:
1. **Question Clustering**: Embed all questions in a dataset and cluster them into $k$ distinct semantic groups (e.g. using k-means on sentence embeddings).
2. **Representative Selection**: For each cluster, select the question closest to the cluster centroid. This guarantees semantic diversity across the demonstration bank.
3. **Reasoning Generation**: Use Zero-Shot CoT (`"Let's think step by step"`) to automatically generate intermediate reasoning chains for the selected centroid questions.
4. **Assembly**: Combine the generated question-reasoning pairs into a permanent few-shot prompt.

| Method | Human Effort Required | Demonstration Diversity | Benchmark Accuracy |
|---|---|---|---|
| **Manual Few-Shot CoT** | High (human writes all steps) | Often low (author bias) | High |
| **Zero-Shot CoT** | None | Zero (no demonstrations) | Moderate |
| **Auto-CoT** | Zero (fully automated pipeline) | High (guaranteed by clustering) | Matches or exceeds manual CoT |

## See it

```python
# Conceptual pipeline of Auto-CoT exemplar creation
def generate_auto_cot_prompt(dataset_questions: list[str], k_clusters: int = 4) -> str:
    # 1. Cluster questions into k groups using embeddings
    clusters = cluster_by_embeddings(dataset_questions, k=k_clusters)
    
    exemplars = []
    for cluster in clusters:
        # 2. Select centroid question
        centroid_q = cluster["centroid_question"]
        # 3. Generate reasoning chain with Zero-Shot CoT
        chain = call_llm(f"Q: {centroid_q}
A: Let's think step by step.")
        exemplars.append(f"Q: {centroid_q}
A: {chain}")
        
    # 4. Assemble the automated few-shot prompt
    return "

".join(exemplars)
```

## Go deeper

Auto-CoT includes automated quality filtering. If an automated reasoning chain exceeds length thresholds or produces malformed text, the algorithm discards that question and samples the second-closest point to the cluster centroid. This automated pruning ensures that only clean, well-formed demonstrations enter the final prompt.

> **Tip:** You can apply Auto-CoT to your internal customer support ticket backlog to automatically generate few-shot triage prompts without manual writing.

## Watch out

- Skipping the clustering step and selecting questions randomly, which risks duplicating similar exemplars.
- Failing to inspect generated demonstration chains for subtle calculation slips before production deployment.

## Remember

- Auto-CoT automates few-shot exemplar creation through embedding clustering and Zero-Shot CoT.
- Semantic clustering guarantees that demonstrations are diverse and representative of the problem space.
- Delivers the high accuracy of few-shot prompting with zero manual demonstration authoring effort.
