# QA in the Age of AI-Accelerated Development

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

---

## 1. Problem Statement

Many companies are hitting the same wall: as teams adopt agentic AI for code generation, code output accelerates. However, existing testing, both manual and automated, cannot cope with the volume of code being produced. The underlying problem (traditional testing-after straining under scale) is not new; AI has multiplied it to the point where the industry's previous coping mechanisms no longer work.

There are two symptoms:

1. **Traditional "testing-after" cannot keep up when code is produced at much higher pace**. Verifying that the new code does what it was supposed to and doesn't break anything else takes time, and by the time testers finish their work with one task (doing "manual" testing or writing autotests), the inspection queue grows so fast that noone can keep up with it.

2. **Traditional "testing-after" can't test properly**. For the humans to verify a feature (or build an automated test capable of this verification), they need two types of understanding: **why** and **how** feature code was built. Since the code production is now delegated to agents, **comprehension debt** grows: nobody carries the deep understanding of *how* the code works. Similarly, **intent debt** emerges and grows: people start losing knowledge of "why" this code exists, what business problem it solves, what tradeoffs were accepted, etc. This means that any inspection and verification is getting harder.

This means that traditional "testing-after" is not fit for the era of AI-assisted development.

This research is devoted to analysing the symptoms, formulating the problem behind them, and suggesting solutions.

---

## 2. Foundational premise: quality is not a property of code in isolation

Whether code is "good enough" depends on what business problem it solves, what the consequences of failure are, what lifecycle stage the product is in, and what tradeoffs the team has consciously accepted. A prototype and a payment system have different quality requirements even if the code looks identical. This means that any quality assessment (human or automated) that operates only on the code surface without access to this context can only catch superficial issues. The deeper question ("does this code do the right thing?") is unanswerable without domain understanding.

---

## 3. Analysis:

- **[Pre-AI baseline](analysis-pre-ai.md)**: how development and QA worked before agents, the "testing-after" ceiling was imminent.
- **[With agents](analysis-agents.md)**: how the testing and learning process changes when agents take over implementation; why delegating test generation to AI is not an option.
- **[Lifecycle drift](analysis-lifecycle.md)**: how pre-AI compensation mechanisms (docs, tests, ADRs, onboarding material) break when artifacts are generated from AI-generated code. The **generative ratification loop**. 

## 4. Research question and next steps

- **[Research Question](analysis-research-question.md)**: the asymmetry between the two debts, and the four conditions any solution has to satisfy
- **[Proposal: Direction 3 collaborative building](proposal.md)**: the hypothesis this analysis leads to. One candidate addressing three of the four research-question conditions directly, the fourth partially.
- **[Evaluation: Direction 1/2 industry responses](evaluation.md)**: how current industry responses (JiTTests, Claude Code Review) measure up against this framework.

## 5. References
- **[annotated links](references.md)**
