---
slug: verification-hierarchy
title: "The Verification Hierarchy"
topic: reasoning-verification
kind: concept
summary: "Layer deterministic code assertions, model critics, and human review for mission-critical reliability."
tags: [verification, architecture, reliability, guardrails]
related: [reflection-and-fact-checking, self-consistency-voting, generate-critique-revise-loop]
---
> **In one line:** Reliable enterprise AI combines deterministic code validation, secondary LLM critics, and human review in a defense-in-depth hierarchy.

## The idea

No single verification method is sufficient for production LLM systems. Trusting an LLM to self-verify its own output is necessary but insufficient; models can hallucinate during the verification step just as easily as during initial generation.

High-reliability engineering employs a **Verification Hierarchy** composed of three escalating layers:
1. **Layer 1: Deterministic Code Checks**: Fast, mathematical, and programmatic. Validates schema conformity (JSON/Pydantic), regex patterns, status codes, word limits, and mathematical calculations using traditional Python or database logic. Cost: microseconds, zero tokens.
2. **Layer 2: Model-Based Critics & Evals**: Secondary LLM calls that inspect semantic nuances, tone, adherence to complex guidelines, and alignment. Employs independent evaluator prompts or separate model families to eliminate self-preference bias. Cost: milliseconds to seconds, moderate tokens.
3. **Layer 3: Human-in-the-Loop (HITL)**: Expert human review reserved for high-stakes decisions (legal contracts, medical advice, financial transactions exceeding safety thresholds). Cost: minutes to hours, highest monetary expense.

| Verification Layer | Technology | Primary Job | Latency & Cost |
|---|---|---|---|
| **1. Code Assertions** | Python, Pydantic, Regex, Linters | Syntax, types, schemas, arithmetic | <1ms / $0.00 |
| **2. Model Critic** | Separate LLM (e.g. Claude inspecting GPT) | Tone, completeness, policy checks | ~1-2s / fractions of a cent |
| **3. Human Review** | Domain specialist dashboard | Legal liability, edge cases, final sign-off | Minutes / Highest cost |

## See it

```python
# Tiered verification architecture in Python
def process_customer_payout(claim_text: str) -> dict:
    # Generation step
    raw_response = call_llm(f"Extract payout details: {claim_text}")
    
    # Layer 1: Deterministic code validation
    try:
        payout_data = parse_and_validate_payout_schema(raw_response)
        assert payout_data["amount"] > 0, "Payout amount must be positive"
    except Exception as e:
        return {"status": "FAILED_CODE_CHECK", "error": str(e)}
        
    # Layer 2: Automated LLM Policy Critic
    policy_check = call_llm(f"Check payout compliance: {payout_data}")
    if "VIOLATION" in policy_check:
        return {"status": "POLICY_REJECTED", "details": policy_check}
        
    # Layer 3: Conditional Human Escalation
    if payout_data["amount"] > 10_000:
        return {"status": "ESCALATED_TO_HUMAN", "record": payout_data}
        
    return {"status": "APPROVED", "record": payout_data}
```

## Go deeper

By placing deterministic code checks at Layer 1, you filter out trivial formatting and syntax errors before spending tokens on Layer 2 LLM critics. Furthermore, Layer 1 checks (such as verifying that all required JSON keys exist) provide precise, deterministic error messages that can be fed back into retry loops.

> **Tip:** Never use an expensive LLM call to verify something that can be verified with a 2-line Python assert or regex check.

## Watch out

- Relying exclusively on Layer 2 (LLM grading LLM) without deterministic code guardrails.
- Routing routine, low-risk queries to Layer 3 human review, creating massive operational bottlenecks.

## Remember

- The verification hierarchy layers code assertions, LLM critics, and human reviews.
- Layer 1 code checks handle syntax, schemas, and calculations deterministically.
- Layer 2 model critics evaluate semantic nuance, reserving Layer 3 human review for high-risk edge cases.
