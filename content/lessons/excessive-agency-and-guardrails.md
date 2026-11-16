---
slug: excessive-agency-and-guardrails
title: "Excessive Agency and Guardrails"
topic: rag-and-agents
kind: pitfall
summary: "Mitigate OWASP LLM06 Excessive Agency by scoping permissions, requiring human confirmation, and sandboxing tools."
tags: [excessive-agency, owasp, security, guardrails]
related: [the-react-pattern, defining-tool-specifications, direct-and-indirect-prompt-injection]
---
> **In one line:** Guard against Excessive Agency by restricting tool privileges, sandboxing environments, and requiring human confirmation for high-impact actions.

## The idea

Designated as **LLM06 in the OWASP Top 10 for LLM Applications (2025)**, **Excessive Agency** occurs when an LLM-based agent is granted too much authority, overly broad tool permissions, or access to sensitive systems without human approval gates.

If an autonomous email assistant is given a tool called `delete_email()` with no scoping, an adversarial prompt injection or logical hallucination can cause the agent to wipe out an entire inbox. The damage stems not from model intelligence, but from excessive software permissions granted to a probabilistic system.

Mitigating Excessive Agency requires implementing three engineering guardrails:
1. **Principle of Least Privilege**: Limit tools to read-only operations wherever possible. Instead of giving an agent full database write access, provide access to a restricted stored procedure that updates only a single verified status field.
2. **Human-in-the-Loop Confirmation (HITL)**: Any irreversible or high-impact action (sending an email to a client, deleting files, executing financial payouts, restarting production servers) must pause execution and request explicit human confirmation.
3. **Execution Sandboxing**: Run code execution tools inside isolated Docker containers or WebAssembly runtimes with no network access and strict memory ceilings.

| Tool Permission Level | Permitted Actions | Approval Requirement |
|---|---|---|
| **Read-Only (Low Risk)** | Query database, fetch docs, search logs | Autonomous execution allowed |
| **Reversible Write (Medium)** | Draft email, stage pull request, create ticket | Autonomous execution with audit logging |
| **Irreversible Action (High)** | Delete records, send money, deploy code | **Strict Human Approval Gate Required** |

## See it

```python
# Human-in-the-Loop confirmation gate for sensitive agent actions
def execute_agent_tool(tool_name: str, arguments: dict, user_tier: str) -> str:
    HIGH_IMPACT_TOOLS = ["transfer_funds", "delete_database_record", "send_broadcast_email"]
    
    if tool_name in HIGH_IMPACT_TOOLS:
        # Pause execution and request interactive human authorization
        confirmation = request_human_approval(
            action=tool_name,
            params=arguments,
            warning="This action is irreversible and requires explicit human sign-off."
        )
        if not confirmation.approved:
            return "Action CANCELLED by human operator. Abort this operation."
            
    # Execute verified safe action
    return dispatch_tool_execution(tool_name, arguments)
```

## Go deeper

Never grant an agent a raw `execute_sql(query)` or `execute_bash(command)` tool in production environments. Providing open-ended shell or SQL execution creates catastrophic security exposure. Instead, expose tightly constrained, parameterized API methods like `get_customer_by_id(id: int)` or `restart_service(service_name: Enum)`.

> **Tip:** Require confirmation payloads to display the exact parameters the agent intends to pass, so human operators can verify the arguments before approving.

## Watch out

- Granting autonomous agents direct access to production databases with `DROP TABLE` permissions.
- Bypassing human confirmation for internal emails, enabling indirect injection attacks that spoof executives.

## Remember

- OWASP LLM06 Excessive Agency arises from granting probabilistic agents excessive software permissions.
- Enforce the Principle of Least Privilege: use scoped, parameterized tools rather than raw shell access.
- Require explicit Human-in-the-Loop authorization for any irreversible or high-impact action.
