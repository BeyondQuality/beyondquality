# DELEGATE-52: source notes

> Laban, Schnabel, Neville. "LLMs Corrupt Your Documents When You Delegate". Microsoft Research, 17 Apr 2026. arXiv:2604.15597v1.
>
> Code: github.com/microsoft/DELEGATE52  |  Data: huggingface.co/datasets/microsoft/DELEGATE52

---

## What the paper does

> Large Language Models (LLMs) are poised to disrupt knowledge work, with the emergence of *delegated work* as a new interaction paradigm (e.g., vibe coding). Delegation requires trust – the expectation that the LLM will faithfully execute the task without introducing errors into documents. We introduce DELEGATE-52 to study the readiness of AI systems in delegated workflows. DELEGATE-52 simulates long delegated workflows that require in-depth document editing across 52 professional domains, such as coding, crystallography, and music notation.

310 work environments across 52 domains, 19 LLMs, 20 consecutive editing interactions per environment. Each environment has a seed document (2–5k tokens), 5–10 editing tasks, and 8–12k tokens of distractor (topically related but irrelevant) context.

Evaluation uses *backtranslation*: every editing task has a forward instruction and an inverse. Applied in sequence, a perfect model returns the original document. Ten round-trips chain into 20 interactions, and the metric is how far the final document has drifted from the seed.

> Our second contribution is the round-trip relay simulation method, which enables us to simulate long-horizon delegated interaction and evaluate LLM performance without requiring annotation or reference solutions. Specifically, we assume every editing task is reversible, defined by a forward instruction and its inverse. Applying both in sequence forms a backtranslation round-trip that, under a perfect model, recovers the original documents exactly.

---

## Finding 1: headline degradation numbers

> Our large-scale experiment with 19 LLMs reveals that current models degrade documents during delegation: even frontier models (Gemini 3.1 Pro, Claude 4.6 Opus, GPT 5.4) corrupt an average of 25% of document content by the end of long workflows, with other models failing more severely.

> At a high level, every model sees its performance degrade over the course of interaction, with average degradations of 50% across tested models by the end of simulation. Even frontier models (Gemini 3.1 Pro, Claude 4.6 Opus, GPT 5.4) degrade documents by 25% on average over 20 interactions.

---

## Finding 2: failures are sparse and catastrophic, not gradual

> We find that models are not failing due to "death by a thousand cuts" (i.e., many small errors). Instead, they maintain near-perfect reconstruction in some rounds, and experience critical failures in a few rounds, typically losing 10-30+ points in a single round trip. These sparse critical failures explain about 80% of total document degradation we observe. Stronger models do not avoid critical failures better; they delay critical failures and experience them in fewer interactions.

> Across all models, critical errors account for 80–98% of total degradation, confirming that score loss is dominated by critical single-step failures rather than gradual accumulation of small errors. By round 20, the majority of runs for all models except Gemini 3.1 Pro have experienced at least one such critical error.

---

## Finding 3: degradation does not plateau

> We find that degradations continue to accumulate in longer relays, with none of the models showing signs of plateauing. The rate of degradation decelerates: the first half of the extended relay (round-trips 5–25) accounts for roughly 2–3× more loss than the second half (25–50), but even the strongest model (GPT 5.4) drops below 60% by the end of a 50-round-trip relay. In summary, as we extend relays from 10 to 50 round-trips, performance continues to degrade, with models introducing novel errors even when tasks repeat.

---

## Finding 4: short-term performance does not predict long-horizon

> We find that short-term performance (after 2 interactions) is not always predictive of long-horizon performance. For instance, GPT 5 and Kimi K2.5 achieve near-identical performance after two interactions (91.5 vs. 91.1) but diverge sharply over time (ending at 48.3 vs. 64.1). Conversely, Gemini 3 Flash trails Mistral Large 3 by 6.4 points early on (76.0 vs. 82.4) but overtakes it by end of simulation (35.8 vs. 35.5). In other words, short interaction simulations are insufficient to understand long-horizon LLM performance, validating the importance of benchmarks that simulate extended interactions.

---

## Finding 5: document size compounds with interaction length

> Each additional 1,000 tokens in a document degrades GPT 5.4's ability to preserve content by roughly 0.7% after two interactions, but 3.6% after 20 interactions, a ~5-fold increase over the course of the interaction. In a nutshell, document size and interaction length compound multiplicatively: the degradation from increased document size snowballs over the course of the interaction.

---

## Finding 6: distractor files in context compound harm over time

> Looking at initial steps in the simulation (2 interactions), removing distractor documents has a small positive effect, improving scores by 0.4–4%. However, over the course of interaction the effect of distractors widens, and we observe improvements of 2–8% by the end of the simulation. In other words, distractor harm compounds with interaction length, and measuring short-term effect of distractors likely underestimates their effects in long, realistic interactions.

---

## Finding 7: agentic tool use does not help (with a basic harness)

