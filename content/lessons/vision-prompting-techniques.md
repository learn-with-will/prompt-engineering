---
slug: vision-prompting-techniques
title: "Vision and Multimodal Prompting"
topic: multimodal-meta
kind: technique
summary: "Prompt multimodal models with images, architectural diagrams, OCR documents, and coordinate bounding boxes."
tags: [vision, multimodal, images, ocr]
related: [cross-model-prompt-portability, prompt-migration-strategies, native-structured-outputs]
---
> **In one line:** Vision prompting pairs high-resolution imagery with explicit spatial guidance, coordinate bounding boxes, and OCR transcription tasks.

## The idea

Frontier language models (GPT-4o, Claude 3.7 Sonnet, Gemini 2.0/1.5) are natively multimodal. Rather than relying on separate optical character recognition (OCR) or computer vision classification models, multimodal LLMs process image pixel patches directly through their transformer layers.

Effective vision prompting requires understanding how models 'see':
- **Resolution and Tiling**: Models downsample large images into grids of fixed-size tiles (e.g. 512x512 pixels). Dense architectural diagrams or tiny text in low-resolution images can blur across tile seams. Supply high-resolution images when small text or fine details matter.
- **Spatial Grounding**: When inspecting complex images (such as UI mockups or medical scans), prompt the model to describe the image's layout and coordinates first (*"Identify the elements in the top-left navigation bar first..."*).
- **OCR & Extraction**: Models excel at reading text from photographed receipts, whiteboard drawings, and scanned PDFs, transcribing them directly into structured JSON.

| Vision Task | Prompting Strategy | Key Directive Example |
|---|---|---|
| **Document OCR** | Transcribe text maintaining spatial structure | "Transcribe this receipt into JSON. Do not correct typos in original text." |
| **Diagram Analysis** | Trace sequential arrows and components | "Identify all microservice boxes and describe each connecting arrow in order." |
| **UI to Code** | Generate frontend layout from mockup | "Generate Tailwind CSS HTML replicating the exact colors and grid in this screenshot." |

## See it

```python
import base64
from openai import OpenAI

client = OpenAI()

def analyze_system_architecture(image_path: str) -> str:
    with open(image_path, "rb") as img:
        b64 = base64.b64encode(img.read()).decode("utf-8")
        
    prompt = "Examine this diagram: 1. List services 2. Trace data flow 3. Identify SPOFs."
    res = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
            ]
        }]
    )
    return res.choices[0].message.content
```

## Go deeper

When asking models to detect specific objects or UI components, request normalized **bounding box coordinates** (`[ymin, xmin, ymax, xmax]` on a 0–1000 scale). Forcing the model to output coordinates requires it to attend to the exact spatial pixel boundaries of the object, significantly reducing visual hallucinations.

> **Tip:** Crop unnecessary margins or irrelevant backgrounds before submitting images to reduce tile token consumption and focus attention.

## Watch out

- Submitting blurry, low-contrast photos of dense documents and expecting 100% OCR accuracy.
- Assuming multimodal models can accurately calculate spatial measurements (e.g. estimating exact distances in meters).

## Remember

- Multimodal models process images by dividing them into high-resolution pixel tiles.
- Effective vision prompts provide explicit spatial scanning order and coordinate guidance.
- Requesting bounding box coordinates forces spatial grounding and eliminates visual hallucination.
