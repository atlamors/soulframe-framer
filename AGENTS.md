# Soulframe Framer Agent Workflow

These instructions apply to the entire repository.

## Project lifecycle and user authority

- During prerelease, work in the user-designated checkout on `main`.
- Do not create, switch to, or redirect work into a worktree unless the user explicitly changes this policy.
- The user exclusively controls development-server lifecycle actions. Never start, stop, restart, or replace the localhost server.
- Do not commit, push, create branches, open pull requests, or otherwise publish changes unless the user explicitly requests it.
- Preserve intentional uncommitted changes and avoid unrelated rewrites.

## Primary chat responsibilities

The primary chat is the design and acceptance authority. It should remain available for:

- collaborating with the user on product and visual decisions;
- approving implementation direction and resolving ambiguities;
- controlling the designated in-app browser tab;
- performing final live DOM, screenshot, responsive, and interaction verification;
- reconciling orchestration-agent reports into a user-facing result.

Do not move product decisions into implementation agents when the user is actively collaborating on them.

## First-principles design workflow

For product, system, architecture, and visual-design discussions:

1. Define the desired outcome and who it serves.
2. Establish the smallest set of relevant first principles.
3. Discuss applicable reference architectures as patterns, not templates.
4. Identify motifs, stylistic constraints, and non-negotiable boundaries.
5. Find the foundational problem whose resolution informs downstream decisions.
6. Propose the smallest test that can validate the foundation.

Keep the initial reasoning simple and elegant. Do not produce an end-to-end
design before the foundational premise is agreed upon. Introduce complexity only
when the problem demonstrates that it is necessary.

## Implementation intake and routing

Before implementation begins, the primary chat must declare:

```text
OUTCOME | Concrete user-visible result
CLASS | 1 Direct / 2 Coordinated / 3 Critical
RATIONALE | Why this class applies
STRUCTURE | Primary, orchestrator, writers, and reviewer
SCOPE | Exact files, components, selectors, or behaviors
DONE WHEN | Observable acceptance criteria
VALIDATION | Smallest sufficient verification set
SOFT BUDGET | Expected working time before reassessment
STOP / ESCALATE IF | Conditions that require stopping or reclassification
```

Use the smallest class justified by the expected change:

| Class | Entry criteria | Default structure | Soft budget | Reassessment |
| --- | --- | --- | ---: | --- |
| 1 — Direct | Small, local, understood change without shared state | Primary or one focused writer | 15 minutes | At 10 minutes |
| 2 — Coordinated | Coupled behavior, multiple components, responsive interaction, or useful parallelism | Orchestrator, one writer, one reviewer, and primary acceptance | 30 minutes | At 15 and 25 minutes |
| 3 — Critical | Authentication, persistence, security, migrations, or destructive operations | Orchestrator, exploration, implementation, and independent review | Milestone-based | At every milestone |

Class 1 work does not require an orchestration agent.

Classes 2 and 3 require an orchestration agent before implementation or review workers are dispatched.

Freeze and escalate Class 1 to Class 2 when work expands into shared state, cross-component behavior, more than three files, or a second correction round.

Freeze and escalate Class 2 to Class 3 when authentication, persistence, security, migration, or destructive data behavior enters scope.

Escalation preserves completed work and passed validation. Do not restart the task or repeat completed work solely because its class changed.

## Anti-tinkering guardrails

These rules prevent an implementation stream from becoming more expensive than the product risk it addresses.

The intake record freezes the intended outcome. Discovering an adjacent improvement does not expand the task automatically.

A soft budget is not permission to ship unsafe or broken work. Reaching it requires reassessment; it does not automatically justify more work.

### Mandatory 30,000-foot reassessment

At each reassessment point, answer:

1. What user-visible outcome remains incomplete?
2. Is the remaining work required by the acceptance criteria?
3. What concrete failure occurs if work stops now?
4. Is the current process more expensive than the implementation risk?
5. What is the smallest safe path to completion?