> The four tested models perform worse when operated agentically with tools than without, incurring an average additional degradation of 6% by the end of simulation. The best-performing model (GPT 5.4) narrows the gap with an additional degradation of only 3% (71.5% vs. 68.3%).

> In short, under our basic harness, the tested LLMs do not benefit from agentic tool use when completing complex editing tasks in diverse textual domains.

The agentic harness invokes 8–12 tools per task and consumes 2–5× more input tokens, putting models in long-context territory where performance is known to suffer. Tasks require textual reasoning rather than trivial computation, so models default to whole-file rewrites over code execution (GPT 4.1: 75% file rewrites, 10% code; GPT 5.4: 49% file rewrites, 45% code).

---

## Finding 8: programmatic domains work, most others do not

> A per-domain breakdown of end-of-simulation scores (Table 2) reveals that models are not ready for delegated workflows in the vast majority of domains, with models severely corrupting documents (at least -20% degradation) in 80% of our simulated conditions. The Python domain is an outlier: a majority of tested models (17/19) achieve loss-less manipulation, resonating with recent findings on delegated coding workflows (Pimenova et al., 2025). The top model (Gemini 3.1 Pro) is designated as ready (RS@20 ≥ 98%) in 11 of 52 domains.

> In summary, LLMs degrade least on documents that are repetitive, numerical, and structurally dense — properties typical of formal and machine-oriented formats — and most on documents that are natural and lexically diverse — properties typical of human-authored prose. This provides actionable advice for knowledge work delegation: current LLMs are more performant at manipulating structured files (Science & Engineering, Code & Configuration) than natural language documents (Everyday, Creative & Media).

---

## Finding 9: stronger models corrupt, weaker models delete

> Weaker models delete more, corruption dominates for frontier models. In the count-based analysis (Figure 7, main text), for the models with worse performance (GPT 4o, GPT 5 Nano) 70–73% of degradation is attributable to deletion, while for current frontier models (Claude 4.6 Opus, Claude 4.6 Sonnet) deletion only explains 22–27% of observed degradation.

> In short, current LLMs primarily corrupt user documents in delegated workflows. Degradations observed over repeated editing interaction is primarily attributable to the model altering content in a way that is incorrect, hallucinated or distorted, rather than simply deleting content.

---

## Finding 10: image editing degrades far worse than text

> We observe that degradations for image manipulation are severely more pronounced than for textual domains. The best models achieve final reconstruction scores of 28-30%, compared to 70–80% for textual domains. Even after two interactions, no image generation model exceeds 65%, worse than text models after 20 interactions.

> This small-scale experiment suggests that image editing models degrade documents far more severely than text models, and are not ready for delegated work.

---

## Finding 11: jagged frontier, do not generalise across domains

> When delegating work to AI systems, users of LLMs should be cautious not to generalize the capabilities of the LLM in one domain to other domains. Model capabilities follow a jagged frontier (Dell'Acqua et al., 2023), with models exhibiting strong (and sometimes surprising) performance at certain tasks, while making severe errors in others. Current LLMs are ready for delegated workflows in some domains such as Python coding, but not in other less common domains. In general, users still need to closely monitor LLM systems as they operate and complete tasks on their behalf.

---

## Finding 12: low scores are failed execution, not non-compliance

A possible objection: maybe low scores reflect models refusing the edits rather than failing them. The authors test this with an LLM judge on 12,409 individual editing steps.

> Models overwhelmingly attempt instructions. Across all score bins, 93.8% are fully or partially executed. Non-compliance categories (not executed, empty response, hallucinated output) collectively account for only 3.0% of steps in the worst-performing models; among the top-10 best-performing models, non-compliance drops to 1.7%.

> Low scores reflect execution errors, not non-compliance. The critical test is whether steps that produce low reconstruction scores are dominated by non-compliant behaviors. Among steps in the collapsed score bin (<20), 82.3% are classified as fully or partially executed.

---

## Finding 13: rapid model progress

> Our experiments indicate an encouraging trend, for example looking at the GPT family: 16 months separate the GPT 4o and GPT 5.4 models we tested, but benchmark performance increased from 14.7% to 71.5%, indicative of rapid progress.

71.5% still means ~30% corruption.

---

## Finding 14: stated limitations

> Our simulations use single-turn sessions where each instruction fully specifies a task without needing clarification. In practice, users underspecify instructions and iteratively refine intent through multi-turn conversation (Herlihy et al., 2024; Kim et al., 2026), and LLM performance degrades significantly in multi-turn settings (Laban et al., 2025). Extending DELEGATE-52 to multi-turn, multi-session simulations (e.g., via instruction sharding or user simulation (Naous et al., 2025)) would likely amplify degradation.

> Our framework relies on (1) backtranslation and (2) domain-specific parsing for reference-free evaluation, which constrains scope in three ways: tasks are limited to document editing (excluding other knowledge work like communication or planning); edits must be reversible (see Appendix B.3); and evaluation favors structured domains where parsing is tractable.

The 25% / 50% numbers are floors, not ceilings. Real workflows are multi-turn and include irreversible work (communication, planning) that the benchmark excludes.
