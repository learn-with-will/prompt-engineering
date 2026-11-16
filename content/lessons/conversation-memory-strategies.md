---
slug: conversation-memory-strategies
title: "Conversation Memory Strategies"
topic: chaining-context
kind: pattern
summary: "Manage multi-turn conversation history using sliding windows, summarization buffers, and entity key-value stores."
tags: [memory, conversation-history, buffer, chat]
related: [context-manager-pattern, prompt-caching-mechanics, document-placement-in-context]
---
> **In one line:** Multi-turn conversation memory must be pruned, summarized, or indexed to prevent context overflow and escalating costs.

## The idea

Large language models are inherently **stateless**. They remember nothing between API calls. To create the illusion of a continuous conversation, client applications must append the entire historical transcript of user messages and assistant replies into the `messages` array for every new turn.

In extended conversations, this naive append-all strategy causes three critical problems:
1. **Token Exhaustion**: The conversation eventually hits the context window ceiling and crashes.
2. **Escalating Costs**: You pay for the entire history over and over on every single turn.
3. **Context Pollution**: Outdated topics, resolved bugs, or obsolete preferences confuse the model's focus.

Production systems govern conversational history using three primary memory architectures:
- **Sliding Window**: Retains only the most recent $K$ turns (e.g. last 6 messages), discarding older turns.
- **Summary Buffer**: Periodically condenses older conversational turns into a running summary paragraph stored in the system prompt.
- **Entity Memory**: Extracts key facts (user preferences, project details) into a persistent key-value store injected into context.

| Memory Strategy | Pros | Cons | Ideal Use Case |
|---|---|---|---|
| **Sliding Window** | Dead simple; low compute overhead | Sudden amnesia regarding decisions made >K turns ago | Casual chat, simple task bots |
| **Summary Buffer** | Retains high-level historical narrative | Summarization calls add latency and token cost | Long advisory sessions, customer support |
| **Entity / Fact Store** | Exact recall of key facts across sessions | Requires separate extraction pipeline | Personal assistants, persistent user profiles |

## See it

```python
# Implementing a Sliding Window Memory with Running Summary Buffer
class ConversationManager:
    def __init__(self, window_size: int = 4):
        self.window_size = window_size
        self.summary = ""
        self.history = []

    def add_turn(self, role: str, text: str):
        self.history.append({"role": role, "content": text})
        # When history exceeds window, compress the oldest turns into summary
        if len(self.history) > self.window_size * 2:
            oldest_turns = self.history[:2]
            self.history = self.history[2:]
            self.summary = call_llm(
                f"Update running summary with these turns:
Summary: {self.summary}
Turns: {oldest_turns}"
            )

    def get_messages_payload(self) -> list[dict]:
        system_content = f"You are a helpful assistant.
Conversation Summary: {self.summary}"
        return [{"role": "system", "content": system_content}] + self.history
```

## Go deeper

Hybrid memory architectures combine running summaries with semantic search. Older conversation archives are embedded into a local vector store. When the user asks *"What did we decide about the database three weeks ago?"*, the system retrieves relevant historical messages and injects them dynamically into the current turn's context.

> **Tip:** Clear or summarize conversation state whenever a user switches topics to prevent irrelevant past context from biasing new tasks.

## Watch out

- Naively appending all turns forever until an API call fails with a context length error.
- Telling the model in chat to "forget what we said earlier"; past tokens remain in context unless pruned in code.

## Remember

- APIs are stateless; multi-turn memory requires re-sending prior messages on each turn.
- Unchecked history accumulation leads to context overflow, degraded focus, and escalating costs.
- Combine sliding windows, periodic summarization, and entity stores to manage conversation state.
