---
name: brainstorming
description: "Brainstorm ideas, explore requirements, and produce a written design spec before implementation. Use when: designing a feature, planning architecture, scoping a project, writing a spec, exploring approaches, or any creative work that needs intent clarification before code."
---

# Brainstorming Ideas into design

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

## Checklist
You MUST create a task for each of these items and complete them in order:

1. Explore project context — check files, docs, recent commits
2. Ask clarifying questions — one at a time, understand purpose/constraints/success criteria
3. Propose 2-3 approaches — with trade-offs and your recommendation
4. Present design — in sections scaled to their complexity, get user approval after each section
5. Write the spec — save the approved design to a markdown file (see "Writing the spec" below)
6. Spec self-review — run through the self-review criteria checklist (see "Spec Self-Review Criteria" below)
7. User reviews written spec — ask user to review the spec file before proceeding

## The Process
**Understanding the idea:**

- Check out the current project state first (files, docs, recent commits)
- Before asking detailed questions, assess scope: if the request describes multiple independent subsystems (e.g., "build a platform with chat, file storage, billing, and analytics"), flag this immediately. Don't spend questions refining details of a project that needs to be decomposed first.
- If the project is too large for a single spec, help the user decompose into sub-projects: what are the independent pieces, how do they relate, what order should they be built? Then brainstorm the first sub-project through the normal design flow. Each sub-project gets its own spec → plan → implementation cycle.
- For appropriately-scoped projects, ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**

Once you believe you understand what you're building, present the design
Scale each section to its complexity: a few sentences if straightforward, up to 200-300 words if nuanced
Ask after each section whether it looks right so far
Cover: architecture, components, data flow, error handling, testing
Be ready to go back and clarify if something doesn't make sense

**Writing the spec:**

Once the user approves the design, write it to a file:
- Save as `specs/<project-or-feature-name>.md` in the workspace root (create the `specs/` folder if needed)
- Structure the spec with clear sections: Overview, Architecture, Components, Data Flow, Error Handling, Testing Strategy
- Each section should reflect what was discussed and approved — no new decisions
- The spec is the single source of truth for implementation; anything not in the spec is out of scope

**Design for isolation and clarity:**

Break the system into smaller units that each have one clear purpose, communicate through well-defined interfaces, and can be understood and tested independently
For each unit, you should be able to answer: what does it do, how do you use it, and what does it depend on?
Can someone understand what a unit does without reading its internals? Can you change the internals without breaking consumers? If not, the boundaries need work.
Smaller, well-bounded units are also easier for you to work with - you reason better about code you can hold in context at once, and your edits are more reliable when files are focused. When a file grows large, that's often a signal that it's doing too much.

**Working in existing codebases:**

Explore the current structure before proposing changes. Follow existing patterns.
Where existing code has problems that affect the work (e.g., a file that's grown too large, unclear boundaries, tangled responsibilities), include targeted improvements as part of the design - the way a good developer improves code they're working in.
Don't propose unrelated refactoring. Stay focused on what serves the current goal.

## Spec Self-Review Criteria

Before handing the spec to the user, run through each item. If any fails, fix the spec first.

- **No placeholders**: Every section has real content. No "TBD", "TODO", or "to be determined".
- **No contradictions**: Decisions in one section don't conflict with another (e.g., "stateless" in architecture but "session store" in data flow).
- **No ambiguity**: A developer reading this spec can implement it without guessing intent. Vague phrases like "handle appropriately" or "as needed" must be replaced with concrete behavior.
- **Scope is bounded**: The spec says what is included AND what is explicitly out of scope.
- **Dependencies are identified**: External services, libraries, APIs, or other specs this work depends on are listed.
- **Error paths are covered**: Each component describes what happens when things go wrong, not just the happy path.
- **Testability**: Each component has clear success criteria — you can describe how to verify it works.
