# QA in the Age of AI-Accelerated Development

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

## What this research does

Many companies are hitting the same wall: as teams adopt agentic AI for code generation, code output accelerates, and existing testing (both manual and automated) cannot cope. The underlying problem (traditional "testing-after" straining under scale) is not new; agents have multiplied it to the point where the industry's previous coping mechanisms no longer work.

This research does two things:

1. Diagnoses what changed qualitatively under agents: the two debts (comprehension, intent), the generative ratification loop, the Boehm-curve reshape. Explains why current industry responses (Direction 1/2 appraisal tools) hit structural ceilings.

2. Formulates four conditions any solution has to satisfy, and advances one candidate (AI-enabled collaborative building) as a testable hypothesis.

The proposal is not a settled answer; it is one Direction 3 candidate that needs empirical validation.

## Reading order

Each page has forward/back navigation in its footer.

1. [analysis.md](analysis.md) — hub: problem statement, foundational premise, map of the research
2. [analysis-pre-ai.md](analysis-pre-ai.md) — pre-AI baseline: "testing-after" was already hitting ceilings
3. [analysis-agents.md](analysis-agents.md) — what changes when agents enter: the two debts emerge, Boehm's curve in the AI era
4. [analysis-lifecycle.md](analysis-lifecycle.md) — what happens to compensation artifacts over time: the generative ratification loop
5. [analysis-research-question.md](analysis-research-question.md) — the asymmetry between the two debts; four conditions any solution must satisfy
6. [proposal.md](proposal.md) — AI-enabled collaborative building as one Direction 3 candidate
7. [evaluation.md](evaluation.md) — assessment of Direction 1/2 industry responses (Claude Code Review, JiTTests)
8. [references.md](references.md) — annotated sources

## Status

Active research, emerging from discussion on [GitHub](https://github.com/BeyondQuality/beyondquality/discussions/28). The proposal is a hypothesis that needs empirical validation (see proposal §5). Everything here is open to critique and iteration.
