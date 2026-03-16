# References and Context

Annotated links for the AI-era testing research. Each entry includes a brief note on relevance to [the analysis](analysis.md) and [the evaluation](evaluation.md).

---

## Testing under velocity pressure (pre-AI)

- **Sabourin, R. — "Just-In-Time Testing".** [Scribd](https://www.scribd.com/presentation/512576170/Sabourin-102-202-Just-In-Time). Frameworks for testing under time pressure: bug flow, test triage, test ideas generation, developer collaboration. Pre-AI work, but documents the industry's existing velocity mismatch problem. Relevant as prior art — the coping mechanisms (triage, prioritization) address throughput, not the comprehension gap that AI introduces.

## Industry responses to AI-accelerated development

- **Harman, M. (2026) — "The Death of Traditional Testing: Agentic Development Broke a 50-Year-Old Field, JiTTesting Can Revive It".** [Meta Engineering Blog](https://engineering.fb.com/2026/02/11/developer-tools/the-death-of-traditional-testing-agentic-development-jit-testing-revival/). Proposes JiTTests — LLM-generated tests created per code change using mutation testing + LLM assessors. Eliminates test maintenance and adapts to each change. Strong Direction 1/2 response: makes the warden automated and per-change. Does not address comprehension gap, severed feedback loops, or shared understanding (rows 2-6 in our analysis). See [evaluation](evaluation.md) for full assessment.