If the remaining work is optional polish, speculative hardening, or unrelated cleanup, record it separately and finish the current task.

### Scope discipline

- Do not widen scope because a nearby improvement is attractive.
- Do not introduce new architecture when an established project pattern satisfies the acceptance criteria.
- Do not turn a bounded correction into a repository-wide audit.
- A new file, subsystem, abstraction, or behavioral requirement outside the intake scope requires explicit justification and reclassification.
- Product decisions remain with the primary chat.

### Correction limits

- One implementation pass and one bounded correction pass are the default.
- A further correction pass requires a concrete unresolved P1 or P2 finding.
- P3 polish and "could improve" observations do not block completion.
- When a correction is smaller than the coordination required to dispatch it, the primary chat may apply it directly after ownership is released or explicitly transferred.

### Agent and infrastructure fallback

- Do not create relay chains of agents to work around task, turn, or concurrency limits.
- After one failed dispatch or unavailable-agent attempt, choose the simplest safe fallback:
  1. reuse an already authorized writer;
  2. transfer the bounded correction to the primary chat; or
  3. stop and ask the user if authority or scope must change.
- Infrastructure troubleshooting must not consume more time than the bounded implementation it supports.
- Orchestration is a coordination mechanism, not a completion requirement in itself.

### Proportional validation

- Test affected breakpoint boundaries and one representative viewport.
- Expand the validation matrix only when a failure suggests a wider regression.
- Prefer targeted typechecking, linting, tests, and interaction checks before broader suites.
- Source review may cover conditions the available environment cannot emulate, provided the limitation is reported.
- Destructive UI tests require a captured and verified restoration path before interaction.
- Do not repeat passing validation unless the relevant code changed.

### Completion rule

Stop when all of the following are true:

- the intake outcome is implemented;
- the stated acceptance criteria pass;
- required validation passes or documented environment blockers are reported;
- no known P1 or P2 issue remains;
- ownership is released; and
- remaining observations are optional polish or future work.

"Could improve" is not equivalent to "must fix."

### Budget overrun report

If a task crosses its soft budget, pause before continuing and report:

```text
STATUS | What is complete
REMAINDER | What is still required
CAUSE | Why the budget was exceeded
RISK IF STOPPED | Concrete user-visible consequence
RECOMMENDATION | Finish, simplify, defer, or reclassify
```

Do not silently continue deeper into a task after a budget overrun.

## Coordinated and critical implementation

The orchestration agent must:

1. Decompose its stream into bounded implementation, audit, and validation tasks.
2. Maintain an ownership ledger for every active writing agent.
3. Coordinate directly with all other active orchestration agents before allowing parallel writes.
4. Review the combined diff and request corrections before returning work to the primary chat.
5. Run or coordinate appropriate typechecking, linting, tests, and diff-integrity checks.
6. Return concise milestone and handoff reports rather than forwarding routine worker traffic.

The primary chat retains final browser QA and user approval even when an orchestration agent owns implementation.

## Concurrent editing contract

Before an agent edits, it must declare:

```text
OWNER | FILE | EXACT COMPONENT/SELECTOR/REGION | MODE | STATUS
```

Where `MODE` is `write` or `read-only`, and `STATUS` is `reserved`, `active`, `frozen`, or `released`.

Rules:

- For Class 1 work, the primary chat or a single writer may self-reserve its exact region after confirming that no active orchestration ledger overlaps it.
- For Classes 2 and 3, an orchestration agent must explicitly confirm a write reservation before the writer begins.
- Active orchestration agents must exchange their ledgers and acknowledge that concurrent write reservations are disjoint.
- Parallel writers may edit different files.
- Parallel writers may edit the same file only when their named components, selectors, or line regions are clearly disjoint and all relevant orchestrators confirm the boundary.
- Ambiguous or overlapping regions must be serialized.
- A formatter, code generator, import organizer, or bulk rewrite that can touch the whole file requires ownership of the whole file.
- Writers must not modify code outside their reserved region without obtaining a new reservation.
- Read-only inspection, audits, and tests require no exclusive lock and may run in parallel.
- After editing, the writer freezes its region for review; ownership is released only after the orchestrator accepts the handoff or assigns a correction.

If an unexpected overlap appears, stop writing, preserve both agents' work, and let the orchestrators reconcile ownership before continuing.

## Agent selection

- Orchestration and integration review: `gpt-5.6-sol` with `high` reasoning.
- Complex architectural, animation, or high-polish implementation: `gpt-5.6-sol` with `xhigh` reasoning.
- Focused code review and accessibility/performance review: `gpt-5.6-sol` with `high` reasoning.
- Bounded read-heavy exploration may use `gpt-5.6-terra` with `medium` reasoning when speed is more valuable than additional depth.

Explicitly set the model and effort when dispatching a role whose needs differ from the project defaults.

## Browser and visual validation

- Treat the live browser as the authoritative visual reference.
- Do not infer visual success solely from source inspection, tests, or ambient URL visibility.
- Only interact with the browser tab explicitly assigned to Codex. Never touch a user-owned tab.
- Viewport resizing is allowed for validation, but restore the Codex-owned tab to the user's requested viewport afterward.
- Never disable device-toolbar mode when the user has asked it to remain enabled.
- Preserve user scroll position and browser state unless a test explicitly requires changing them; restore temporary changes afterward.
- Subagents without a verified browser backend must report that limitation and leave live verification to the primary chat.

### Delegated browser ownership

The primary chat owns the acceptance tab used for final live-browser verification. A subagent with a verified browser backend may open and control a separate Codex-owned tab when its assigned work requires live inspection.

Before interacting with a page, the subagent must declare:

```text
BROWSER OWNER | AGENT | TAB ID | URL/ROUTE | VIEWPORT | MODE | STATUS
```

Where `MODE` is `read-only` or `interactive`, and `STATUS` is `reserved`, `active`, `frozen`, or `released`.

Rules:

- Each new subagent browser assignment defaults to a newly opened tab.
- Each subagent may interact only with its registered tab. It must never select, navigate, resize, close, or otherwise alter the primary acceptance tab, another agent's tab, or a user-owned tab.
- Reusing an existing tab requires an explicit ownership transfer.
- Browser ownership is independent of file ownership. Agents performing browser validation and code changes must maintain both ledgers.
- Agents may resize or enable emulation only in their own tabs and must report the final viewport and device-emulation state in their handoff.
- Tabs share browser-profile state, including authentication, cookies, and storage. Agents must avoid concurrent workflows that mutate shared account or application state unless the orchestrator explicitly serializes them.
- If a tab becomes stale or is closed, its owner must mark it released and register a newly opened tab rather than attaching to an unowned tab.
- When work is handed off, the agent freezes or releases its tab and reports the route, state, viewport, observations, and any remaining checks.
- Delegated browser inspection does not replace final acceptance. The primary chat performs final DOM, screenshot, responsive, and interaction verification.

## Implementation quality

- Prefer narrow, section-specific changes over sweeping global style changes.
- Preserve the established game-inspired visual language.
- Do not apply rounded corners or other broad stylistic changes globally.
- For responsive work, validate affected breakpoint boundaries and one representative viewport. Expand the matrix only when a failure suggests a wider regression.
- Preserve accessibility behavior, including keyboard navigation, focus restoration, Escape handling, reduced motion, touch targets, and safe areas.
- For Classes 2 and 3, do not claim completion until the orchestrator has reviewed the diff and the primary chat has completed any required live-browser acceptance.

## Handoff requirements

Every implementation stream must report:

- entry class, final class, and whether the task escalated;
- files and exact regions changed;
- ownership ledger status;
- implementation decisions and known tradeoffs;
- validation commands and results;
- remaining live-browser checks;
- any server, dependency, browser, git, or environment actions intentionally not performed.
